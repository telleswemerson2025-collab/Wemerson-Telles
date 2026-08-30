# PEÇA 2 — TORRE DE CONTROLE
Conferência. Versão 1.18 · 29/08/2026 — o registro tem mais precisão que a tela

**Não é aprovação de código. É conferir se o que foi escrito é o que a decisão diz.**

- `torre.mjs` — o módulo. Sem dependências. Lê o registro da peça 1, não guarda nada.
- `leitura-29-08-2026.mjs` — as catorze leituras reais do documento 07, transcritas.
- `torre.test.mjs` — 79 testes da Torre (128 no pacote inteiro). `node --test` na raiz.

## ⭐ ITEM 5 — O TESTE QUE PROVA A LEITURA DE 29/08/2026
Entrada: as catorze leituras reais do `07-leituras-29-08-2026.md`, com mínimas e
máximas do range ALL. Saída do módulo:

```
índice 50.7536 · exibido 51 · Equilíbrio · Mercado saudável
  camada 1: 44.41 · peso 38.6%
  camada 2: 60.27 · peso 29.5%
  camada 3: 50.88 · peso 18.2%
  camada 4: 47.94 · peso 13.6%
  fora: 5 (sem carteira ativa)
  ausente: Exchange Netflow (não foi coletado em 29/08/2026)
  ETF: 54.97 -> 52.61 · confiança 0.5251 (janela até 27/08, data do dado)
```

Bate com o `03-indice-semente.md` em todos os números: **50,75 · Equilíbrio**, as
quatro camadas, os quatro pesos renormalizados e o amortecimento do ETF.

Testes: *"as catorze leituras reais devolvem 50,75"* · *"cada camada bate com o
documento 03"* · *"a camada 5 fica fora e os pesos renormalizam sobre 0,88"*.

### Do que ele protege, medido
O item 5 é o único teste que compara a Torre com um número conferido fora dela.
Vale saber exatamente o que isso cobre — e o que não cobre.

**O que o torna um cheque real:** o 50,75 foi derivado por um caminho diferente
(scripts avulsos, camada a camada, na rodada da Decisão 7), em outro momento, e
ratificado no `03-indice-semente.md`. Não é verificação externa de terceiro — o
âncora externo de verdade é o terminal — mas é o cheque mais forte disponível.

**E a Decisão 36 C fechou uma folga que ninguém tinha visto.** Antes dela a Torre
dava `50.7540` e a derivação da Decisão 7 dava `50.7536`: quatro décimos de
milésimo de diferença, invisível na tolerância do teste, que vinha exatamente de
medir a confiança do ETF até hoje em vez de até a data do dado. A derivação
original media até a data do dado. **Agora as duas implementações batem dígito a
dígito**, e o teste fixa `50.7536` na quarta casa em vez de aceitar uma faixa.

Foi a decisão de princípio que revelou a divergência de implementação, não o
contrário — e é o argumento mais forte que a rodada produziu a favor de decidir
pela razão certa mesmo quando o efeito parece nulo.

**Do que ele protege, na prática.** Rodada a sensibilidade do índice a cada uma
das 42 entradas:

| Classe de erro | Efeito no índice | O item 5 pega? |
|---|---|---|
| Erro de transcrição de 1% num número | no máximo **0,135 ponto** | pega, mas nem precisaria |
| Erro que mudaria a faixa por transcrição | exigiria **~68%** num único número | não acontece |
| **Escala trocada (log ↔ linear)** | MVRV: 44,4 vira **14,5** · índice cai ~11,5 pontos | **pega, e é o que importa** |

A conclusão inverte a intuição: **o erro de transcrição é quase inofensivo** — o
índice é robusto e as faixas têm 20 pontos de largura. **O erro perigoso é o de
classe**, e é justamente o que o item 5 pega, porque uma escala trocada em
qualquer das seis séries logarítmicas quebra o 50,75 na hora.

**O que ele não cobre:** as entradas. O `07-leituras` registra que os extremos
**não puderam ser confirmados um a um pela tooltip** — no zoom ALL o cursor salta
cerca de sete dias e não encosta no dia exato do topo. São **28 dos 42 números**,
e são os denominadores de toda normalização. Acrescentei dois testes que fecham a
parte fechável disso:

- *"as catorze entradas batem, dígito a dígito, com o documento 07"* — fixa a
  transcrição. Editar qualquer valor, mínima ou máxima quebra o teste pelo nome do
  número.
- *"a escala de cada série é a que o documento 03 manda"* — fixa as seis
  logarítmicas e as oito lineares, e prova que trocar a régua da camada 1 tiraria
  o índice de Equilíbrio.

O que resta descoberto é só o elo terminal → documento 07, que nenhum teste
alcança. As três conferências por tooltip que o documento 07 registra são hoje a
única evidência dele.

## ITEM 1 — NORMALIZAÇÃO POR FAIXA PRÓPRIA
`normalizar(valor, min, max, escala, invertido)`, com a escala declarada em
`SERIES` por indicador.

| Prova | Teste |
|---|---|
| Log na multiplicativa: MVRV 1,465 dá **44,4**; linear daria **14,5** | *"log para série multiplicativa, linear para aditiva"* |
| Linear na aditiva: Supply in Profit 67,4 dá 49,4 | idem |
| DXY e Fed Funds invertidos: 63,7 vira **36,3** | *"DXY e Fed Funds entram invertidos"* |
| Valor fora da faixa é **limitado**, não extrapolado | *"valor fora da faixa histórica é limitado"* |
| Confiança amortece só a série curta — hoje só o ETF | *"o fator de confiança amortece só a série curta"* |

A diferença entre log e linear no MVRV é de **30 pontos** na mesma leitura. É o
lugar onde a Torre erraria em silêncio e ninguém veria.

## ITEM 2 — RENORMALIZAÇÃO E AUSÊNCIAS
| Prova | Teste |
|---|---|
| Ausência nomeada uma a uma, com a camada de cada uma | *"ausência é nomeada uma a uma"* |
| Indicador zerado ou com traço é **ausência**, não zero | *"indicador zerado ou com traço é ausência"* |
| Camada incompleta sai inteira; pesos renormalizam sobre o que voltou | *"camada incompleta sai inteira"* |
| A entrega diz quais camadas entraram e quais ficaram fora, com motivo | idem, e `camadasForaDaConta` |
| Sem nenhuma camada inteira, não há índice — e o motivo vem junto | *"sem nenhuma camada inteira, não há índice"* |

