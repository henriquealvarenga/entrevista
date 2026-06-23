/* =============================================================================
   CONFIG DO SUPABASE — atividades do EEM (projeto PRÓPRIO, separado do livro
   Intencionalidade). Carregado tanto pela atividade do aluno quanto pelo painel.

   ⚠️  COLE AQUI APENAS OS DOIS VALORES PÚBLICOS do NOVO projeto Supabase:
       • url      → Project URL  (Settings → API → Project URL)
       • anonKey  → chave "anon" / "publishable" (a PÚBLICA)

   ⛔  NUNCA coloque aqui a service_role / secret key. Ela ignora o RLS e dá
       acesso total ao banco; jamais deve ir para o navegador nem para o git.

   A chave anon é segura no código: a proteção vem das políticas RLS do banco
   (rode supabase/setup.sql no projeto novo). Enquanto estes campos estiverem
   vazios, as atividades rodam offline (tudo fica só no aparelho).
   ============================================================================= */
window.SUPABASE_CONFIG = {
  url:     "https://mqalfrhndvnaqedsubkn.supabase.co",
  anonKey: "sb_publishable_mc67uqHfmIt00vJA_Kbk5g_bHJiEHOH",   // chave PÚBLICA (publishable) — segura no cliente; proteção = RLS
  table:   "respostas"
  // Tabela ÚNICA multi-atividade (discriminador `atividade`). O código da sessão
  // é GERADO no painel e DIGITADO pelos alunos na tela inicial da atividade.
};
