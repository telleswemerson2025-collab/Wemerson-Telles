# lib/

Integração externa: acesso à API de dados (VantageNode), render de gráficos e publicação no X.

- `fetch_data.py` — busca séries de indicadores na API VantageNode _(esqueleto; Fase 2)_
- `render_chart.py` — gera `02_chart.png` a partir da série + identidade visual _(Fase 1/2)_
- `publish.py` — publica no X (post + link no primeiro reply) _(Fase 4)_

> **Status:** vazio por enquanto (entra na Fase 1/2). Bloqueadores da Fase 2: token da API VantageNode
> e bug conhecido no endpoint de MVRV — ambos dependem do Gui.