**Ausência parcial dentro da camada (D36 B):** a camada renormaliza internamente
sobre os indicadores que voltaram, e sai inteira só se os ausentes pesarem **mais
de um terço** dela. É a mesma mecânica que o sistema já usa um nível acima.

| Camada | Indicadores | Um ausente | Dois ausentes |
|---|---|---|---|
| 2 · Comportamento | 3 | 33% — **cabe** | 67% — sai |
| 3 · Macro | 4 | 25% — **cabe** | 50% — sai |
| 4 · Fluxo | 2 | **50% — sai** | — |

**A camada 4 ganhou um terceiro indicador (D37 C)** — o Exchange Netflow — porque
com dois qualquer ausência a derrubava, e a régua interna nem chegava a ser
testada. Agora ela se comporta como as outras: uma ausência pesa 33% e cabe.

| Camada | Indicadores | Um ausente | Dois ausentes |
|---|---|---|---|
| 2 · Comportamento | 3 | 33% — cabe | 67% — sai |
| 3 · Macro | 4 | 25% — cabe | 50% — sai |
| 4 · Fluxo | **3** | **33% — cabe** | 67% — sai |

Pesos internos iguais entre os três, por D37 D: *peso inventado é pior que peso
igual.*

### ⭐ O âncora de 29/08 sobreviveu ao indicador novo, e não por sorte
O Exchange Netflow **não foi coletado em 29/08/2026** — ele não existe no
documento 07. Ainda assim o índice continua **50.7536**, exato.

O motivo é a regra da D36 B, decidida uma rodada antes: com três indicadores na
camada, um ausente é exatamente um terço, e um terço cabe. A camada renormaliza
sobre ETF e Funding e reproduz o mesmo 47,9351 de quando eram só esses dois.

**Sem a D36 B, acrescentar o décimo quinto indicador teria invalidado a única
leitura conferida do sistema.** As duas decisões foram tomadas por razões
independentes e se encaixaram — vale registrado, porque na próxima vez pode não
encaixar, e aí a leitura histórica precisa de tratamento próprio.

## ITEM 3 — CAMADA 5 SUSPENSA POR INTEIRO (D21 B)
| Prova | Teste |
|---|---|
| BTC ou ETH **vencido** suspende, com ativo e data no texto | *"BTC vencido suspende a camada 5 inteira"* |
| BTC **nunca atribuído** suspende igual — não é ausência diluída | *"BTC sem degrau nenhum também suspende"* |
| A suspensão entra como camada fora, e os pesos renormalizam | *"a suspensão entra no índice como camada fora"* |
| Com degraus vigentes: média ponderada pela posição (D17 B) | *"a camada 5 é média ponderada pela posição"* |
| Trava dos 30%, contando só quem não é BTC nem ETH (D17 C · D21 B) | *"a trava dos 30% derruba a camada"* |
| 24% sem degrau ainda cabe | *"três ativos sem degrau ainda cabem na trava"* |

## ITEM 4 — COMPOSIÇÃO DA CRM ILEGÍVEL CONGELA O UNIVERSO
| Prova | Teste |
|---|---|
| Congela no último estado conhecido, com `desatualizadaDesde` | *"ilegível congela o universo no último estado"* |
| A ilegibilidade **também é gravada** — não é silêncio | idem, `evento.legivel === false` |
| Sem leitura anterior nenhuma, não inventa universo | *"ilegível sem nenhuma leitura anterior"* |
| Incluídos e removidos, com o filtro aplicado na hora | *"incluídos e removidos, com o filtro"* |
| "Nada mudou" sai como nada mudou | *"nada mudou sai como nada mudou"* |

## O QUE APARECEU AO ESCREVER

### 0. O que a D37 fechou
A alínea (a) ganhou número: **US$ 100 mi de volume diário médio de 30 dias, em ao
menos duas exchanges de primeira linha, cada uma medida sozinha.** Somar não vale
— está testado que 60 + 60 milhões reprova, embora somem 120.

O limiar entrou como **décimo membro da classe âncora**, e é o primeiro nascido na
implementação, pelo caminho que a D31 parte C previu.

**A lista de primeira linha foi fechada pela D38 A**, com seis nomes: Binance,
Coinbase, Kraken, OKX, Bybit e Bitget. Exchange fora da lista **não conta**, por
maior que seja o volume — e sai relatada em `exchangesIgnoradas`, para que ignorar
seja visível e não silencioso. Entrou como membro 11 da classe âncora, **em par
com o membro 10**: está testado que um ativo reprovado com uma exchange de fora
passaria se ela entrasse na lista, sem o número 100 mi se mexer.

### 1. O Filtro de Horizonte não é automatizável — três das quatro alíneas são julgamento
A D16 B manda cada incluído passar pelo Filtro "na hora". Das quatro alíneas da
D15, **só a (b)** é mecânica — atravessou um ciclo, ou é BTC ou ETH. As outras
três são julgamento:

| Alínea | Por quê |
|---|---|
| ~~(a) liquidez~~ | **fechada pela D37 A** — passou a ser objetiva |
| (c) tese que não dependa de evento datado | leitura de tese |
| (d) não alavancado, sintético, nem contraparte concentrada | classificação |

Implementado assim: o ativo fica **PENDENTE** até haver julgamento, e **nenhum
evento de filtro nasce**. Aprovar por omissão seria o default silencioso; reprovar
por omissão barraria ativo bom sem razão. A Torre entrega o pendente nomeado, com
as alíneas que faltam, para o humano decidir.

**Consequência:** a varredura da CRM não fecha sozinha. Todo ativo novo trava até
alguém julgar três alíneas — o que está certo, mas significa que o ritual diário
tem um passo humano que o documento 09 não descreve.

### 2. ~~A confiança medida até hoje~~ — fechada pela D36 C
Passou a ser medida até a última data do próprio indicador. Ver acima: foi essa
mudança que revelou a divergência de 0,0004 entre as duas implementações.

### 3. A Torre não classifica estação, e há teste disso
`r.estacao` é `undefined` por construção, e `semRecomendacao` sai `true` em toda
entrega. A estação vem do Índice de Plantio, que é peça 3.

## O ESTADO DE CONFERÊNCIA DOS EXTREMOS (D35)
O estado ficou **no dado**, não em nota de rodapé. Cada número carrega `confirmado:
{ valor, min, max }` com a data da conferência ou `null`.

```
estado: 16 confirmados · 26 provisórios de 42
```
*Abertura: 14 e 28. **O MVRV saiu inteiro da fila** — valor, mínima e máxima
conferidos em 29/08/2026. É a primeira série com a régua toda verificada, e é a
que mais pesa: ela é a régua da camada 1, que vale 38,6% do índice.*

