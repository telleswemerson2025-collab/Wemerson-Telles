# PEÇA 2 — TORRE DE CONTROLE
Conferência. Versão 1.5 · 29/08/2026 — Decisões 35 a 39 aplicadas

**Não é aprovação de código. É conferir se o que foi escrito é o que a decisão diz.**

- `torre.mjs` — o módulo. Sem dependências. Lê o registro da peça 1, não guarda nada.
- `leitura-29-08-2026.mjs` — as catorze leituras reais do documento 07, transcritas.
- `torre.test.mjs` — 64 testes da Torre (113 no pacote inteiro). `node --test` na raiz.

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
estado: 14 confirmados · 28 provisórios de 42
```

Os 14 confirmados são os valores, que o documento 07 diz terem sido lidos "um por
um" pela tooltip. Os 28 provisórios são as mínimas e as máximas, que o cursor no
zoom ALL não alcança. O netflow nasce provisório inteiro — valor e extremos —
levando o total a 45 e os provisórios a 31 quando ele entra na varredura.

### A fila, na prioridade da D35 D
```
MVRV Ratio · min           log · camada 1 (34%)
MVRV Ratio · max           log · camada 1 (34%)
Preço do BTC · min         log · camada 1 (34%)
Preço do BTC · max         log · camada 1 (34%)
Realized Price · min       log · camada 1 (34%)
...
```
Logarítmicas primeiro, e dentro delas por peso de camada. Está testado que o MVRV
(camada 1) vem antes do SOPR (camada 2), e que nenhuma linear aparece antes da
última log.

### O comando, um extremo por vez
```
Conferir no terminal VantageNode, somente leitura: MVRV Ratio · min.
Valor a bater: 0.384 na data 2011-10-19.
Passos: abrir a série · estreitar a janela em torno da data até o passo do cursor virar um dia ·
ler a tooltip · anotar o valor dígito a dígito · voltar ao range ALL.
Nunca publica, nunca altera, nunca apaga. Restaura o estado da tela. A sidebar nunca aparece.
```

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

## ⚠️ O QUE A D35 D CHAMA DE OUTRO NOME
A prioridade fala em "Ciclo 34%, Valuation 26%, Macro 16%, Fluxo 12%". Os pesos
batem, mas os dois primeiros nomes não são os do sistema: o `03-indice-semente.md`
chama a camada 1 de **Estado do preço** e a camada 2 de **Comportamento**.

Implementei pelos pesos, que são inequívocos. Se "Ciclo" e "Valuation" forem
renomeações pretendidas, é mudança de vocabulário em cinco documentos e merece
decisão própria — a Decisão 2 já mostrou o custo de dois nomes para a mesma coisa.

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
