# APPROVAL — Ciclo 2026-07-18-sopr-lth-01

STATUS: pending

<!--
  GATE 2 — INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
-->

## Resumo
- **Indicador:** SOPR-LTH (SOPR de long-term holders)
- **Ângulo:** Regime de realização de prejuízo do LTH — fechou abaixo de 1 em 26 de 29 dias (média 0,82) nos últimos 30D. Não é evento de um dia; é o padrão do mês.
- **Número-âncora:** 0,8529 (último fechamento, 17/07/2026)
- **Fonte dos números:** 00_data.json (transferência manual da VantageNode, hover 30D)

## Post (corpo — sem link)
```
SOPR de long-term holders fechou abaixo de 1 em 26 dos últimos 29 dias (média 0,82). O coorte que quase sempre realiza no lucro está vendendo no prejuízo há um mês. O preço recuperou; a convicção de quem segura há mais tempo, não. Não é ruído de um dia — é regime.
```
_(264/280 caracteres)_

## Primeiro reply (com o link)
```
SOPR-LTH: razão entre preço de venda e de aquisição das moedas movidas por holders de longo prazo. Abaixo de 1 = realização no prejuízo. Série (30D) e fonte: https://vantagenode.io/terminal — não é previsão de preço.
```

## Veredito do GATEKEEPER
- **Resultado:** pass — 9/9 invariantes ok
- **Reconciliação:** 26/29 dias < 1 e média 0,82 conferem com a série; âncora 0,8529 = último fechamento; intraday 0,71 corretamente NÃO usado como manchete
- **⚠️ Antes de publicar:** trocar o link do reply pela **permalink exata do SOPR-LTH** (hoje está o terminal genérico). Pendência menor: registrar SOPR em `knowledge/indicators.md`.

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST (canal manual).
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):**

---
_Gráfico do ciclo: 02_chart.png_