Os 14 confirmados são os valores, que o documento 07 diz terem sido lidos "um por
um" pela tooltip. Os 28 provisórios são as mínimas e as máximas, que o cursor no
zoom ALL não alcança. O netflow nasce provisório inteiro — valor e extremos —
levando o total a 45 e os provisórios a 31 quando ele entra na varredura.

### A fila, ordenada por efeito medido (D41 A)
```
Liveliness · max         1,1820   lin · Comportamento (26%)
Supply in Profit · max   0,6536   lin · Comportamento (26%)
US M2 · max              0,6322   log · Macro (16%)
DXY · max                0,6282   log · Macro (16%)
SOPR · min               0,4318   log · Comportamento (26%)
DXY · min                0,3551   log · Macro (16%)
...
US M2 · min              0,0000   inerte só na leitura de hoje
Preço do BTC · min       0,0000   inerte por construção
Preço do BTC · max       0,0000   inerte por construção
(mais seis inertes por construção)
```
A ordem antiga não sobrevive a nenhuma linha dessa tabela: **a cabeça é linear**, e
**camada 3 vem antes de camada 2**. Escala e peso de camada eram estimativas do
efeito; com `efeitoDosExtremos()` medindo o efeito de verdade, a estimativa perde a
função — é o mesmo movimento da D14.

Três testes seguram isso: a fila desce monotonicamente por efeito (fora os inertes),
a cabeça de hoje é o Liveliness · max com 1,1820, e os oito inertes por construção
ocupam exatamente as oito últimas posições **sem sair da fila** (D41 B) — se a
camada 1 trocar de régua um dia, eles voltam a contar, e uma fila que os tivesse
descartado não saberia.

O **US M2 · min** é o caso da D41 C: efeito zero, e mesmo assim **acima** dos oito.
Zero de hoje não é zero de sempre. Só a inércia estrutural rebaixa.

**Os valores saíram da fila de extremos** (D41 D). Valor não tem efeito de régua —
errar um valor move a leitura de um dia, errar um extremo move a régua inteira. Eles
se conferem à parte, por `valoresPendentes()`; hoje são zero, os catorze já foram
lidos um a um pela tooltip.

A fila é **recalculada a cada leitura** (D41 E), porque o efeito de um extremo anda
com o valor corrente. Há teste: mexer no valor do Liveliness muda o efeito do
próprio máximo dele.

*Os testes de contagem foram reescritos para medir **progresso**, não um instante:
fixam que a conta fecha e que a conferência nunca anda para trás, em vez de fixar
"14 e 28". Testes que quebram a cada conferência transformariam a fila em inimiga
do trabalho.*

### O comando, um extremo por vez
```
Conferir no terminal VantageNode, somente leitura: MVRV Ratio · min.
Valor a bater: 0.384 na data 2011-10-19.
Passos: abrir a série · estreitar a janela em torno da data até o passo do cursor virar um dia ·
ler a tooltip · anotar o valor dígito a dígito · voltar ao range ALL.
Nunca publica, nunca altera, nunca apaga. Restaura o estado da tela. A sidebar nunca aparece.
```

### ✅ O primeiro extremo conferido — e o que ele ensinou sobre o comando
**MVRV Ratio · min = 0,384 em 19/10/2011**, lido na tooltip em modo SMA, com a
janela estreitada até o passo do cursor virar um dia. Registrado no dado, com o
método, os vizinhos e a tela restaurada.

A conferência veio **mais forte do que o comando pedia**, e a diferença importa:

| O que o comando pedia | O que foi entregue |
|---|---|
| a tooltip do dia | a tooltip do dia: 0,384 |
| — | os vizinhos: 18/10 = 0,418 · **19/10 = 0,384** · 20/10 = 0,411 |
| — | a varredura do ALL: nenhum ponto abaixo; 2015, 2018 e 2022 param acima |
| — | cruzamento: BTC PRICE na mesma tooltip, US$ 2 |

**Ler a tooltip prova que o número daquele dia está certo. Não prova que aquele dia
é o extremo.** São coisas diferentes, e só a segunda é o que a normalização precisa
— o denominador de toda a régua é o extremo, não um valor qualquer.

O comando foi reescrito para pedir as três coisas, com a direção acompanhando o
campo (abaixo para mínima, acima para máxima) e um pedido de cruzamento quando
houver outro indicador na mesma tooltip. **A melhoria veio da conferência, não do
desenho.**

*O cruzamento fecha, aliás:* MVRV 0,384 com BTC a US$ 2 implica Realized Price de
~5,21 — e o documento 07 dá mínima de 0,088 em janeiro de 2011. De 0,088 a 5,21 em
dez meses é o ciclo de 2011, e MVRV abaixo de 1 com o preço em US$ 2 é a definição
de capitulação profunda: o mercado valendo menos do que custou.

### A máxima: 7,854 em 04/06/2011, com o segundo pico descartado
A conferência trouxe um vizinho perigoso que o comando não previa: **um segundo
pico em 08/06/2011, em 7,809** — a **0,58%** do máximo. Foi conferido de propósito
para não confundir os dois.

Isso muda o estatuto do modo de leitura. **A data do máximo depende dessa margem de
meio por cento**, e outra suavização poderia virá-la de 04/06 para 08/06 sem que o
valor mudasse muito. Por isso o `modo SMA` ficou registrado no dado, não como
detalhe: **sem ele a conferência não é reprodutível.**

#### Três coisas que a leitura fechou por fora
**1. Bate com a conferência avulsa do documento 07.** O doc registra
*"MVRV 05/jun/2011 = 6,718"*, feita ao acaso, meses antes. Esta leitura
independente deu **6,718** no mesmo dia. Duas leituras separadas da mesma tooltip,
dígito a dígito.

**2. O Realized Price implícito conta a história certa.**

| Data | MVRV | BTC | Realized Price implícito |
|---|---|---|---|
| 04/06/2011 | 7,854 | US$ 16 | ~2,04 |
| 08/06/2011 | 7,809 | US$ 28 | ~3,59 |
| 19/10/2011 | 0,384 | US$ 2 | ~5,21 |

De ~2,04 em junho para ~5,21 em outubro: **o custo da rede subindo enquanto o preço
caía de US$ 16 para US$ 2.** É a assinatura de um topo — moeda cara comprada na
alta puxando a base de custo para cima enquanto o preço já foi embora.

