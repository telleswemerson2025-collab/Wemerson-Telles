# APPROVAL — Ciclo 2026-07-21-mvrv-sth-resistance-01

STATUS: pending

<!--
  GATE 2 — INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
-->

## Resumo
- **Indicador:** MVRV por coorte (âncora: MVRV-STH)
- **Ângulo:** O custo do investidor de curto prazo como resistência — MVRV-STH em 0,957 (preço ~4,3% abaixo do custo do STH); esse custo, logo acima, historicamente tende a agir como oferta/resistência. Repique dentro de bear encontrando teto, não reversão de ciclo.
- **Número-âncora:** MVRV-STH 0,957 (21/07/2026) · agregado 1,231 · LTH 1,304
- **Fonte:** 00_data.json (leitura direta do terminal VantageNode, Mr. G)

## Post (corpo — sem link)
```
MVRV-STH em 0,957: o preço está ~4,3% abaixo do custo-base de quem comprou recentemente. Esse custo, logo acima, historicamente tende a agir como resistência — reencontrá-lo transforma o breakeven do curto prazo em oferta. Repique dentro de bear testando teto, não base ampla.
```
_(276/280 caracteres)_

## Primeiro reply (com o link)
```
MVRV-STH = valor de mercado ÷ custo-base do short-term holder; abaixo de 1 = preço sob o custo. Coorte: agregado 1,231, LTH 1,304 — força nas mãos antigas. Fonte: https://vantagenode.io/terminal#metric=5b84739a00. Não é previsão de preço nem recomendação.
```

## Veredito do GATEKEEPER
- **Resultado:** pass — 9/9 invariantes ok
- **Reconciliação:** 0,957 / 4,3% / 1,231 / 1,304 conferem com fonte e gráfico (3 casas decimais)
- **Invariante 5 (foco):** ângulo contra-consenso permitido; linguagem com hedge ("historicamente tende a") + disclaimer no reply; sem previsão/promessa de preço
- **Categoria B respeitada:** nenhum indicador de risco/capitulação; âncora só em MVRV por coorte
- **Inspiração:** vídeo do Gui (21/07) usado só como ângulo — sem frases/números copiados

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST (canal manual).
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):**

---
_Gráfico do ciclo: 02_chart.png (barras por coorte, breakeven em 1,0)_
