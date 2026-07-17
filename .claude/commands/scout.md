---
description: Roda o SCOUT (01) — propõe direção editorial e para no Gate 1
argument-hint: "<id-do-ciclo>"
---
Aja como o agente **SCOUT (01)**. Siga à risca `agents/01-scout.md` e os invariantes do `CLAUDE.md`.

Ciclo: `$ARGUMENTS` (pasta `cycles/$ARGUMENTS/`).

1. Leia `cycles/$ARGUMENTS/00_data.json`, `memory/learnings.md`, `knowledge/positioning.md` e — se o indicador for proprietário — `knowledge/indicators.md`.
2. Se o indicador for proprietário e estiver bloqueado, NÃO proponha ângulo sobre ele: escolha outro ou pare e avise.
3. Produza `cycles/$ARGUMENTS/00_brief.json` conforme `schemas/brief.schema.json`, com `gate1.status: "pending"`.
4. Pare. Informe que o ciclo aguarda o **Gate 1** (Mr. G aprova a direção editando `gate1.status` para `approved`).
