-- =============================================================================
-- ATIVIDADES (painel multi-atividade) · Configuração do Supabase
-- Rode este script UMA vez no SQL Editor do seu projeto Supabase.
-- Cria a tabela ÚNICA de respostas (com discriminador `atividade`) e as
-- políticas de acesso (RLS). Os dados são efêmeros (limpos entre aulas) — não
-- há migração: cria a tabela nova, repõe a config (lib/supabase-config.js) e
-- larga a antiga. Ver Spec "Painel do professor multi-atividade".
-- =============================================================================

-- 1) Tabela única de respostas. Uma linha = um grupo, numa atividade, numa aula.
create table if not exists public.respostas (
  id          bigint generated always as identity primary key,
  criado_em   timestamptz not null default now(),
  sessao      text not null,          -- código da AULA (compartilhado entre atividades)
  atividade   text not null,          -- discriminador: 'continuum', 'juri', ...
  grupo       text not null,          -- nome/número do grupo
  pontuacao   int,                    -- genérico; NULL se a atividade não pontua
  dados       jsonb not null          -- payload específico da atividade
);

-- Índice para o painel filtrar rápido por (sessao, atividade).
create index if not exists idx_respostas_sessao_atividade
  on public.respostas (sessao, atividade);

-- Índice ÚNICO (sessao, atividade, grupo): habilita o UPSERT do envio incremental.
-- Cada grupo tem UMA linha por atividade por sessão; reenviar (a cada caso
-- concluído) sobrescreve essa linha via on_conflict em vez de duplicar.
create unique index if not exists respostas_sessao_atividade_grupo_uidx
  on public.respostas (sessao, atividade, grupo);

-- 2) Habilita Row Level Security
alter table public.respostas enable row level security;

-- 3) Acesso: ESCRITA por RPC (alunos anônimos), LEITURA só pelo professor logado.
--
--    Por que RPC em vez de policy de escrita anônima: o envio é um UPSERT
--    (on_conflict), e no Postgres o INSERT ... ON CONFLICT DO UPDATE exige policy
--    de SELECT (ele lê a linha em conflito). Uma SELECT anônima "using(true)"
--    sustentaria o upsert, MAS exporia TODAS as respostas a qualquer um com a
--    chave anon (pública). Para esconder os dados sem quebrar o envio, os alunos
--    gravam por uma função SECURITY DEFINER (escreve ignorando o RLS) e a tabela
--    fica SEM nenhuma policy anônima. Leitura: só o email autorizado, autenticado.

--    3a) Função de escrita (upsert) — SECURITY DEFINER. Trate-a como a única porta
--        de escrita: valida só o suficiente e grava. search_path fixo (segurança).
create or replace function public.enviar_resposta(
  p_sessao text, p_atividade text, p_grupo text, p_pontuacao int, p_dados jsonb
) returns void
language sql security definer set search_path = public as $$
  insert into public.respostas (sessao, atividade, grupo, pontuacao, dados)
  values (p_sessao, p_atividade, p_grupo, p_pontuacao, p_dados)
  on conflict (sessao, atividade, grupo)
  do update set pontuacao = excluded.pontuacao, dados = excluded.dados;
$$;
revoke all on function public.enviar_resposta(text,text,text,int,jsonb) from public;
grant execute on function public.enviar_resposta(text,text,text,int,jsonb) to anon, authenticated;

--    3b) LEITURA restrita ao PROFESSOR (login por email — ver atividades/lib/painel-auth.js).
--        O painel lê com o token do usuário autenticado; só o email autorizado
--        enxerga as respostas. Trocar de professor = trocar o email abaixo.
--        Sem policies anônimas: a chave anon não lê nem escreve a tabela direto
--        (escreve só pela RPC acima).
drop policy if exists "anon_insert_respostas" on public.respostas;
drop policy if exists "anon_update_respostas" on public.respostas;
drop policy if exists "anon_select_respostas" on public.respostas;
drop policy if exists "owner_select_respostas" on public.respostas;
create policy "owner_select_respostas" on public.respostas
  for select to authenticated
  using ( (auth.jwt() ->> 'email') = 'henriquealvarenga@gmail.com' );

