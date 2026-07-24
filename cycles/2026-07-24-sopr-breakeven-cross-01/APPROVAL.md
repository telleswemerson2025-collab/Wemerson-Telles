# APPROVAL — Ciclo 2026-07-24-sopr-breakeven-cross-01

STATUS: pending

<!-- GATE 2 — INVIOLÁVEL (invariante 7). Só o Mr. G altera STATUS: approved | revise | rejected. -->

## Resumo
- **Indicador:** SOPR (Spent Output Profit Ratio), agregado
- **Ângulo:** o SOPR agregado cruzou de volta o breakeven (0,9876 em 18/jul → 1,0004 em 23/jul). Depois de semanas realizando prejuízo (<1,0 em mai–jul), o mercado voltou ao custo-base — **não** ao lucro. A virada é do **agregado e do STH** (1,0017), **não dos LTH** (SOPR-LTH ~0,84, seguem no vermelho). Afrouxamento do estresse de realização, não reversão confirmada.
- **Número-âncora:** a **mudança** 0,9876 → 1,0004 (não o valor absoluto — 1,0004 é indistinguível de 1,0; o que importa é o cruzamento).
- **Imagem:** screenshot REAL do terminal VantageNode (SOPR agregado, **90D**, métrica linear / preço log, SMA=7) — Mr. G anexa como arquivo.

## Post (corpo — sem link)
```
SOPR agregado cruzou de volta o breakeven: de 0,9876 (18/jul) a 1,0004 (23/jul). Depois de semanas no prejuízo, o mercado voltou ao custo-base, não ao lucro. A virada é do agregado, não dos LTH: os long-term holders seguem no vermelho. Estresse cedendo, não revertido.
```
_(273/280)_

## Primeiro reply (com o link)
```
SOPR = preço de venda / preço de compra das moedas movidas. Abaixo de 1,0 = prejuízo; acima = lucro. O corte curto acompanhou (STH 1,0017); o longo, não. Cruzamento fresco e ruidoso, pode recuar. Não é previsão de preço. https://vantagenode.io/terminal#metric=2552c9f025
```
_(278/280)_

## Veredito do GATEKEEPER
- **Resultado:** pass — 9 invariantes ok; conferência visual do screenshot 90D concluída (vermelho <1,0 → sliver verde no NOW = o cruzamento).
- **Range 90D:** exceção deliberada e justificada à regra 5Y (o cruzamento de 5 dias só é legível no zoom curto) — registrada no brief e no `02_chart_meta.json`.
- **Honestidade:** a leitura deixa explícito que a virada é do agregado/STH, **não** dos LTH — evita confusão com a pauta anterior (SOPR-LTH em perda).
- **⚠️ Antes de publicar:** Mr. G anexa o **screenshot como arquivo** no X (SOPR agregado, 90D, enquadramento da recipe).

## Decisão do Mr. G
Edite o `STATUS:` no topo: `approved` | `revise` | `rejected`.

**Nota (opcional):** _(Gate 2 aberto — aguardando decisão do Mr. G.)_
