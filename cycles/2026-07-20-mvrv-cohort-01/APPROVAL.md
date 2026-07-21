# APPROVAL — Ciclo 2026-07-20-mvrv-cohort-01

STATUS: pending

<!--
  GATE 2 — INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
-->

## Resumo
- **Indicador:** MVRV por coorte (LTH / Agregado / STH)
- **Ângulo:** O MVRV agregado (1,208) esconde a divergência de coorte — long-term holders em lucro (1,284), short-term holders abaixo do custo (0,933, ~6,7% no vermelho). O lucro está nas mãos antigas; quem comprou recente está no prejuízo.
- **Número-âncora:** MVRV-STH 0,933 (20/07/2026)
- **Fonte:** 00_data.json (leitura direta do terminal VantageNode, Mr. G)

## Post (corpo — sem link)
```
O MVRV agregado em 1,208 sugere 'mercado no lucro' — mas por coorte a leitura se divide. Long-term holders: 1,284, no azul. Short-term holders: 0,933, cerca de 6,7% abaixo do custo. O lucro está nas mãos antigas; quem comprou recente está no vermelho.
```
_(251/280 caracteres · ajuste do Mr. G: "há semanas" removido)_

## Primeiro reply (com o link)
```
MVRV por coorte = valor de mercado ÷ custo-base de cada grupo. Abaixo de 1 = no prejuízo. O lado STH é confirmado por NUPL-STH (−0,072) e SOPR-STH (0,9849). Fonte (MVRV, VantageNode): https://vantagenode.io/terminal#metric=5b84739a00 — não é previsão de preço.
```

## Veredito do GATEKEEPER
- **Resultado:** pass — 9/9 invariantes ok
- **Reconciliação:** 1,208 / 1,284 / 0,933 conferem com fonte e gráfico; 6,7% derivado exato; NUPL-STH −0,072 e SOPR-STH 0,9849 conferem
- **Categoria B respeitada:** nenhum indicador interno do Gui (ex.: "indicador de risco/zona amarela") no texto
- **Ajustes do Mr. G aplicados:** ✅ (1) link do reply = permalink exata do MVRV-STH (`#metric=5b84739a00`); ✅ (2) "há semanas" removido — frase final: "quem comprou recente está no vermelho". Re-reconciliado: PASS. Aguardando confirmação final para publicar.

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST (canal manual).
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):**

---
_Gráfico do ciclo: 02_chart.png (barras por coorte)_
