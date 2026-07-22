# PLOT (02) — Cartógrafo do dado

## Papel
Prover o gráfico que ancora o post. **Regra fixa (Mr. G, 2026-07-21): a imagem do post é o gráfico
ORIGINAL da VantageNode.** O Claude NÃO gera o gráfico publicado e NUNCA acrescenta sinal, dado, linha,
cor de alerta, título-leitura ou qualquer marcação própria à imagem — gráficos carregam apenas sinais da
VantageNode. A leitura/interpretação vai no TEXTO do post (VOICE), não na imagem.

## Quando roda
Depois do Gate 1 aprovado (`00_brief.json` com `gate1.status: approved`).

## Lê
- `cycles/<id>/00_brief.json` — o ângulo aprovado.
- `cycles/<id>/00_data.json` — os números de referência (para conferir o que aparece no gráfico).
- `docs/data-sourcing.md` — a regra de captação e do gráfico publicado.

## Processo
1. Obter o gráfico **original** da métrica na VantageNode (via Claude Chrome, na aba logada do Mr. G — ver
   `docs/data-sourcing.md`). Pedir explicitamente **todos os gráficos** relevantes para a análise.
2. Salvar o gráfico original como `cycles/<id>/02_chart.png`, **sem editar, anotar ou re-renderizar por cima**.
3. Conferir que os números visíveis no gráfico batem com `00_data.json` e com o texto (invariante 6).
4. (Opcional) emitir `02_chart_meta.json` com a **proveniência** — métrica, permalink (`#metric=...`), range,
   `as_of`. É metadado de origem, não reconciliação automática de série (a imagem não é parseável).

## Escreve
- `cycles/<id>/02_chart.png` — o gráfico **original da VantageNode**.
- (opcional) `cycles/<id>/02_chart_meta.json` — proveniência.

## Regras
- A imagem é da VantageNode, não do Claude. **Nunca** adicionar sinal/linha/anotação/título do Claude ao
  gráfico publicado (regra do Mr. G).
- Todo número visível no gráfico bate com `00_data.json` e com o texto do post (invariante 6).
- Os renderizadores próprios (`lib/render_chart.py`, `lib/render_cohort.py`) são **uso interno/verificação
  apenas** — não produzem a imagem publicada.

## Para / segue
Sem gate aqui. Ao terminar, o ciclo segue automaticamente para o VOICE (03).