**3. O pico do MVRV veio quatro dias antes do pico do preço.** Em 04/06 o MVRV
marcou 7,854 com BTC a US$ 16; em 08/06, com o preço **75% maior**, o MVRV estava
**menor**. O Realized Price subiu 76% nesses quatro dias, quase no mesmo passo do
preço — e por isso a razão não inflou. É o MVRV fazendo exatamente o que promete:
blow-off que também levanta o custo da rede não vira leitura de euforia maior.

### 🔴 A terceira conferência não fechou — e revelou que a fila está de trás para a frente
**Preço do BTC · min = 0,29 em 03/01/2011: NÃO CONFIRMADO.** O terminal arredonda
BTC PRICE para dólar inteiro, então 03/01/2011 lê **"$0"** — e 02, 04, 05 e 06/01
leem "$0" também. Empate de cinco dias, sem desempate possível no gráfico. Só o
item 3 se sustentou: na visão ALL o ponto mais baixo está no início da série.

A tentativa ficou **registrada no dado**, com o motivo e o caminho que fecharia (a
fonte do número cru, não o gráfico), para que ninguém repita.

#### E aí veio o achado: **os extremos das quatro séries de preço são inertes**
Medido, não deduzido — um erro de **dez vezes** em qualquer um deles muda o índice
em **0,000000**:

| Extremo | Efeito de um erro de 10% |
|---|---|
| Preço do BTC · min e max | **0,000000** |
| Realized Price · min e max | **0,000000** |
| Realized Price STH · min e max | **0,000000** |
| Realized Price LTH · min e max | **0,000000** |
| *(controle)* MVRV · min | 0,700364 |

**O motivo é estrutural:** a camada 1 normaliza preço ÷ Realized Price contra a
faixa do **MVRV**, não contra a faixa delas. E a Linha d'Água **compara** preços
entre si — não normaliza, não usa extremo. Os oito números nunca entram em conta
nenhuma, em nenhum estado de mercado.

**A prioridade da D35 D manda conferi-los primeiro.** Eles são logarítmicos e de
camada 1, os dois critérios da regra — e são os únicos oito estruturalmente
inúteis dos vinte e oito. A conferência que não fechou foi gasta num deles, e os
seis seguintes da fila são os outros.

#### A ordem por efeito medido, dos que faltam e importam
| Extremo | Efeito | |
|---|---|---|
| **Liveliness · max** | **1,1820** | quase o dobro do MVRV · min |
| Supply in Profit · max | 0,6536 | |
| US M2 · max | 0,6322 | |
| DXY · max | 0,6282 | |
| SOPR · min | 0,4318 | |
| DXY · min | 0,3551 | |

A Liveliness · max lidera porque o valor de hoje (0,6345) está encostado nela
(0,6410): quando o valor mora perto do extremo, o extremo vira o denominador que
manda.

#### Uma distinção que o número sozinho esconde
Nove extremos deram zero, mas **por dois motivos diferentes**:

- **Inertes por construção (8):** os das quatro séries de preço. Zero hoje, zero
  sempre, em qualquer mercado.
- **Inerte só na leitura de hoje (1):** o **US M2 · min**. O valor está exatamente
  na máxima (23,218 = 23,218), e aí `(v−min)/(max−min)` dá 1 para qualquer mínimo.
  Volta a pesar no dia em que o M2 sair da máxima. *(Liveliness · min e Fed Funds ·
  min estão quase lá, pelo mesmo motivo.)*

Confundir os dois seria caro: dispensar o M2 · min porque "não afeta" o deixaria
sem conferência justamente até o dia em que passa a afetar.

**Não mudei a ordem da fila por conta própria** — a D35 D era decisão. O que fiz foi
medir e mostrar: `efeitoDosExtremos()` calcula o efeito real, `EXTREMOS_INERTES`
nomeia os estruturais, e a contagem passou a separar **"26 provisórios"** de **"18
provisórios que importam"**. A **D41** veio depois e trocou a régua da fila pelo
efeito medido.

### Uma armadilha de recursão que a D41 criou
Ordenar por efeito custa recalcular o índice, e quem entrega a contagem de extremos
é o `varrer()`. Se `estadoDosExtremos()` continuasse chamando a fila, `varrer` →
`estadoDosExtremos` → `filaDeConferencia` → `efeitoDosExtremos` → `varrer` fechava o
ciclo. `estadoDosExtremos()` virou **contagem e só contagem**: não ordena, não
devolve `proximo`. Contagem dentro do `varrer`, ordem fora dele.

### ✅ A terceira conferência: **Liveliness · max = 0,6410 em 20/12/2025**
Vizinhos 0,6409 e 0,6409 — diferença de **0,0001**, que é o menor passo que a tela
representa. Cruzamento: BTC US$ 88.181.

**O empate.** 12/12/2025 exibe o **mesmo** 0.6410 na tooltip. Não é empate de valor,
é empate de **exibição**: o terminal mostra quatro casas e as duas datas caem no
mesmo arredondamento. A tooltip não podia decidir, e insistir nela não decidiria —
o número que ela mostra é igual nos dois dias. Resolvido por zoom: na janela
23/11/2025 → 26/01/2026, onde 1 px vale ~0,000003, 20/12 fica ~13 px acima.

**Isso é outro método**, e ficou nomeado no dado como tal: `separação por pixel, não
leitura de dígito`. As duas conferências anteriores foram leitura de dígito; esta
não. Misturar as duas sem dizer qual foi seria perder a diferença entre "eu li" e
"eu inferi do desenho".

**O que o empate custa, medido:** a máxima só é conhecida até ±0,00005, e essa
incerteza move o Índice em **±0,00105 ponto**. Mesmo que 12/12 fosse o topo de fato
(≈0,64096), o Índice sai de 50,7536 para 50,7545. Irrelevante — mas é irrelevante
**medido**, não irrelevante suposto.

*O cruzamento de preço separou as duas datas por outra via: em 12/12 o BTC estava a
US$ 91.629, 3,9% acima do de 20/12, com Liveliness igual. Duas datas com o mesmo
número e comportamentos diferentes de preço.*

### ✅ A quarta conferência: **DXY · max = 114,11 em 27/09/2022**
Vizinhos 114,10 e 112,60. Cruzamento BTC US$ 19.634. Na visão ALL, de 2011 a 2018
nenhum ponto entra na faixa de 107+; o segundo maior de toda a série é o repique do
início de 2025, em ~110,5 — quase 4 pontos abaixo.

