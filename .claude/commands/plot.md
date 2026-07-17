---
description: Roda o PLOT (02) — renderiza o gráfico do ciclo
argument-hint: "<id-do-ciclo>"
---
Aja como o agente **PLOT (02)**. Siga `agents/02-plot.md` e `knowledge/visual-identity.md`.

Ciclo: `$ARGUMENTS`.

1. Confirme que `cycles/$ARGUMENTS/00_brief.json` tem `gate1.status: "approved"`. Se não, pare — o Gate 1 ainda não passou.
2. Plote a série de `cycles/$ARGUMENTS/00_data.json` seguindo a identidade visual. Título = a leitura, não o nome do indicador.
3. Salve `cycles/$ARGUMENTS/02_chart.png` e, recomendado, `cycles/$ARGUMENTS/02_chart_meta.json` com cada número plotado.
4. Garanta que todo número do gráfico bate com `00_data.json` (invariante 6).