-- 4) Faxina automática (pg_cron): apaga respostas com mais de 30 dias.
--    Os dados são efêmeros e não-pessoais; sem isso o banco só cresce. Roda todo
--    dia às 04:00 UTC (~01:00 BRT, fora de aula). Idempotente: reagenda o job.
--    criado_em é definido no INSERT e NÃO muda no upsert, então marca a 1ª
--    criação da linha do grupo.
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'faxina_respostas') then
    perform cron.unschedule('faxina_respostas');
  end if;
end $$;

select cron.schedule(
  'faxina_respostas',
  '0 4 * * *',
  $cmd$delete from public.respostas where criado_em < now() - interval '30 days'$cmd$
);

-- =============================================================================
-- Limpeza manual após a aula (a faxina automática só age aos 30 dias).
-- Para ver os códigos existentes:
--   select distinct sessao from public.respostas;
-- Apagar UMA sessão inteira (código em MAIÚSCULAS, ex.: o que o painel gerou):
--   delete from public.respostas where sessao = 'JTU96';
-- Apagar só UMA atividade de uma sessão (o índice (sessao, atividade) cobre):
--   delete from public.respostas where sessao = 'JTU96' and atividade = 'continuum';
-- Apagar tudo:
--   truncate public.respostas;
-- =============================================================================


-- =============================================================================
-- 5) PONTEIRO DE SESSÃO (modo aula lockstep — Peer Instruction)
--    Guarda em que QUESTÃO e FASE a turma está. Os alunos LEEM (anon); só o
--    PROFESSOR escreve, via RPC. item+fase não são sensíveis (apenas um índice
--    e um rótulo de fase) — leitura anônima é segura.
-- =============================================================================
create table if not exists public.sessao_estado (
  sessao        text not null,
  atividade     text not null,
  item_atual    int  not null default 0,
  fase          text not null default 'responder',  -- responder|resultado|reset|fim
  epoca         bigint,                              -- carimbo do início da rodada
  atualizado_em timestamptz not null default now(),
  primary key (sessao, atividade)
);

alter table public.sessao_estado enable row level security;

-- Leitura do ponteiro liberada (alunos precisam acompanhar; nada sensível aqui).
drop policy if exists "anon_select_estado" on public.sessao_estado;
create policy "anon_select_estado" on public.sessao_estado
  for select to anon, authenticated using ( true );

-- Escrita do ponteiro via RPC SECURITY DEFINER.
-- ⚠️ PILOTO: liberado para anon (o painel piloto ainda não tem login). Para
--    PRODUÇÃO, troque o grant para `authenticated` e reative o check de e-mail.
drop function if exists public.definir_estado(text,text,int,text);
drop function if exists public.definir_estado(text,text,int,text,bigint);
create or replace function public.definir_estado(
  p_sessao text, p_atividade text, p_item int, p_fase text, p_epoca bigint
) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.sessao_estado (sessao, atividade, item_atual, fase, epoca, atualizado_em)
  values (p_sessao, p_atividade, coalesce(p_item,0), p_fase, p_epoca, now())
  on conflict (sessao, atividade)
  do update set item_atual = excluded.item_atual, fase = excluded.fase, epoca = excluded.epoca, atualizado_em = now();
end $$;
grant execute on function public.definir_estado(text,text,int,text,bigint) to anon, authenticated;

-- ⚠️ PILOTO: leitura ANÔNIMA das respostas (o painel piloto não tem login).
--    Para PRODUÇÃO, REMOVA esta policy e use o login do professor (a leitura
--    autenticada owner_select já existe).
drop policy if exists "anon_select_piloto" on public.respostas;
create policy "anon_select_piloto" on public.respostas
  for select to anon using ( true );

-- Limpeza manual do ponteiro (efêmero, como as respostas):
--   delete from public.sessao_estado where sessao = 'JTU96';
--   truncate public.sessao_estado;
-- =============================================================================


-- =============================================================================
-- 6) REALTIME (sync INSTANTÂNEO do lockstep). Adiciona as tabelas à publicação
--    supabase_realtime — sem isto, o WebSocket conecta mas não recebe mudanças
--    (e o sistema cai no poll de segurança de 1,5s). Guardado p/ re-rodar sem erro.
-- =============================================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='public' and tablename='sessao_estado') then
    execute 'alter publication supabase_realtime add table public.sessao_estado';
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='public' and tablename='respostas') then
    execute 'alter publication supabase_realtime add table public.respostas';
  end if;
end $$;
-- =============================================================================