**O caso oposto ao do Liveliness, e é por isso que ele importa.** 26/09 fica um
centésimo abaixo — colado. Mas os **dígitos diferem** (114.10 ≠ 114.11) e a tooltip
decide sozinha, sem zoom. Lá o empate era de exibição e só o pixel separou; aqui é
desempate no dígito. As duas conferências ficam com o método nomeado, e agora há um
par: dá para ver qual é qual.

**A tooltip do DXY mostra duas casas, não quatro.** A resolução de exibição é **por
série**, não do terminal. Isso não estava escrito em lugar nenhum e só aparece
conferindo.

### O arredondamento da tooltip nunca foi o elo fraco
Com quatro extremos conferidos em três resoluções diferentes, dá para medir em vez
de supor. Meia casa de exibição de cada um, na resolução da própria série:

| Extremo | Casas | Meia casa | Efeito no Índice |
|---|---|---|---|
| **MVRV Ratio · min** | 3 | ±0,0005 | **0,00926** |
| Liveliness · max | 4 | ±0,00005 | 0,00105 |
| MVRV Ratio · max | 3 | ±0,0005 | 0,00036 |
| DXY · max | 2 | ±0,005 | 0,00035 |

Todos **abaixo de 0,01 ponto**, com teste que segura o limite. E o maior não é o de
menos casas: é o **MVRV · min**, porque 0,384 é um número pequeno numa régua
logarítmica, e log amplifica embaixo. Contra-intuitivo o bastante para ficar fixado
num teste.

### ⚠️ Uma anomalia que não é de dado: o menu do DXY
No menu do terminal o DXY aparece com o **valor atual em "—"**, enquanto o histórico
carrega normal. Nenhuma das outras treze séries faz isso.

**Não move o Índice**, e o motivo é preciso: a confiança do DXY já está saturada em 1
(série de 2011, e o fator da D7 satura em 5 anos), então pela D36 C nem uma série
parada mudaria a conta. Medido: mover a data do DXY para junho/2026 ou dez/2025 dá
**exatamente** o mesmo Índice.

**Mas o valor do DXY é a maior alavanca que já medi:** 10% de erro nele move o Índice
**1,09 ponto** — quase o do Liveliness · max, que é a cabeça da fila. O valor está
marcado como conferido desde o documento 07, e não o reabri: reabrir confirmação é
decisão, não implementação. Fica registrado em `anomaliaDeMenu`, com a alavanca
medida, para o Gui decidir.

### ✅ A quinta conferência: **SOPR · min = 0,6068 em 09/11/2011**
Vizinhos **0,9609** e **0,9743** — cai 37% num dia e volta acima no seguinte.

**Topologia nova.** As três conferências anteriores foram vale (MVRV · min), platô
(Liveliness · max) e degrau (DXY · max). Esta é uma **barra isolada** cravada entre
dois dias normais. É a forma que um erro de dado tem — e é também a que um dia de
capitulação tem, porque o SOPR é razão diária e um dia de pânico dá uma barra só.
Ficou nomeada no dado (`topologia`) em vez de virar impressão na cabeça de quem leu.

**Sem ambiguidade:** os rivais de 2011–2012 são 0,6237 (16/11) e 0,6369 (19/10), e o
fecho pelo eixo — o rótulo mais baixo na visão ALL é 0.6 — só faz sentido com o
mínimo logo acima dele.

*O cruzamento de preço deu US$ 3 nos três dias: a mesma redondagem para dólar inteiro
que derrubou a conferência do Preço do BTC · min. Nesta escala o cruzamento não cruza
nada — consistência, não achado novo.*

## OS TRÊS MÉTODOS, AGORA NOMEADOS EM CÓDIGO
O Gui nomeou o método fraco desta vez sem ninguém pedir: *"essa leitura é do eixo,
não da tooltip"*. Com isso fecham três, e eles **não são intercambiáveis**:

| Método | Onde apareceu | O que prova |
|---|---|---|
| **dígito** | MVRV, DXY, SOPR | o número. É o que confirma um valor |
| **pixel** | Liveliness · max | **ordem** entre dois pontos, não o valor de nenhum |
| **eixo** | piso pós-2013 do SOPR | ordem de grandeza. **Nunca confirma extremo sozinho** |

`METODOS_DE_CONFERENCIA` fixa os três em código, do mais forte para o mais fraco, e
cada conferência nomeia o seu. O que sustenta o mínimo do SOPR é **dígito**; o eixo
só deu o piso do outro regime, e está gravado num campo separado por isso.

## ⚠️ AS DUAS RÉGUAS QUE MAIS PESAM SÃO INTEIRAS DE 2011
A varredura em dois blocos que o Gui fez para o SOPR deixou isso visível, e vale para
o sistema todo: **13 dos 28 extremos são anteriores a 2013**.

E não é distribuído por acaso — as duas réguas que mais pesam têm **as duas pontas**
em 2011:

| Régua | min | max | Peso |
|---|---|---|---|
| **MVRV Ratio** (é a régua inteira da camada 1) | 19/10/2011 | 04/06/2011 | 38,6% |
| **SOPR** | 09/11/2011 | 29/04/2011 | ~9,8% (⅓ da camada 2) |

O SOPR mostra o que isso significa: **em treze anos a série nunca chegou perto do
próprio mínimo.** O piso do regime pós-2013 é ~0,75; o mínimo da régua é 0,6068. O
fundo da régua é território que o mercado não visita desde 2012.

### Quanto isso vale, medido
| Troca | Efeito no Índice |
|---|---|
| Piso do SOPR → 0,75 (pós-2013) | **−1,04** |
| Teto do MVRV → 6,237 (pós-2013, número que o Gui já conferiu) | **+1,42** |
| **Os dois juntos** | **+0,38** |

**Elas não apontam para o mesmo lado, e quase se cancelam.** Reportar só uma daria a
impressão de um viés que não existe. E a **faixa da entrega é a mesma nos três
casos** — o que o cliente recebe hoje não muda.

*Não é proposta.* A normalização contra a faixa ALL própria de cada série é desenho,
e trocá-la é decisão. O que fica registrado é que a **D7 não cobre isto**: o fator de
confiança pune série *curta*, e não existe nada que trate régua *velha*. Uma série de
quinze anos tem confiança 1 mesmo com as duas pontas fixadas no primeiro ano.

### ✅ A sexta conferência: **DXY · min = 72,93 em 29/04/2011** — e o quarto método
O valor bate. **Três dias exibem 72.93**, e continuam no mesmo pixel com o eixo a
~0,009/px. O pixel não resolve — e a razão é que **não há o que separar**:

