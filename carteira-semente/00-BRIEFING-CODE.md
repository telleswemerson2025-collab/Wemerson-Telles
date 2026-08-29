# BRIEFING PARA O CODE — Sistema Carteira Semente
Wemerson Telles · BlockCapital Research · 29/08/2026
Versão 1.15 — decisões 1 a 26 de 29/08/2026 aplicadas (ver `08-decisoes-29-08-2026.md`)

## O QUE É ISTO
O pacote completo de um produto novo (Carteira Semente) e do sistema de agentes que o opera.
Nada aqui está em produção. É proposta a ser levada ao Gui Telles para validar ou recusar.

## FRONTEIRA DE AUTORIA — LER ANTES DE TUDO
- **CRM e Carteira de IA são projetos do Gui Telles.** Não redesenhar, não propor sistema para elas.
- **A Carteira Semente é proposta do Mr. G.** É onde o sistema pode nascer.
- O sistema de agentes é EXCLUSIVO da Semente. Se um dia fizer sentido levar para as outras,
  quem puxa essa conversa é o Gui.
- **A Semente CONSOME a CRM, em uma direção só** (Decisão 15). O universo de ativos é espelho
  filtrado do que a CRM publica. Mudança na CRM muda o universo da Semente — dependência real,
  registrada como risco conhecido e aceito. A Semente não redesenha, não critica e não propõe nada
  para a CRM. A fronteira de autoria continua intacta: o fluxo é de lá para cá.

## A LEI (invariantes do sistema — valem sempre)
1. **O GATE É SEMPRE HUMANO E INVIOLÁVEL.** Nenhum agente compra, vende, aporta ou publica.
   Eles medem, propõem, conferem e organizam. Quem assina é o Gui.
   *A venda parcial do degrau 3 do teto de concentração é o **único gatilho de venda determinístico**
   do sistema (Decisões 16 e 17): o sistema detecta o estouro, calcula a ordem sem nenhuma
   discricionariedade sobre o número e leva ao Gate 2. A assinatura é do Gui, sempre. O que torna o
   teto real é o gatilho ser obrigatório e não opcional — o Gate não enfraquece a regra, é o que a
   mantém dentro da lei. **A invariante 1 permanece intacta e inviolada.***
   *A **lista de gatilhos determinísticos de venda é fechada e tem três**: estouro acima de 12% do
   teto por ativo, queda abaixo de 2% do piso de posição, e realização programada da glidepath
   (Decisões 23 e 24). Qualquer outra venda é
   decisão de tese, com registro. **Gatilho novo exige decisão registrada — nunca nasce de
   implementação.***
2. **Nada sai para o cliente sem passar pelo Gui.** O sistema é ferramenta interna.
3. **A fonte é o gráfico/tooltip, NUNCA a memória.** Todo número citado tem que bater com a fonte.
4. **Quem propõe não audita.** Alocador e Auditor são papéis separados.
5. **Sem promessa de retorno. Sem previsão de preço.** Falhar aqui veta a saída, sempre.
6. **Preservação vem antes de convicção.** E isso é **regra, não calibragem**: quando a proteção
   programada e a alocação disputam o mesmo dinheiro, **a proteção vem primeiro e a alocação cede**
   — nunca o contrário, e nunca por acaso de dois fatores estarem alinhados (Decisão 26).
7. **Sempre os mesmos indicadores, todo dia, na mesma ordem.** Indicador que entra e sai conforme
   a conveniência vira desculpa para justificar o que já se queria fazer.
8. **Dado ilustrativo é rotulado como ilustrativo.** Nunca apresentar reconstrução como leitura real.
9. **MATERIAL COMERCIAL ABRE PELO PISO, E A DERIVA FICA REGISTRADA.** O número de capa é o menor
   resultado entre as partidas possíveis, no cenário conservador — nunca a leitura do dia. Toda
   revisão que mexa em projeção recalcula todas as partidas nos três cenários, e a tabela de deriva
   acumulada por versão é permanente: nunca apagada, nunca resumida. A trava de +15% vale para cada
   uma das quinze células contra a v1.3, é acumulada e **não zera por compensação**. Estourou uma
   célula, para a revisão inteira. O dono do piso é rastreado junto com o valor: piso estável com
   dono novo é informação, não silêncio. **A trava lê célula, não nome citado** — ninguém retém nem
   libera uma célula por menção. **A base é a v1.3 e nunca se move**, nem na recalibragem: o que se
   recalibra é o limite. **Linha desdobrada herda a referência da linha de que nasceu**, senão
   desdobrar vira porta de saída da trava.
10. **NENHUM NÚMERO DERIVADO É DIGITADO À MÃO.** Todo derivado — média, percentual, projeção,
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
   faixa que o estado já definiu — no máximo ±20%, pela fórmula da Decisão 4 em `02-agentes.md`.
   A modulação nunca leva o resultado ao patamar de um estado vizinho.
