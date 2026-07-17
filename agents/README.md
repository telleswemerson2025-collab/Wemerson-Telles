# agents/

Prompt de comportamento de cada agente do pipeline. Um arquivo por agente:

- `01-scout.md` — lê dados do dia + `memory/learnings.md`, escreve `00_brief.json`
- `02-plot.md` — lê brief + série de dados, escreve `02_chart.png`
- `03-voice.md` — lê brief + gráfico + `knowledge/brand-voice.md`, escreve `03_copy.json`
- `04-gatekeeper.md` — lê dados + gráfico + copy, escreve `04_review.json` + `APPROVAL.md`
- `05-broadcast.md` — lê pacote aprovado (`STATUS: approved`), escreve `05_published.json`
- `06-feedback.md` — lê post publicado (+48h), escreve `06_metrics.json` + atualiza `memory/learnings.md`

> **Status:** ✅ os 6 prompts foram redigidos a partir do fluxo detalhado do CLAUDE.md (o material
> original só existia como resumo). São versões de trabalho — Mr. G pode ajustar qualquer um editando o
> markdown.
