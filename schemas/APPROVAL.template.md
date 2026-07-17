# APPROVAL — Ciclo {{cycle_id}}

STATUS: pending

<!--
  GATE 2 — INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para um destes: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
  Em caso de dúvida, o ciclo para aqui — não avança (regra de segurança do CLAUDE.md).
-->

## Resumo
- **Indicador:** {{indicator}}
- **Ângulo:** {{angle}}
- **Número-chave:** {{headline_number}}
- **Fonte dos números:** 00_data.json (transferência manual da VantageNode)

## Post (corpo — sem link)
```
{{post_text}}
```

## Primeiro reply (com o link)
```
{{reply_text}}
```

## Veredito do GATEKEEPER
- **Resultado:** {{verdict}}
- **Invariantes com violação:** {{violations_summary}}
- **Reconciliação de números (texto = gráfico = fonte):** {{numbers_ok}}

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST a publicar.
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):**

---
_Gráfico do ciclo: 02_chart.png_
