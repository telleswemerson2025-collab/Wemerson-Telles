# BRIEFING PARA O CODE — Sistema Carteira Semente
Wemerson Telles · BlockCapital Research · 29/08/2026
Versão 1.25 — decisões 1 a 44 de 29/08/2026 aplicadas (ver `08-decisoes-29-08-2026.md`)

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
9. **NOME DIFERENTE NUMA DECISÃO É ERRO DE REDAÇÃO ATÉ PROVA EM CONTRÁRIO.**
   Renomeação de camada, de estado, de faixa ou de indicador é **decisão registrada
   própria**, nunca efeito colateral do texto de outra decisão. Quando nome e número
   discordam, **manda o número**, que é inequívoco — e o implementador levanta a
   divergência em vez de escolher sozinho (Decisão 40).
10. **MATERIAL COMERCIAL ABRE PELO PISO, E A DERIVA FICA REGISTRADA.** O número de capa é o menor
   resultado entre as partidas possíveis, no cenário conservador — nunca a leitura do dia. Toda
   revisão que mexa em projeção recalcula todas as partidas nos três cenários, e a tabela de deriva
   acumulada por versão é permanente: nunca apagada, nunca resumida. A trava de +15% vale para cada
   uma das quinze células contra a v1.3, é acumulada e **não zera por compensação**. Estourou uma
   célula, para a revisão inteira. O dono do piso é rastreado junto com o valor: piso estável com
   dono novo é informação, não silêncio. **A trava lê célula, não nome citado** — ninguém retém nem
   libera uma célula por menção. **A base é a v1.3 e nunca se move**, nem na recalibragem: o que se
   recalibra é o limite. **Linha desdobrada herda a referência da linha de que nasceu**, senão
   desdobrar vira porta de saída da trava.
11. **NENHUM NÚMERO DERIVADO É DIGITADO À MÃO.** Todo derivado — média, percentual, projeção,
   posição normalizada — é calculado a partir da fonte primária, em tempo de execução. Se um
   derivado aparece em dois lugares, um dos dois está errado por definição. Quando documento e
   instrumento divergem, o instrumento (que calcula) está certo e o documento (que digitou) está
   errado: corrige-se o documento, nunca a fórmula.

12. **TEXTO VISÍVEL QUE CITA NÚMERO SAI DA CONSTANTE.** Todo rótulo, legenda ou frase de tela que
   cite um número, um prazo ou um limiar é **gerado** a partir da constante que o sistema usa —
   nunca escrito à mão. Onde a frase não puder ser gerada (texto corrido de documento), ela leva
   **teste de redação**, que quebra se o número escrito divergir da constante. *Rótulo dizendo 3
   com o sistema bloqueando a 4 engana exatamente quem está tentando conferir: é pior que não ter
   rótulo, porque transforma a tela de instrumento de auditoria em fonte de erro.* Decisão 44.
   É irmã da invariante 11: aquela proíbe digitar derivado, esta proíbe digitar constante.

## ÂNCORAS ESTRUTURAIS (Decisão 27)
**Parâmetro que existe para conter deriva lenta nasce marcado como âncora**, e não é protegido
depois que alguém percebe.

| # | Âncora | Origem | Contra que deriva |
|---|---|---|---|
| 1 | A base **v1.3** da trava de deriva | D14 | números publicados subindo por revisões sucessivas |
| 2 | O teto de **12 pontos** de defasagem | D25 · D26 | exposição ficando para trás do alvo, ciclo após ciclo |
| 3 | O piso de **60%** em BTC e ETH | D16 | diluição lenta da qualidade da carteira |
| 4 | A **lista fechada** dos três gatilhos de venda | D23 · D24 | gatilho novo nascendo de implementação |
| 5 | A validade de **180 dias** do degrau de invalidação | D18 | julgamento antigo com cara de número atual |
| 6 | O teto de **8% por ativo**, com a faixa até **12%** | D15 · D16 | concentração crescendo ciclo a ciclo |
| 7 | O piso de **2% por posição** | D22 | a cauda miúda voltando, com o custo operacional junto |
| 8 | A **banda de 3 pontos** da glidepath | D24 · D30 | a exposição com que a criança recebe a carteira |
| 9 | A **trava 6** do Reforço de Fundo — caixa nunca abaixo de **10%** da carteira | D6 · D31 | a reserva sumindo acionamento a acionamento |
| 10 | O **limiar de liquidez** — US$ 100 mi de volume diário de 30 dias, em ao menos **duas** exchanges medidas separadamente | D37 | a carteira ganhando ponta da qual não dá para sair |
| 11 | A **lista de exchanges de primeira linha** — Binance · Coinbase · Kraken · OKX · Bybit · Bitget | D38 | a mesma promessa do membro 10 |

> **Os membros 10 e 11 são âncora de par**, como o teto de 8% e o gatilho de 12%.
> Afrouxar a lista sem tocar no número tem o mesmo efeito de baixar o número: um
> ativo que hoje reprova passaria, com o "US$ 100 mi" intacto na página.
>
> **Para a lista mudar:** entrar exige operar há cinco anos ou mais, estar entre as
> maiores por volume à vista de forma sustentada e não pontual, e publicar prova de
> reservas ou equivalente auditável — tudo por decisão registrada no Gate 2.
> **Sair é mais rápido que entrar:** insolvência, suspensão de saques ou perda de
> licença relevante tira a exchange na hora, por decisão registrada, sem esperar
> rodada.

> **O membro 10 é o primeiro nascido na implementação**, exatamente pelo caminho
> que a Decisão 31 parte C previu: parâmetro novo criado durante a construção
> passa pelos quatro critérios uma vez, e o resultado entra na lista ou na tabela.
> A classe seguia fechada; o que mudou foi que apareceu um parâmetro novo.