3. **Nada de default silencioso.** Quando uma leitura de origem falta, o sistema mostra que falta
   e não produz saída derivada dela. Vale para a Torre (indicador zerado se reporta, não se
   inventa), para o simulador (sem Linha d'Água não há projeção) e para o Reforço de Fundo (sem
   registro gravado não há liberação).
4. **Existem dois fluxos de dinheiro, e eles não se misturam.** O aporte do mês tem teto absoluto
   de 100%. O Reforço de Fundo é outra torneira — libera caixa acumulado em fundo de ciclo, sob
   sete travas, e passa pelo Gate como decisão própria (Decisão 6).
5. **Quem dispara a estação é o Índice de Plantio** — o cruzamento do estado (Linha d'Água) com o
   tempo restante até a entrega (Abrigo). O Índice Semente nunca dispara decisão sozinho.
6. **Divergência aparente entre os dois não é empate a resolver.** O estado é o da Linha d'Água; o
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
- **`indice-semente.html`** — a camada 5 entra na conta com peso 12 travado em 50
  (`posCamada` devolve 50 para `id===5`). Pela Decisão 5 ela fica FORA e os quatro pesos são
  renormalizados por 88 (38,6 · 29,5 · 18,2 · 13,6). A tela precisa marcar a camada como fora,
  não desenhá-la como se valesse 50. Com as três correções juntas, o índice exibido passa de
  50 para 51.
- **`indice-semente.html`** — não aplica o fator de confiança por janela (Decisão 7). O ETF Net
  Inflow entra bruto em 55,0 quando deveria entrar amortecido em 52,6, e a confiança de cada série
  não aparece na tela. Com as quatro correções juntas, o índice exibido é 51 e o valor interno
  50,75.
- **Nenhuma tela mostra a modulação da Decisão 4 nem o Reforço de Fundo da Decisão 6.** O
  modulador M, a matriz de aporte final e as sete travas do reforço não existem em lugar nenhum
  do pacote visual.
- **`simulador.html`** — o modelo de cenários está correto e segue sendo a fonte de verdade
  (Decisão 3). Mas a **Decisão 8 mudou a fase de partida**, e aí há três mudanças a fazer:
  a) `FASE_ESTADO=[0,2,3,1]` implementa o mapeamento antigo; o novo tem **cinco entradas para
  quatro estados** — Capitulação→0 · Prejuízo→**0** · Estresse→1 · Saudável com Índice < 65→2 ·
  Saudável com Índice ≥ 65→**3** (Decisão 10), o que exige o Índice do dia como segunda entrada,
  que o simulador hoje não recebe; b) a fase deixa de ser escolha do usuário e passa a ser lida da
  Linha d'Água, com o seletor nascendo preenchido e rotulado "fase atual lida hoje", marcando a
  simulação como hipotética se o usuário mudar; c) sem leitura da Linha d'Água, o simulador exibe
  estado indisponível e **não gera projeção** — nunca default silencioso; d) a tela precisa mostrar
  **o par completo — estado, índice, fase e mês de entrada** — para a partida ser auditável;
  e) **o motor deixa de ser anual e passa a ser mensal** (Decisão 11). Hoje `serie()` itera ano a
  ano e aplica uma fase por ano; com o mês de entrada a fase muda no meio do ano civil. A troca é
  no laço central, não na tabela de mapeamento. Especificação em `08-decisoes-29-08-2026.md`,
  com o critério de aceite que já foi verificado: **com mês de entrada 0, o motor mensal reproduz
  o anual com diferença zero** nas doze combinações de fase e cenário.
- **Nenhuma tela registra o ciclo do Reforço de Fundo** (Decisão 9). O contador de acionamentos, o
  marco de virada e o registro gravado de datas não existem em lugar nenhum — e sem registro
  gravado o reforço não pode ser liberado.

## ARQUIVOS DESTE PACOTE
- `00-BRIEFING-CODE.md` — este arquivo
- `01-documento-mae.md` — a fonte de verdade do produto
- `02-agentes.md` — especificação de cada agente
- `03-indice-semente.md` — o indicador composto (pesos, normalização, leitura de hoje)
- `04-linha-dagua.md` — o instrumento de origem da leitura
- `05-gates.md` — Gate 1 e Gate 2 da Semente
- `06-campanhas.md` — precificação, base e calendário de campanhas
- `07-leituras-29-08-2026.md` — as 14 leituras reais confirmadas no terminal (fonte primária)
- `08-decisoes-29-08-2026.md` — as decisões 1 a 14, o que cada uma invalidou e o que ficou aberto
- `09-ritual-operacional.md` — como o Mr. G aciona o sistema no dia a dia