> 29/04/2011 foi **sexta-feira**. 30/04 e 01/05 são fim de semana, e o terminal repete
> o fechamento. Na segunda (02/05) o índice já anda: 72,95.

**Não é empate de exibição, é o mesmo valor carregado adiante.** Quem decide é o
**calendário**, que é o único dos quatro métodos que não olha a tela — e o único que
*prova* em vez de aproximar.

| Empate | Liveliness · max | DXY · min |
|---|---|---|
| O que é | números **diferentes** que a tela arredonda igual | o **mesmo** número, repetido |
| Resolve com | zoom até separar os pixels | calendário |
| Força | inferência do desenho | dedutivo, verificável sem terminal |

`CALENDARIOS` marca cada série como `24/7`, `pregão` ou `mensal`, e o comando agora
**avisa antes**: a próxima com este problema é a **Curva 10Y-2Y · min**, datada em
01/07/2023, que é um sábado. Sem o aviso, o empate reapareceria parecendo erro.

*E o calendário é por série: a máxima do Liveliness é um sábado e é legítima, porque
a série é onchain. Há teste dos dois lados.*

### ✅ E o "—" do DXY tem explicação
**29/08/2026 é sábado.** O DXY é série de pregão: não há cotação do dia para o menu
mostrar, e o histórico carrega porque histórico existe. Não era falha do terminal nem
do dado. A pergunta que ficou aberta na conferência anterior está fechada, e a
explicação está gravada em `anomaliaDeMenu.explicacao`.

### ⚠️ Mas isso deixou quatro datas erradas no dado
A leitura foi feita num sábado, e quatro séries de pregão levaram a **data do dia da
leitura** em vez da data do próprio dado: **DXY, Fed Funds Rate, Curva 10Y-2Y e US
M2** (esta última é mensal — o último dado real é de 01/07/2026).

**Custo medido: zero.** As quatro têm confiança saturada em 1, então pela D36 C a
data não entra na conta. Corrigi-las dá **exatamente** o mesmo Índice, e há teste.

**Não corrigi.** O `data` vem do documento 07, que é fonte primária, e sobrescrever
leitura registrada é retificação — decisão, não implementação. Fica medido e
apontado.

*A única série onde a data tem dente é o **ETF Net Inflow**, a única com confiança
abaixo de 1 (0,525). E a data dela é 27/08, uma quinta-feira de verdade. Dois dias de
erro nela moveriam o Índice em 0,00037 — pouco, mas diferente de zero, que é o que as
outras quatro dão.*

### 🐛 Um erro meu nesta rodada, e como apareceu
Marquei `confirmado.min` no **Liveliness** em vez de no DXY: os dois tinham o campo
com o texto idêntico, e o replace pegou o primeiro. A contagem **não** teria pego —
dava 20 dos dois jeitos. O que pegou foi a **fila**, que continuou listando o
DXY · min depois de eu ter dito que ele saiu. Desfeito e reaplicado no lugar certo.

*É o mesmo padrão do bug da data do comando: teste de formato passa, contagem passa, e
quem denuncia é olhar a saída que deveria ter mudado.*

### ✅ A sétima conferência: **Supply in Profit · min = 35,6% em 24/08/2015**
Vizinhos 38,8% e 40,0% — folga de mais de 3 pontos percentuais para cada lado. Sem
empate, sem pixel, sem calendário: os dígitos separam sozinhos. Mergulho de um dia, a
**Segunda-feira Negra** dos mercados globais.

*Método de varredura novo: em vez de percorrer trecho a trecho, o Gui recortou a
**banda de altura** abaixo de ~36% e varreu os quinze anos de uma vez — uma única
marca aparece em toda a série. É a varredura mais forte feita até agora, porque não
depende de escolher quais trechos olhar.*

## ⚠️ O ACHADO É MAIOR QUE A CONFERÊNCIA: O TERMINAL TEM SÉRIES HOMÔNIMAS
O Gui abriu o menu e havia **dois "Supply in Profit"** — um em BTC (≈13,5M BTC) e um
em percentual. Escolheu o percentual e avisou antes de dar o resultado.

**O comando não avisava.** Ele nomeia a série por um texto, e o terminal tem mais de
uma série com aquele texto. Abrir a errada dá um número **plausível** de uma série que
não é a nossa, e nada na tela avisa — é o default silencioso mais caro que já apareceu
aqui, porque não deixa rastro nenhum.

*Não é o primeiro caso: na conferência do SOPR o Gui já tinha escrito "o simples, não
LTH/STH", também sem ninguém pedir. Duas vezes o acerto veio do cuidado dele, não do
comando.*

### A escolha se prova pelo dado, por três vias
E nenhuma delas dependia de escolher certo:

| Prova | Por quê |
|---|---|
| valor corrente **67,4** | percentual, não 13,5M |
| máximo **100,0** | teto de percentual, **impossível** numa série em BTC |
| mínimo lido **35,6%** | mesma ordem dos outros dois |

*O 100 já estava em `TETOS_DA_METRICA` desde a conferência anterior, por outro motivo.
As duas coisas se sustentam: o teto que provou ser definicional agora também prova
qual série é a nossa.*

### O comando passou a checar a identidade ANTES de mandar ler
```
Antes de ler, conferir que a série é a certa:
  ⚠️ há dois no menu: um em BTC (≈13,5M BTC) e um em percentual. O nosso é o PERCENTUAL.
  a unidade tem de ser %, e o valor de hoje tem de bater com 67.4.
  Se o valor de hoje não bater, a série aberta é outra: parar e reportar, não ajustar a leitura.
```
Cada série ganhou `unidade`, e `HOMONIMOS_NO_TERMINAL` guarda **só os homônimos que
uma conferência reportou** — Supply in Profit, SOPR e Realized Price. Não é lista
adivinhada.

**O valor de hoje vira senha:** se a série aberta for outra, o valor corrente não bate,
e a pessoa descobre antes de ler qualquer extremo.

### E uma série não tem como se autenticar
O **Funding Rate** é a única cuja unidade não está registrada em lugar nenhum — o
valor 1,84 com faixa [−139,23; 186,86] não diz sozinho se é percentual, base ou taxa
anualizada. O comando dela **avisa que não consegue checar** e pede a unidade junto,
em vez de ficar em silêncio.

### A quarta resolução de tooltip
Este indicador mostra **uma** casa decimal. Já apareceram **quatro** tamanhos, um por
série: 4 (Liveliness, SOPR) · 3 (MVRV) · 2 (DXY) · 1 (Supply in Profit). Meia casa
daqui move o Índice em **0,0039** — segue abaixo de 0,01, como todas.