> **A classe está fechada** (Decisão 31). Ela para de crescer por rodada e passa a mudar **só por
> evento**: parâmetro novo criado durante a implementação passa pelos quatro critérios **uma vez**, e
> o resultado entra na lista ou na tabela de exclusão. **Não há mais varredura de candidatos** — o
> sistema já foi varrido inteiro três vezes, e a quarta encontraria só o que as três recusaram.

> **A faixa 8%–12% é âncora de par.** Mover só o gatilho de 12% para 15% afrouxa o teto efetivo sem
> tocar no número protegido: o ativo passaria a passear até 15% sem venda nenhuma. **Âncora de faixa
> se move junta ou não se move.**

### O teste de admissão
Um parâmetro é âncora quando **as três** valem:

1. **Afrouxá-lo não produz efeito visível na rodada em que se afrouxa.**
2. **O dano só aparece depois de várias rodadas somadas.**
3. **Cada afrouxamento isolado tem justificativa razoável.**
4. **Sua deriva degrada uma promessa publicada ao cliente.**

Falhando qualquer uma das **quatro**, é régua, piso ou parâmetro — e se calibra normalmente, com
registro.

**Os três primeiros dizem que o dano é lento e disfarçado. O quarto diz de quem é o dano.** Sem ele
o teste admitiria qualquer limite de proteção, porque proteção age devagar por desenho — e a classe
viraria "todo número do sistema", que é o mesmo que não existir.

> **A distinção que o critério 4 produz:** mecânica que muda **quando** fica fora; mecânica que muda
> **o que o cliente recebe** entra. A fórmula de espaçamento só move datas, e data movida não muda
> nada do que foi prometido. A banda de 3 pontos muda a exposição da entrega, e essa é a promessa
> central do produto.

*É o teste que descreve o padrão de dano que a classe existe para conter:* 180 → 240 → 300 dias,
cada passo por um bom motivo de rodada, e nenhuma rodada isolada teria parecido errada.

**Regra estrutural entra pelo espírito, não pela letra.** O teste foi escrito para parâmetro
numérico. Numa regra estrutural, o teste 1 lê-se assim: **o dano não é o ato visível, é o precedente
que ele cria.** A lista fechada de gatilhos é o caso — o gatilho novo aparece, mas o que degrada é a
ideia de que gatilho pode nascer sem decisão.

### A tabela de exclusão
**Todo candidato testado e recusado entra aqui, com o critério em que falhou.** Ela é tão importante
quanto a lista: **é ela que mostra onde a classe para**, e sem ela a fronteira só existiria na cabeça
de quem testou.

| Parâmetro | Falha em | Por quê |
|---|---|---|
| A trava dos **30%** da camada 5 | **1** | Afrouxar produz leitura ruim **hoje**, visível na hora. É piso de qualidade da leitura, não deriva lenta. |
| O limite de **15%** da trava de deriva | **1** | Afrouxar libera células retidas na mesma rodada. E a D19 regra 6 já o declara provisório: âncora é o que segura a régua; o limite **é** a régua. |
| Os **45 dias** entre BTC e ETH | **4** | Só move datas de vencimento. Nenhuma promessa ao cliente muda. |
| O **piso de 90 dias** de validade | **4** | Idem: agenda a medição, não altera o que é medido nem o que é entregue. |
| A **fórmula de espaçamento** | **4** | Idem. Muda **quando**, não **o quê**. |
| O **teto de 8 ativos** | **1** | Afrouxar rompe a régua dos 30% e o mapa do Auditor acusa na mesma rodada. É restrição derivada, não âncora. |
| A revisão de **90 dias** da vaga bloqueada | **4** | O cliente não recebe promessa de cadência de rotação. |
| O **calendário por série** — 24/7 · pregão · mensal *(nasceu na implementação)* | **1** | Mesmo caso do 100: não é calibragem, é fato sobre a fonte. Marcar o DXY como 24/7 muda a leitura de datas **na hora**. Fatos sobre o dado nunca são âncoras — a âncora protege promessa, não descreve fonte. |
| O **100** do Supply in Profit *(nasceu na implementação)* | **1** | Não é calibragem nossa: é o **teto da métrica**, que mede percentual de supply. "Afrouxá-lo" para 99 muda a normalização e move o Índice **hoje**, visível na hora. Fato sobre o que a série mede, não parâmetro — entra pela regra da D31 C e para aqui. |
| A **trava 4** do Reforço de Fundo — 25% do caixa por acionamento | **4** | Não guarda promessa publicada própria. A promessa do reforço é **coletiva** (*"sete travas, para que ele não vire gatilho de impulso"*) e sobrevive ao afrouxamento dela, porque as travas 1, 2, 3, 5 e 7 seguem inteiras. E a trava 6, agora âncora, já limita o mesmo dano: com o caixa abaixo de 23,7% da carteira é ela que binda, e a trava 4 fica folgada. |

**Regra da classe:** alterar uma âncora exige **decisão registrada com a razão escrita**, passa pelo
**Gate 2**, e a alteração fica na **tabela de deriva em caráter permanente**. Nenhuma âncora muda
por calibragem, por implementação ou por conveniência de rodada. O Auditor confere a cada rodada.

**A regra vale nos dois sentidos: para tirar e para pôr.** Incluir membro por conta própria é a
mesma violação que remover — e é a mais tentadora, porque parece zelo.

*Contra-exemplo que define a fronteira da classe:* o limite de 15% da trava de deriva **não** é
âncora — a D19 regra 6 o declara provisório e prevê recalibragem na décima segunda versão. Âncora é
o que segura a régua; o limite é a régua, e régua se calibra.

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
