# APPROVAL — Ciclo 2026-07-22-sth-cost-convergence-01

STATUS: approved

<!--
  GATE 2 — INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
-->

## Resumo
- **Indicador:** Realized Price STH (custo-base do short-term holder)
- **Ângulo:** A convergência — o gap preço × custo STH caiu de ~16% para ~4% em ~30D, fechando pelos dois lados (preço subindo ~$58K→~$66,5K, custo STH caindo ~$77K→~$69K). O mercado se aproxima do teste da linha de custo do curto prazo.
- **Número-âncora:** Realized Price STH ~$69K vs BTC ~$66,5K (21/07/2026)
- **Fonte:** 00_data.json (leitura via Claude no Chrome no terminal VantageNode)

## Post (corpo — sem link)
```
Realized Price STH — o custo-base de quem comprou recentemente — caiu para ~$69K, e o preço subiu de ~$58K a ~$66,5K. Em um mês, o gap entre preço e esse custo encolheu de ~16% para ~4%, fechando pelos dois lados. O mercado se aproxima do teste dessa linha de custo.
```
_(266/280 caracteres)_

## Primeiro reply (com o link)
```
Realized Price STH = custo-base médio do short-term holder; preço abaixo dela = curto prazo no vermelho. A linha cai quando moedas de custo alto capitulam. Contexto: agregado ~$53K, LTH ~$50K. Fonte: https://vantagenode.io/terminal#metric=27463c1a65. Não é previsão de preço.
```
_(275/280 caracteres)_

## Veredito do GATEKEEPER
- **Resultado:** pass — 9/9 invariantes (reconciliação numérica ok)
- **Percentuais aproximados** (Realized Price STH arredondada ao milhar) — usados com "~"; sem previsão de preço (invariante 5)
- **Conferência visual:** ✅ **concluída**. Imagem = gráfico ORIGINAL da VantageNode (marca d'água nativa, sem marca do Claude). Nuance: a linha é **SMA-30** e mostra **~$69K** no último ponto (coerente com o post); o `$68K` da sidebar é o valor **cru diário**, que não aparece na linha. Números batem visualmente.
- **Pendência menor** (não bloqueia): registrar Realized Price STH em `knowledge/indicators.md`.

## Imagem do post
Gráfico **ORIGINAL da VantageNode** capturado pelo Mr. G (Realized Price STH, 30D, permalink `#metric=27463c1a65`). Decisão A: nada renderizado pelo Claude.

## Decisão do Mr. G
Edite o campo `STATUS:` no topo: `approved` | `revise` | `rejected`.

**Nota (opcional):** Aprovado pelo Mr. G em 2026-07-22, mantendo ~$69K e ~4% (coerentes com a linha SMA-30 do gráfico anexado). Publicação manual na @VantageNodvt; imagem = gráfico original da VantageNode.
