# mock-block-test-01 — Fixture de teste do GATEKEEPER (NÃO é ciclo real)

Ciclo **propositalmente quebrado** para provar que o GATEKEEPER (04) bloqueia conteúdo que viola os
invariantes, e que a orquestração (`run_cycle.sh` / `publish.sh`) impõe o bloqueio mecanicamente.

A `03_copy.json` viola de propósito:

| Invariante | Violação plantada |
|---|---|
| 6 | Texto diz `MVRV 1,45`; a fonte/gráfico dizem `1,15` |
| 5 | "o preço vai dobrar até agosto, garantido" (previsão/promessa) |
| 3 | Link no corpo do post (deveria ir no reply) |
| 8 | Emoji 🚀 e hype ("explodir", "não perca") |
| 1 | Dois insights no mesmo post (MVRV + SOPR) |
| — | `char_count` declarado (190) ≠ real (194) |

Detalhe importante: os autochecks da copy (`no_hype_check`, `link_in_reply_only`, `single_idea`) estão
todos `true` — **mentindo**. O GATEKEEPER verifica de forma independente e não confia na autodeclaração.

## Como reproduzir

```
./run_cycle.sh mock-block-test-01     # deve terminar em verdict=block, exit 1
./publish.sh   mock-block-test-01     # deve recusar (sem APPROVAL.md aprovado)
```

Resultado esperado: `04_review.json` com `verdict: block` e a lista de motivos; nenhum `APPROVAL.md`
gerado (ciclo bloqueado não chega ao Gate 2).
