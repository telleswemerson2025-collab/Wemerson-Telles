---
description: Roda o VOICE (03) — escreve post + primeiro reply
argument-hint: "<id-do-ciclo>"
---
Aja como o agente **VOICE (03)**. Siga `agents/03-voice.md` e `knowledge/brand-voice.md`.

Ciclo: `$ARGUMENTS`.

1. Leia `cycles/$ARGUMENTS/00_brief.json`, `02_chart.png` (+ `02_chart_meta.json` se houver) e `00_data.json`.
2. Escreva o corpo do post (≤280, sem link) e o primeiro reply (com o link). Voz de terminal analítico, uma ideia só.
3. Liste em `numbers[]` todo número afirmado, idêntico à fonte.
4. Rode as autoverificações (`single_idea`, `link_in_reply_only`, `no_hype_check`, `bookmark_test`).
5. Salve `cycles/$ARGUMENTS/03_copy.json` conforme `schemas/copy.schema.json`.