### ✅ A oitava conferência: **Fed Funds Rate · max = 5,33 em 01/08/2023**
O valor bate. E o empate é a informação, como o Gui escreveu.

**Terceira espécie de empate.** Não é exibição (Liveliness) nem fim de semana (DXY):
**o dado não muda mesmo.** 396 dias com o valor idêntico, de 01/08/2023 a 31/08/2024,
linha horizontal sem um pixel de variação. Nem dígito nem pixel decidem, *porque não
há o que separar*.

| Empate | O que é | Resolve com |
|---|---|---|
| Liveliness · max | números **diferentes**, tela igual | pixel |
| DXY · min | **mesmo** número, dia sem pregão | calendário |
| **Fed Funds · max** | **mesmo** número, o dado é o mesmo | **as duas pontas do patamar** |

Aqui o extremo é um **patamar**, e a data é o **degrau de entrada** — 31/07 lê 5,12, e
5,33 aparece em 01/08. A saída também é degrau: 30/08/2024 ainda lê 5,33, e 02/09 já
é 5,13. As duas pontas ficam registradas juntas, que foi exatamente o que o Gui pediu
para o empate não reaparecer parecendo erro.

`SERIES_EM_PATAMAR` marca as duas séries a que isso se aplica — **Fed Funds Rate**
(taxa de política, parada entre reuniões do FOMC) e **US M2** (mensal, cada leitura
vale até a publicação seguinte). O comando de ambas avisa antes e pede as duas pontas.

## ✅ E O PORTÃO DE IDENTIDADE PRODUZIU UM FATO NA PRIMEIRA VEZ QUE RODOU
Ele foi criado uma conferência atrás, para impedir que se lesse a série errada. Passou
— *"unidade em % no próprio título"*, valor 3,63 batendo. E de quebra entregou algo
que o dado não tinha:

> **O último ponto da série é 24/08/2026, não 29/08.** Cinco dias, não um.

A leitura de sábado explicava **um** dia de defasagem. Não explicava cinco. O portão
pediu o valor corrente, o Gui reportou a data dele junto, e a divergência apareceu
sozinha — sem ninguém procurar por ela.

**Custo: zero**, pelo mesmo motivo das outras: confiança saturada, e pela D36 C a data
não entra na conta. Está medido e em teste. Mas a pergunta 4 em aberto fica mais séria:
o que se retificaria não é "sábado por sexta", é **uma data que ninguém sabe**.

### ✅ A nona conferência: **SOPR · max = 2,8740 em 29/04/2011** — o SOPR sai inteiro
Vizinhos 1,4169 e 1,8046: o dia vale **mais que o dobro** do anterior. Pico de barra
única, sem empate de espécie nenhuma.

## ⚠️ O PORTÃO PASSOU — POR UMA CASA DECIMAL
O Gui reportou os três SOPR do mesmo dia:

| Série | Valor em 28/08/2026 |
|---|---|
| **SOPR (o nosso)** | **1,0112** |
| SOPR LTH | 1,0134 |
| SOPR STH | **1,0111** |

**0,0001 de margem** até o STH — exatamente uma casa de exibição, na resolução de
quatro casas deste indicador. O portão funcionou, mas por nada. Um dia diferente, ou
um arredondamento para o outro lado, e ele teria aprovado a série errada.

**O valor corrente é senha fraca onde há homônimo.** Quem separa de verdade é o
**breadcrumb**, que o Gui reportou sem ninguém pedir: `Spent Output Profit Ratio
(SOPR) / SOPR`. As séries com breadcrumb registrado passaram a tê-lo exigido no
comando; as que têm homônimo **sem** breadcrumb recebem o aviso de que a senha é
fraca ali, e o pedido de anotá-lo.

*Quatro breadcrumbs estão registrados — SOPR, Liveliness, DXY e Fed Funds — todos
vindos de conferências. Nenhum adivinhado.*

## ⚠️ E A VARREDURA POR BANDA FALHOU, PELA ARITMÉTICA DO GRÁFICO
O Gui tentou o método da conferência anterior e ele não serviu:

> No ALL o gráfico comprime **~5.700 dias em ~1.100 px**. Um dia ocupa **0,19 px**, e
> um pico de barra única some no recorte. Daria **falso negativo**.

Trocou pelo **eixo auto-escalado**: partir a série em blocos que se encostam e ler o
topo do eixo de cada um — o eixo se recalcula com o máximo da janela, e **não depende
de a barra ser visível**. jan/2011 → jan/2012 pede eixo 3,1; jan/2012 → hoje pede 1,6.

`METODOS_DE_VARREDURA` passou a ordenar os três por força, com a fraqueza de cada um:

| Força | Método | Fraqueza |
|---|---|---|
| 1 | **eixo auto-escalado por blocos** | — o eixo sabe do ponto mesmo sem desenhá-lo |
| 2 | banda de altura sobre a série inteira | evento de um dia some: **falso negativo** |
| 3 | trecho a trecho | o que não foi olhado não foi descartado |

**Uma ressalva que isso joga para trás:** o **Supply in Profit · min** foi varrido pelo
método 2, e o achado dele *era* um mergulho de um dia. O resultado **positivo**
continua valendo — a marca apareceu. O que herda a ressalva é o **negativo**, o "não
há mais nada nesta faixa", que é justamente o que a varredura precisa provar. Não é
motivo para desfazer a conferência; é motivo para o registro dizer com qual método
cada uma foi feita, e agora diz.

### ✅ A décima conferência: **Funding Rate · max — e a última lacuna de identidade fecha**
**A unidade é `APR (%)`, categoria FUTUROS.** Funding anualizado em % ao ano, não a
taxa por período de 8h. A pendência aberta duas conferências atrás está fechada, e
`unidade` e `caminhoNoMenu` do Funding Rate entraram no registro.

*Isso confirma a escala linear por um caminho novo: APR de funding cruza o zero
(negativo = short paga long), e log de negativo não dá número errado — não dá número.
Mesma razão da D39 no netflow, agora com a unidade nomeada em vez de inferida.*

**Detalhe operacional que vale guardar:** dentro da tooltip o rótulo vem truncado
(*"Funding Rate — A…"*). A unidade só se lê no título da página e no menu.

### ⚠️ E o achado: **o registro tem mais precisão do que a tela consegue mostrar**
A anotação diz **186,86**. A tooltip mostra **186,9** — uma casa. Os dois são
compatíveis, mas **o número anotado não pode ter saído desta tooltip** — e o documento
07 diz que os valores foram lidos *"um por um"* por ela.

