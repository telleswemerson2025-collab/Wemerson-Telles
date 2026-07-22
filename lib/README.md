# lib/

Integração externa: acesso à API de dados (VantageNode), render de gráficos e publicação no X.

- `fetch_data.py` — ✅ **esqueleto em modo manual.** Lê/valida `cycles/<id>/00_data.json` (fonte-de-verdade
  preenchida à mão) e tem `scaffold` para gerar o template em branco. Caminho da API real stubado, desligado.
  - `python lib/fetch_data.py scaffold <id> --indicator MVRV` → cria o `00_data.json` para preencher.
  - `python lib/fetch_data.py load <id>` → valida e resume.
- `render_chart.py` / `render_cohort.py` — **produzem o `02_chart.png` publicado** (decisão A revista,
  2026-07-22): a imagem do post é renderizada no template VantageNode-X, plotando só dados reais da
  VantageNode. `render_chart.py` aceita `--value-scale/--value-prefix/--value-suffix` (ex.: exibir `$69K`)
  e `--hline` (linha de referência definicional, ex.: breakeven do SOPR).
- `publish.py` — publica no X (post + link no primeiro reply) _(Fase 4)_

> **Status:** `fetch_data.py` roda sem token nem dependências externas (usa `jsonschema` se disponível,
> senão faz checagem mínima). Bloqueadores da Fase 2 (token da API VantageNode + bug no endpoint de MVRV,
> ambos dependem do Gui) NÃO travam a fase de teste: os dados entram por transferência manual.
