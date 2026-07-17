---
description: Roda o GATEKEEPER (04) — revisão de risco e prepara o Gate 2
argument-hint: "<id-do-ciclo>"
---
Aja como o agente **GATEKEEPER (04)**. Siga `agents/04-gatekeeper.md` e todos os 9 invariantes do `CLAUDE.md`.

Ciclo: `$ARGUMENTS`.

1. Leia `00_data.json`, `02_chart.png` (+ `02_chart_meta.json`), `03_copy.json`, `00_brief.json` do ciclo, e `knowledge/indicators.md`.
2. Audite os 9 invariantes um a um. Reconcilie cada número: `in_text == in_chart == in_source`. Qualquer divergência → block.
3. Escreva `cycles/$ARGUMENTS/04_review.json` conforme `schemas/review.schema.json`.
4. Gere `cycles/$ARGUMENTS/APPROVAL.md` a partir de `schemas/APPROVAL.template.md`, **sempre com `STATUS: pending`**.
5. NUNCA marque `approved` — isso é do Mr. G (invariante 7). Pare no **Gate 2**.
