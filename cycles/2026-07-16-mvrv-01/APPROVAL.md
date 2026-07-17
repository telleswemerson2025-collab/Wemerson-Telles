# APPROVAL — Ciclo 2026-07-16-mvrv-01

STATUS: pending

<!--
  GATE 2 — INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para um destes: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
  Em caso de dúvida, o ciclo para aqui — não avança (regra de segurança do CLAUDE.md).
-->

## Resumo
- **Indicador:** MVRV
- **Ângulo:** Regime de custo-base historicamente baixo — mercado 20,8% acima do custo-base realizado, mais perto de acumulação do que de euforia.
- **Número-chave:** 1,208 ratio (16/07/2026)
- **Fonte dos números:** 00_data.json (transferência manual da VantageNode)

## Post (corpo — sem link)
```
MVRV em 1,208. O mercado agregado está 20,8% acima do custo-base realizado — faixa historicamente baixa, mais perto de acumulação do que de euforia. Na janela de 30D saiu de 1,156 (02/07) para a máxima atual. O holder médio mal está no lucro: leitura de custo-base, não de topo.
```
_(278/280 caracteres)_

## Primeiro reply (com o link)
```
Fonte e série completa (MVRV Ratio, 30D): https://vantagenode.io/terminal#metric=878185e596 — MVRV = valor de mercado / valor realizado; ~1 significa o preço médio pago pelo mercado. Não é sinal de compra nem previsão.
```

## Veredito do GATEKEEPER
- **Resultado:** pass
- **Invariantes com violação:** nenhuma (9/9 ok)
- **Reconciliação de números (texto = gráfico = fonte):** OK — 1,208 / 20,8% / 1,156 conferem com 00_data.json e 02_chart_meta.json
- **Pendência não-bloqueante:** registrar MVRV em knowledge/indicators.md

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST a publicar.
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):**

---
_Gráfico do ciclo: 02_chart.png_
