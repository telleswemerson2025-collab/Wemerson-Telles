# APPROVAL — Ciclo 2026-07-22-sth-cost-convergence-01

STATUS: approved

<!--
  GATE 2 — INVIOLÁVEL (invariante 7). Somente o Mr. G altera STATUS: approved | revise | rejected.
  RE-APROVAÇÃO: gráfico e texto mudaram (template renderizado + correção do ~$58K). Aprovação anterior invalidada.
-->

## Resumo
- **Indicador:** Realized Price STH (custo-base do short-term holder)
- **Ângulo:** O custo do curto prazo em queda (~$76K → ~$69K em 30D) e convergindo com o preço — o gap caiu de ~20% (fundo de jun) para ~4%. Aproxima-se um teste da linha de custo do STH.
- **Número-âncora:** Realized Price STH ~$69K (21/07/2026)
- **Imagem:** gráfico **RENDERIZADO no template VantageNode-X** (render_chart.py, linha âmbar, ponto final verde ~$69K), plotando só a série real da VantageNode.

## Post (corpo — sem link)
```
Realized Price STH — o custo-base de quem comprou recentemente — caiu de ~$76K para ~$69K em um mês. No fundo de junho o preço estava ~20% abaixo desse custo; com a recuperação a ~$66,5K, o gap encolheu para ~4%. O mercado se aproxima do teste da linha de custo do curto prazo.
```
_(277/280 caracteres)_

## Primeiro reply (com o link)
```
Realized Price STH = custo-base médio do short-term holder; preço abaixo dela = curto prazo no vermelho. A linha cai quando moedas de custo alto capitulam. Contexto: agregado ~$53K, LTH ~$50K. Fonte: https://vantagenode.io/terminal#metric=27463c1a65. Não é previsão de preço.
```
_(275/280 caracteres)_

## Veredito do GATEKEEPER
- **Resultado:** pass — 9/9
- **Reconciliação:** ~$76K e ~$69K **estão no gráfico** (série real) e batem com a fonte; preço/percentuais (~20%, ~$66,5K, ~4%) são contexto do texto (linha única, não plotados), rastreáveis na fonte
- **Correção:** o ~$58K era o **BTC no fundo** (30/jun, 58.524), não o Realized Price — resolvido
- **Gráfico:** renderizado no template (decisão A revista) — sem sinal do Claude, só dados reais

## Decisão do Mr. G
Edite o `STATUS:` no topo: `approved` | `revise` | `rejected`.

**Nota (opcional):** Re-aprovado pelo Mr. G em 2026-07-22 com o gráfico renderizado no template e o texto corrigido (~$58K = BTC no fundo). Publicação manual na @VantageNodvt.
