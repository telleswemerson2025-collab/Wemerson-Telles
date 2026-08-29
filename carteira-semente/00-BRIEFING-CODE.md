# BRIEFING PARA O CODE — Sistema Carteira Semente
Wemerson Telles · BlockCapital Research · 29/08/2026
Versão 1.1 — decisões de 29/08/2026 aplicadas (ver `08-decisoes-29-08-2026.md`)

## O QUE É ISTO
O pacote completo de um produto novo (Carteira Semente) e do sistema de agentes que o opera.
Nada aqui está em produção. É proposta a ser levada ao Gui Telles para validar ou recusar.

## FRONTEIRA DE AUTORIA — LER ANTES DE TUDO
- **CRM e Carteira de IA são projetos do Gui Telles.** Não redesenhar, não propor sistema para elas.
- **A Carteira Semente é proposta do Mr. G.** É onde o sistema pode nascer.
- O sistema de agentes é EXCLUSIVO da Semente. Se um dia fizer sentido levar para as outras,
  quem puxa essa conversa é o Gui.

## A LEI (invariantes do sistema — valem sempre)
1. **O GATE É SEMPRE HUMANO E INVIOLÁVEL.** Nenhum agente compra, vende, aporta ou publica.
   Eles medem, propõem, conferem e organizam. Quem assina é o Gui.
2. **Nada sai para o cliente sem passar pelo Gui.** O sistema é ferramenta interna.
3. **A fonte é o gráfico/tooltip, NUNCA a memória.** Todo número citado tem que bater com a fonte.
4. **Quem propõe não audita.** Alocador e Auditor são papéis separados.
5. **Sem promessa de retorno. Sem previsão de preço.** Falhar aqui veta a saída, sempre.
6. **Preservação vem antes de convicção.**
7. **Sempre os mesmos indicadores, todo dia, na mesma ordem.** Indicador que entra e sai conforme
   a conveniência vira desculpa para justificar o que já se queria fazer.
8. **Dado ilustrativo é rotulado como ilustrativo.** Nunca apresentar reconstrução como leitura real.
9. **NENHUM NÚMERO DERIVADO É DIGITADO À MÃO.** Todo derivado — média, percentual, projeção,
   posição normalizada — é calculado a partir da fonte primária, em tempo de execução. Se um
   derivado aparece em dois lugares, um dos dois está errado por definição. Quando documento e
   instrumento divergem, o instrumento (que calcula) está certo e o documento (que digitou) está
   errado: corrige-se o documento, nunca a fórmula.

## HIERARQUIA DE LEITURA (quem decide o quê)
Não existem dois juízes. Os papéis são distintos e ordenados:

1. **A Linha d'Água CLASSIFICA O ESTADO.** Autoridade única sobre em que estado o mercado está
   (Capitulação profunda · Prejuízo do mercado · Estresse de curto prazo · Mercado saudável).
   Regra objetiva: posição do preço contra os três custos de referência. Nada sobrepõe isso.
2. **O Índice Semente MEDE A INTENSIDADE dentro do estado.** Não reclassifica, não promove nem
   rebaixa estado. Diz o quão esticada está a situação, e modula o tamanho do aporte dentro da
   faixa que o estado já definiu.
3. **Quem dispara a estação é o Índice de Plantio** — o cruzamento do estado (Linha d'Água) com o
   tempo restante até a entrega (Abrigo). O Índice Semente nunca dispara decisão sozinho.
4. **Divergência aparente entre os dois não é empate a resolver.** O estado é o da Linha d'Água; o
   Índice apenas informa a intensidade. A divergência vira NOTA na saída diária da Torre
   ("estado saudável, mas intensidade em equilíbrio"), nunca uma disputa.

## ORDEM DE CONSTRUÇÃO
1. Torre de Controle (só leitura — entrega valor no dia 1, não toca em ordem)
2. Guardiões
3. Alocador + Auditor
4. Responsável pelos Posts
5. Laboratório (o mais pesado — por último)

## PENDÊNCIAS DE CÓDIGO (não executadas — decisão do Gui)
Os três HTMLs deste pacote foram construídos antes das decisões de 29/08 e agora divergem da
especificação. Nenhum foi alterado. O que precisa mudar:

- **`indice-semente.html`** — o MVRV está marcado como camada 2 (`{c:2,n:'MVRV Ratio'...}`) e ao
  mesmo tempo é usado como régua da camada 1. É a dupla contagem corrigida pela Decisão 1. A
  correção é trocar `c:2` por `c:1` nessa linha: a camada 1 continua lendo o MVRV como régua e a
  média da camada 2 passa a ter três itens. A tela hoje mostra 50; com a correção mostra 51.
- **`indice-semente.html`** — a tabela `FAIXAS` ainda usa nomes de estado (Capitulação profunda,
  Prejuízo do mercado) e ainda dispara decisão de aporte (`r:'Plantio · aporte integral'`). Pela
  Decisão 2 as faixas do Índice medem intensidade e não disparam nada. Ver `03-indice-semente.md`.
- **`simulador.html`** — o modelo está correto e é a fonte de verdade dos cenários (Decisão 3).
  Nada a corrigir. Era o documento que estava errado.

## ARQUIVOS DESTE PACOTE
- `00-BRIEFING-CODE.md` — este arquivo
- `01-documento-mae.md` — a fonte de verdade do produto
- `02-agentes.md` — especificação de cada agente
- `03-indice-semente.md` — o indicador composto (pesos, normalização, leitura de hoje)
- `04-linha-dagua.md` — o instrumento de origem da leitura
- `05-gates.md` — Gate 1 e Gate 2 da Semente
- `06-campanhas.md` — precificação, base e calendário de campanhas
- `07-leituras-29-08-2026.md` — as 14 leituras reais confirmadas no terminal (fonte primária)
- `08-decisoes-29-08-2026.md` — as decisões desta rodada e o que cada uma invalidou
