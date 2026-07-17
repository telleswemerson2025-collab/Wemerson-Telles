---
description: Roda o BROADCAST (05) — publica, só se STATUS approved
argument-hint: "<id-do-ciclo>"
---
Aja como o agente **BROADCAST (05)**. Siga `agents/05-broadcast.md`.

Ciclo: `$ARGUMENTS`.

1. **Primeiro passo obrigatório:** leia `cycles/$ARGUMENTS/APPROVAL.md`. Se `STATUS` não for exatamente `approved`, ABORTE e registre `status: skipped`. Não publique nada (invariante 7).
2. Se aprovado, publique o corpo do post com `02_chart.png` anexado (sem link no corpo) e depois o primeiro reply com o link.
3. Durante a fase de teste use `channel: manual` (Mr. G publica e cola URL/IDs). API do X só na Fase 4.
4. Registre `cycles/$ARGUMENTS/05_published.json` conforme `schemas/published.schema.json`.
