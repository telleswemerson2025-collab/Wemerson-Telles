# APPROVAL: Ciclo 2026-07-27-mvrv-sth-cost-basis-01

STATUS: approved

<!--
  GATE 2: INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
  Registro: STATUS mudado para 'approved' por instrução explícita do Wemerson (Mr. G) em 27/07/2026,
  após ele revisar T1-T4 + reply e confirmar que os 6 números batem com os dados reais do terminal.
-->

> **AUTORIZAÇÃO DE PUBLICAÇÃO: NÃO.** Aprovar o Gate 2 NÃO autoriza o post no X. A publicação (BROADCAST 05)
> só ocorre com um ok explícito posterior do Wemerson. Até lá, nada é publicado. Falta também capturar o
> print da série MVRV-STH (02_chart.png).

## Resumo
- **Formato:** thread educativa (4 tweets + reply)
- **Indicador:** MVRV por coorte (âncora: MVRV-STH), com SOPR como confirmação
- **Ângulo:** o custo de quem comprou há pouco, que o gráfico de preço não mostra. MVRV-STH 0,969 (STH 3,1% abaixo do custo, de leve no vermelho); SOPR confirma pelo lado da realização; agregado e LTH em lucro = força nas mãos antigas.
- **Números-âncora:** MVRV-STH 0,969 · SOPR 0,9945 · SOPR-STH 0,9995 · agregado 1,248 · LTH 1,322 (fechamento 26/07/2026)
- **Fonte:** 00_data.json (leitura direta do terminal VantageNode, Mr. G)

## Thread (corpo, sem link)

**T1** (75 caracteres)
```
O gráfico de preço não te conta uma coisa: quanto quem comprou agora pagou.
```

**T2** (246)
```
É isso que o MVRV-STH mede. Ele compara o preço de hoje com o custo médio de quem comprou nos últimos meses, o short-term holder. Agora está em 0,969. Na prática: na média, quem entrou faz pouco está 3,1% abaixo do que pagou. De leve no vermelho.
```

**T3** (248)
```
Dá pra checar isso por outro ângulo: o SOPR, que olha quem está de fato vendendo. O SOPR geral está em 0,9945 e o do curto prazo em 0,9995, os dois rente ao empate. Quem realiza hoje sai perto do zero a zero, parte no vermelho leve. Mesma história.
```

**T4** (263)
```
O contraste fecha a leitura. O mercado todo (MVRV 1,248) e quem segura há muito tempo (LTH 1,322) seguem no lucro. A força está nas mãos antigas, não no dinheiro novo. Isso não diz pra onde o preço vai. Diz onde está a tensão: no custo de quem comprou por último.
```

## Primeiro reply (com o link)
```
MVRV-STH = valor de mercado ÷ custo-base do short-term holder. Abaixo de 1, o preço está sob o custo médio de quem comprou há pouco. Leitura no terminal (26/07): https://vantagenode.io/terminal. Não é previsão de preço nem recomendação.
```

## Veredito do GATEKEEPER
- **Resultado:** pass no conteúdo, 8/9 invariantes ok; invariante 4 (gráfico) pendente de render.
- **Correções aplicadas:** STH 0,958 → 0,969; LTH 1,305 → 1,322; SOPR corrigido para 0,9945 (abaixo de 1, T3 não diz mais "SOPR ~1,00"); T1 encurtado para 75 caracteres (71-100).
- **Reconciliação:** 0,969 / 3,1% / 0,9945 / 0,9995 / 1,248 / 1,322 conferem com a fonte (MVRV 3 casas, SOPR 4 casas).
- **Invariante 5:** T4 diz "isso não diz pra onde o preço vai"; sem previsão/promessa; disclaimer no reply.
- **Invariante 8:** zero emoji/hype/jargão e zero travessão verificados nos 4 tweets + reply.
- **Gráfico (formato definido pelo Wemerson, 27/07):** 02_chart.png = PRINT REAL da série temporal MVRV-STH do terminal VantageNode (range 5Y, breadcrumb Studio visível, marca d'água VANTAGENODE, sem toolbar), no mesmo estilo do último post publicado. NÃO é o gráfico de barras por coorte. Claude não renderiza; o Wemerson anexa o screenshot.
- **Pendências antes de publicar:** (1) capturar o print da série MVRV-STH (02_chart.png) e (2) o ok explícito de publicação do Wemerson. O Gate 2 já está aprovado, mas não libera a publicação sozinho.

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST (canal manual).
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):** Aprovado pelo Wemerson (Mr. G) em 27/07/2026 após revisão do texto completo (T1-T4 + reply); os 6 números conferem com o terminal. Duas instruções registradas: (1) o print (02_chart.png) é a série temporal MVRV-STH no formato oficial (não barras por coorte); (2) publicação NÃO autorizada por este gate, só com ok explícito posterior do Wemerson. BROADCAST (05) não executado.

---
_Gráfico do ciclo: 02_chart.png = print real da série temporal MVRV-STH (5Y, breadcrumb + marca d'água VANTAGENODE, sem toolbar), a capturar pelo Wemerson. Ver 02_chart_meta.json._