Fui auditar as catorze. `CASAS_NA_TOOLTIP` guarda a resolução de cada série lida numa
conferência, e `camposQueExcedemATooltip()` compara com o registrado:

| Série | Campos que excedem | Tooltip |
|---|---|---|
| **Funding Rate** | valor · min · max | 1 casa |
| **Preço do BTC** | valor · min · max | 0 casas (dólar inteiro) |

**Exatamente duas séries — e são exatamente as duas onde uma conferência tropeçou.**
A do Preço do BTC falhou de vez, em janeiro de 2011 lendo "$0". Não é coincidência:
é a mesma causa aparecendo duas vezes.

*Zero à direita não conta na auditoria: 2,8740 vira `2.874` em JS, e isso é perda de
representação, não de leitura. Há teste dos dois lados.*

**Custo medido:** trocar os três campos do Funding Rate pelos números exibidos move o
Índice em **0,0016**. Quase nada — mas medido.

**Não corrigi.** Trocar o registrado é retificação, e o Gui também não corrigiu: anotou
o que está. As duas coisas ficam lado a lado no dado.

### 🐛 O portão estava contraditório consigo mesmo
Ele pedia *"o valor de hoje tem de bater com 1.84"* — numa tooltip que só mostra uma
casa. Pedia o que não pode acontecer, e teria feito o Gui parar e reportar um falso
problema. Agora ele cita o valor **como a tela mostra**, com o registrado entre
parênteses:

```
a unidade tem de ser APR (%), e o valor de hoje tem de bater com 1.8
(a tooltip dá 1 casa(s); o registro guarda 1.84).
```

### A varredura foi uma quarta: **concorrentes um a um**
A folga do primeiro para o segundo é de **4,98%** — a mais apertada de todas as
conferências. Nem banda nem eixo serviriam: o Gui mediu os três concorrentes na
tooltip, com janela em passo de um dia, e abriu ainda a janela 10/03/2020 → hoje
excluindo fev/2020 para ver quem lidera sem o campeão.

## AS TRÊS ESPÉCIES DE EXTREMO
A conferência do Liveliness fez aparecer uma pergunta que o comando não fazia: **o
extremo é sempre a leitura de um dia?** Não é. E os dois primeiros da fila depois
dele são os dois casos em que não é.

| Espécie | Caso | O que o comando pede |
|---|---|---|
| **Empírico** | MVRV, SOPR, Liveliness, DXY… | as três coisas: dígito, vizinhos, nada além no ALL |
| **Teto da métrica** | **Supply in Profit · max = 100** | que a série *encoste* em 100 e que a escala não passe dele. **A data não** |
| **Extremo móvel** | **US M2 · max = 23,218** | dígito e nada acima **antes** dele; e reconferir a cada leitura |

**Supply in Profit é percentual de supply: 100 é o limite da definição.** A série
encosta no teto em muitos dias, e nenhum é "o" extremo. Mandar provar que 04/02/2011
é a data seria mandar provar o que é falso — a mesma espécie de erro do comando que
apontava a data da leitura, e igualmente silencioso: a pessoa acharia um dia com
100, confirmaria, e teria confirmado nada.

**US M2 · max é o valor corrente**: 23,218 é a última leitura, e M2 cresce. A régua
não tem ponta fixa, anda com a série. Conferir "uma vez" não significa nada, e o
comando agora diz isso. *É o mesmo fato que zera o efeito do US M2 · min (D41 C) —
valor encostado num extremo aparece nas duas pontas.*

O comando empírico também aprendeu com o empate: passou a avisar que, se outro ponto
exibir o mesmo número, a tooltip não decide, e que a separação por pixel deve ser
registrada como método diferente.

**`TETOS_DA_METRICA` passou pelos quatro critérios da classe âncora** e **não entrou**
— falha o critério 1, porque afrouxar o 100 muda a leitura de hoje, visível na hora.
Está na tabela de exclusão do briefing com a razão. É o segundo evento da regra da
D31 parte C, e o primeiro que termina em exclusão em vez de admissão.

### 🐛 Um erro que a D35 B fez aparecer
A primeira versão do comando mandava conferir o mínimo do MVRV **em 28/08/2026** —
a data da leitura — em vez de **19/out/2011**, a data do mínimo. As datas dos
extremos estão no documento 07 e eu não as tinha carregado: o dado só trazia `data`,
a da leitura, e o comando caía nela.

Mandar estreitar a janela no dia errado é o pior default silencioso possível numa
conferência: a pessoa lê uma tooltip legítima, anota um número real, e confirma um
extremo que não é aquele. Carreguei `dataMin` e `dataMax` das catorze séries, e o
comando agora **recusa** se a data faltar, em vez de cair na data da leitura.

*Só apareceu porque olhei a saída do comando, não o teste dele. Testes de formato
teriam passado.*

## O VOCABULÁRIO DAS CAMADAS, FECHADO PELA D40
"Ciclo" e "Valuation" eram descuido de redação. Os nomes ficam **Estado do preço**
e **Comportamento**, e a D35 D foi corrigida no registro.

Os nomes canônicos passaram a existir **em código** (`CAMADAS`), a entrega da Torre
nomeia cada camada dentro e fora da conta, e um teste quebra se alguém renomear sem
decisão. A regra da D40 deixou de existir só no texto:

> Nome diferente numa decisão é erro de redação até prova em contrário. Quando nome
> e número discordam, **manda o número** — e o implementador levanta a divergência
> em vez de escolher sozinho.

Virou **invariante 9** do briefing.

## A ESCALA DO NETFLOW, FECHADA PELA D39
Linear, como a D37 C disse. A D38 D foi corrigida. O teste que prova a
impossibilidade continua: `normalizar(-500, -1000, 1000, 'log')` devolve `NaN`, e
`log(0)` é `-Infinity`.

## UM PARÂMETRO NOVO NASCEU, E JÁ FOI SUBMETIDO
O **limiar de liquidez** (D37 A) e a **lista de exchanges** (D38 A) passaram pelos
quatro critérios nas próprias decisões que os criaram, e entraram como membros 10 e
11 da classe âncora, em par. São os dois primeiros casos do mecanismo da D31 parte
C funcionando na prática.

Os demais números vêm das decisões: pesos 34·26·16·12·12 (D03), faixas de 20 em 20
(D03 · D02), confiança sobre 5 anos (D7), trava de 30% (D17 C), terço da camada
(D36 B), validade de 180 dias (D18), 65 como limiar (D9 · D10).
