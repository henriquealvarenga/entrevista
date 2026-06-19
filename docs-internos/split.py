#!/usr/bin/env python3
"""Split the monolithic .qmd files into per-chapter files for the book."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def split_sections(text):
    """Return list of (title, body) split on level-1 (# ) headings.

    Drops the YAML frontmatter at the top of the source file.
    """
    # strip leading YAML frontmatter
    if text.startswith("---"):
        end = text.index("\n---", 3)
        text = text[end + 4:]
    lines = text.splitlines()
    sections = []
    cur_title = None
    cur_body = []
    for line in lines:
        m = re.match(r"^# (?!#)(.+)$", line)
        if m:
            if cur_title is not None:
                sections.append((cur_title, "\n".join(cur_body).strip()))
            cur_title = m.group(1).strip()
            cur_body = []
        else:
            if cur_title is not None:
                cur_body.append(line)
    if cur_title is not None:
        sections.append((cur_title, "\n".join(cur_body).strip()))
    return sections


def write_chapter(path, title, body):
    path.parent.mkdir(parents=True, exist_ok=True)
    fm = f'---\ntitle: "{title}"\n---\n\n'
    path.write_text(fm + body.rstrip() + "\n", encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}  ({len(body.splitlines())} linhas)")


# ---------------------------------------------------------------------------
# Arquivo 01 -> Parte I (A Entrevista) — slugs explícitos por seção
# ---------------------------------------------------------------------------
print("== Parte I (01-entrevista) ==")
sec01 = split_sections((ROOT / "01-entrevista_psiquiatrica.qmd").read_text(encoding="utf-8"))
slug01 = {
    "Introdução": "01-introducao",
    "A Entrevista Inicial": "02-entrevista-inicial",
    "O Exame do Estado Mental": "03-exame-estado-mental",
    "Aspectos Práticos da Documentação": "04-documentacao",
    "Considerações Especiais": "05-consideracoes-especiais",
    "Conclusão": "06-conclusao",
}
for title, body in sec01:
    if title == "Referências":
        continue
    slug = slug01.get(title)
    if not slug:
        print(f"  [!] sem slug para: {title!r}")
        continue
    write_chapter(ROOT / "capitulos" / "parte-1-entrevista" / f"{slug}.qmd", title, body)

# ---------------------------------------------------------------------------
# Arquivo 02 -> Parte II (Roteiro) — 1 capítulo por item, slug auto
# ---------------------------------------------------------------------------
print("== Parte II (02-roteiro) ==")
sec02 = split_sections((ROOT / "02-roteiro_eem.qmd").read_text(encoding="utf-8"))


def slugify(title):
    s = title.lower()
    repl = {"á": "a", "ã": "a", "â": "a", "à": "a", "é": "e", "ê": "e",
            "í": "i", "ó": "o", "ô": "o", "õ": "o", "ú": "u", "ç": "c"}
    for k, v in repl.items():
        s = s.replace(k, v)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


for title, body in sec02:
    if title == "Referências":
        continue
    if title == "Introdução":
        slug = "00-introducao"
    elif title == "Súmula Psicopatológica":
        slug = "21-sumula"
    else:
        m = re.match(r"^(\d+)\.\s*(.+)$", title)
        if m:
            num = int(m.group(1))
            slug = f"{num:02d}-{slugify(m.group(2))}"
        else:
            slug = slugify(title)
    write_chapter(ROOT / "capitulos" / "parte-2-roteiro" / f"{slug}.qmd", title, body)

# ---------------------------------------------------------------------------
# Arquivo 03 -> Parte III (Casos)
# ---------------------------------------------------------------------------
print("== Parte III (03-casos) ==")
sec03 = split_sections((ROOT / "03-casos_clinicos.qmd").read_text(encoding="utf-8"))
caso_n = 0
for title, body in sec03:
    if title == "Instruções":
        slug = "00-instrucoes"
    elif title == "Orientações para o Exercício":
        slug = "99-orientacoes"
    else:
        caso_n += 1
        first = slugify(title.split(",")[0])
        slug = f"{caso_n:02d}-{first}"
    write_chapter(ROOT / "casos" / f"{slug}.qmd", title, body)

print("\nOK.")
