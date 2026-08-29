# ÍNDICE SEMENTE — indicador composto
Régua única de 0 a 100 que reúne as camadas de leitura.
Versão 1.10 · 29/08/2026 — Decisões 1, 2, 4, 5, 7, 9, 15 a 20 aplicadas.

## O QUE ELE É, E O QUE ELE NÃO É
O Índice Semente **mede a intensidade** da situação de mercado. Ele **não classifica o estado**.

Quem classifica o estado é a Linha d'Água, por regra objetiva de posição do preço contra os três
custos de referência. O Índice não reclassifica, não promove nem rebaixa estado, e nunca dispara
decisão sozinho. Ele **modula o tamanho do aporte dentro da faixa que o estado já definiu**, pela
fórmula da Decisão 4 (em `02-agentes.md`, seção Alocador).

> Estado é da Linha d'Água. Intensidade é do Índice. Estação é do Índice de Plantio
> (estado × tempo restante). Ver a hierarquia completa em `00-BRIEFING-CODE.md`.

O Índice tem ainda um segundo papel, de contagem e não de decisão: ele define o **marco de virada**
que fecha um ciclo do Reforço de Fundo — fechar em **65 ou mais por 30 dias corridos consecutivos**
(Decisão 9). Isso restringe ou permite, nunca aloca, e por isso não conflita com a Decisão 2.

## PESOS
A camada 5 (Carteira) **está fora da conta** enquanto não existir carteira ativa para medir. Os
quatro pesos restantes são renormalizados proporcionalmente (base 88).

| Camada | Peso hoje | Peso com carteira ativa | O que entra |
|---|---|---|---|
| 1 · Estado do preço | **38,6%** | 34% | preço ÷ Realized Price, normalizado em log pela faixa histórica do MVRV |
| 2 · Comportamento | **29,5%** | 26% | SOPR · Supply in Profit · Liveliness (média de **três**) |
| 3 · Macro | **18,2%** | 16% | DXY* · Fed Funds* · M2 · Curva 10Y-2Y (média) |
| 4 · Fluxo | **13,6%** | 12% | ETF Net Inflow · Funding Rate (média) |
| 5 · Carteira | **fora** | 12% | pesos · caixa · **degrau de invalidação** · anos restantes |

\* DXY e Fed Funds entram **invertidos**: dólar forte e juro alto tiram ar do risco.

### ⚠️ A CAMADA 5 FICA FORA, NÃO VALE 50 (Decisão 5, 29/08/2026)
Na versão 1.1 a camada 5 entrava com 12% travados em 50. Isso não é neutro: é peso morto que puxa
o índice para o centro por construção e contamina a leitura. Enquanto não houver carteira, ela sai
da conta e os quatro pesos são renormalizados (34/88 · 26/88 · 16/88 · 12/88).

**Quando a carteira existir**, a camada 5 volta com 12% e os demais retomam 34 · 26 · 16 · 12.
**Na tela, a camada tem que aparecer marcada como FORA** — não desenhada como se valesse 50.

### ⚠️ O MVRV NÃO ENTRA DUAS VEZES (Decisão 1, 29/08/2026)
A razão preço ÷ Realized Price **é** o MVRV. Ela é a régua da camada 1 e **não** entra também na
média da camada 2. Na versão 1.0 entrava nos dois lugares, e o MVRV pesava sozinho ~40,5% do
índice. A camada 2 tem três itens.

## NORMALIZAÇÃO
Cada leitura vira posição de 0 a 100 dentro da **própria faixa histórica** do terminal
(0 = mínima da série, 100 = máxima).
- Séries de escala multiplicativa (preço, MVRV, SOPR, Realized Price): normalização **logarítmica**.
- Séries de escala aditiva (percentuais, taxas, fluxo): normalização **linear**.

### FATOR DE CONFIANÇA POR JANELA (Decisão 7, 29/08/2026)
Série curta normalizada contra a própria faixa produz falsa confiança: dois anos de extremos não
são comparáveis a quinze. A correção amortece a série curta em direção ao neutro, na proporção do
que lhe falta de história. **Ela não é descartada, ela é amortecida.**

```
confiança      = anos_de_série ÷ 5,  limitado a 1,00
valor_ajustado = 50 + (valor_bruto − 50) × confiança
```

| Série | Início | Anos | Confiança | Bruto | Ajustado |
|---|---|---|---|---|---|
| ETF Net Inflow | 11/jan/2024 | 2,63 | **0,53** | 54,97 | **52,61** |
| Funding Rate | 01/jan/2020 | 6,66 | 1,00 | 43,26 | 43,26 |
| Todas as demais | 01/jan/2011 | 15,66 | 1,00 | — | sem ajuste |

**A confiança de cada série aparece na saída da Torre, ao lado do valor.**

*Nota:* o limiar de confiança plena é 5 anos, por decisão. Com ele, o Funding Rate (6,7 anos)
entra com peso integral ao lado de séries de 15,7 anos. Só o ETF é amortecido hoje.

## AS FAIXAS — INTENSIDADE, NÃO DECISÃO
As faixas descrevem o quão esticada está a situação. **Nenhuma delas dispara aporte.**
Os nomes deixaram de reutilizar o vocabulário de estado da Linha d'Água justamente para que os
dois instrumentos não sejam confundidos.

| Índice | Faixa | O que significa | Modulador M |
|---|---|---|---|
| 0–20 | Fundo | Intensidade no extremo comprimido da faixa histórica | 1,20 a 1,12 |
| 20–40 | Comprimido | Abaixo do meio da régua | 1,12 a 1,04 |
| 40–60 | Equilíbrio | Nem comprimido nem esticado | 1,04 a 0,96 |
| 60–80 | Esticado | Acima do meio da régua | 0,96 a 0,88 |
| 80–100 | Extremo | Intensidade no extremo esticado da faixa histórica | 0,88 a 0,80 |

O modulador é contínuo, não muda em degrau na fronteira da faixa. A faixa é rótulo de leitura; a
conta é a fórmula.

## LEITURA DE 29/08/2026 (dado real, confirmado por tooltip)
**Estado (Linha d'Água): Mercado saudável** — preço acima dos três custos de referência.
**Índice Semente = 50,75 (exibido 51) · faixa Equilíbrio.**
**Nota de divergência:** estado saudável, mas intensidade apenas em equilíbrio. O estado manda;
a intensidade qualifica. Não há disputa a resolver.

| Camada | Posição | Peso | Composição |
|---|---|---|---|
| 1 · Estado do preço | 44,41 | 38,6% | preço ÷ Realized Price = 1,46706 |
| 2 · Comportamento | 60,27 | 29,5% | SOPR 32,8 · Supply in Profit 49,4 · Liveliness 98,6 |
| 3 · Macro | 50,88 | 18,2% | DXY 36,3 · Fed Funds 32,2 · M2 100,0 · Curva 35,0 |
| 4 · Fluxo | 47,94 | 13,6% | ETF 52,6 (amortecido de 55,0) · Funding 43,3 |
| 5 · Carteira | — | fora | sem carteira ativa |

Conta: `(0,34×44,41 + 0,26×60,27 + 0,16×50,88 + 0,12×47,94) ÷ 0,88 = 50,75`

Histórico do mesmo dia, para rastreabilidade:
`50` (v1.0, dupla contagem do MVRV) → `50,80` (v1.1, Decisão 1) → `50,91` (v1.2, Decisão 5) →
**`50,75`** (v1.3, Decisão 7). A faixa nunca mudou: Equilíbrio em todas as versões, e o valor
exibido é 51 desde a v1.2.

### ⚠️ OBSERVAÇÃO OBRIGATÓRIA EM QUALQUER LEITURA PUBLICADA
A camada Comportamento subiu de 56 para 60 porque, sem o MVRV puxando para baixo, **a Liveliness
em 98,6 da faixa histórica passou a pesar mais** — de 1/4 para 1/3 da camada.

Quanto ela responde, medido: a Liveliness contribui com **9,7 dos 50,75 pontos** do índice (19%).
Se ela estivesse em 50 em vez de 98,6, o índice de hoje seria **45,9** — ou seja, ela sozinha
**levanta a leitura em 4,8 pontos**. É o número que está segurando o índice no Equilíbrio.

### O que salta na leitura individual
- **Liveliness em 98,6** — praticamente na máxima. Moeda velha se movendo: distribuição. É o número
  mais gritante da tela, e agora também o mais influente.
- **SOPR em 32,8** — quem vende não está com lucro gordo.
- **Camada 1 em 44,4** — o mercado não está caro em relação ao custo da rede.
- **US M2 em 100** — mas é máxima de série mensal, chapada desde 01/jul/2026. Não é notícia nova.
- **DXY em 36,3 e Fed Funds em 32,2** (já invertidos) — o macro não está ajudando.

### Tensão editorial detectada
**Realized Price · LTH está a 1,08% da máxima histórica** (US$ 49.449,51 contra US$ 49.991,21 de
26/07/2026) **enquanto o preço está 37,4% abaixo do topo** (US$ 77.839,19 contra US$ 124.353,95 de
06/out/2025). Base de custo do holder longo subindo num mercado que caiu: gente comprando devagar
para segurar. Cruzado com a Liveliness quase na máxima, as duas leituras aparentemente se
contradizem — e contradição é o coração de uma boa thread.

*Nota de fonte:* a camada 1 usa a razão calculada a partir de duas leituras do terminal
(77.839,19 ÷ 53.057,77 = 1,46706). O MVRV lido diretamente no terminal é 1,465 e dá posição 44,36
contra 44,41 — diferença de 0,05 ponto, sem efeito no índice exibido.

## A CAMADA 5 — O DEGRAU DE INVALIDAÇÃO (Decisão 16, parte D)
Distância até um fato qualitativo **não se normaliza em escala contínua**. Vira escala ordinal de
quatro degraus, **atribuída pelo Gui e registrada com data**:

| Degrau | Situação |
|---|---|
| **100** | Tese intacta, nenhum sinal contrário |
| **66** | Sinal contrário isolado, sem confirmação |
| **33** | Sinal contrário confirmado, tese em observação |
| **0** | Tese invalidada, ativo em saída ordenada |

A camada 5 **lê o degrau, não a distância**. É julgamento humano com registro, não número
inventado — preferível a uma métrica contínua que aparenta precisão que não existe.

### Agregação: média ponderada pelo tamanho da posição (Decisão 17)
O degrau é **por ativo**; a camada 5 é **um número só**. Agregam-se por **média ponderada pelo
tamanho da posição na parte exposta**.

*Razão:* tese trincada num ativo de 1,5% não pesa o mesmo que tese trincada num ativo de 30%. Média
simples deixaria uma ponta pequena mover o índice tanto quanto o núcleo, e isso não descreve o
risco real da carteira.

**Consequência assumida:** com o piso de 60% em BTC e ETH, a métrica passa a ser **dominada pela
tese desses dois** — eles pesam ao menos 60% da média. É o resultado correto: numa carteira com esse
piso, a saúde da tese é majoritariamente a tese deles.

*Calibragem do efeito:* uma invalidação total de BTC e ETH, com os demais intactos, derruba a
camada 5 em pelo menos 60 pontos e o **Índice em pelo menos 7,2 pontos** (0,12 × 60) — o bastante
para mudar de faixa. Se os dois somarem 90% da parte exposta, são 10,8 pontos de Índice.

### Ausência na agregação
**Degrau não atribuído é ausência**, não 100 e não 0. Vale a invariante 3: reporta-se a falta, não
se presume tese intacta — sem essa regra o esquecimento viraria otimismo automático.

O ativo sem degrau **fica fora do cálculo** e os pesos se renormalizam sobre os que têm degrau —
mesma mecânica da Decisão 5.

> **Trava dos 30%:** se os ativos sem degrau somarem **mais de 30% da parte exposta**, a camada 5
> **sai inteira** do Índice e os pesos das demais camadas se renormalizam. Uma nota que descreve
> menos de dois terços da carteira não descreve a carteira.

*Consequência operacional:* como BTC+ETH somam ao menos 60% da parte exposta, **basta um dos dois
passar de 30% para que a falta do degrau dele derrube a camada sozinho.** Os demais, limitados a 8%
cada, precisam de quatro ativos sem degrau para chegar ao mesmo lugar. Na prática, a camada 5
depende de os degraus de BTC e ETH estarem sempre em dia.

### Validade: 180 dias (Decisão 18)
**Todo degrau vale 180 dias corridos a partir da data de atribuição.** Vencido, ele **não vira 0 e
não permanece: vira ausência**, e cai na mecânica acima — sai do cálculo, os pesos renormalizam, e
se o total sem degrau passar de 30% da parte exposta a camada 5 sai inteira.

*Razão:* julgamento sem data de validade envelhece sem avisar. Um degrau de tese intacta atribuído
há um ano descreve um mercado que já não existe.

**Reatribuição é sempre ato novo.** Renovar exige atribuição nova, com data nova e motivo escrito,
**mesmo que o degrau seja o mesmo de antes**. Não existe prorrogação automática nem "segue igual".

**Lembrete assimétrico.** A Torre avisa aos **150 dias** — trinta antes de vencer:
- **BTC e ETH: aviso diário** a partir daí, dentro da entrega da leitura do dia.
- **Demais ativos: uma vez por semana** (cerca de cinco avisos na janela).

A assimetria acompanha o custo de esquecer: qualquer um dos dois passando de 30% da parte exposta
derruba a camada 5 sozinho.

### Escalonamento das validades (Decisões 19 e 20)
A coorte sincronizada é tratada por escalonamento, em **dois regimes separados**.

**Regime 1 — BTC e ETH.** Ficam **fora do teto de janela**, e têm regra própria: os vencimentos dos
dois **nunca a menos de 45 dias um do outro**. Na primeira atribuição, o de maior peso recebe 180
dias e o outro 135.

**Regime 2 — todos os demais.** Nenhuma janela de 30 dias pode conter vencimentos que somem mais de
**35% do peso desse conjunto** — do conjunto, não da parte exposta.

*Por que 35% e não 25%:* com as validades espalhadas por igual num intervalo de 90 dias, uma janela
de 30 dias contém cerca de **um terço** do conjunto. Pedir menos que isso é pedir o impossível, que
foi o erro da Decisão 19.

**Espaçamento uniforme, sem passo fixo.** Para os N ativos do regime 2, ordenados por peso
decrescente:

```
validade do i-ésimo = 180 − 90 × i / (N − 1)     , i de 0 a N−1
com N = 1, validade 180
```

O maior vence em 180, o menor em 90, e o espaçamento se ajusta sozinho ao número de ativos. **A
cauda não colapsa mais**, porque o piso é o último ponto do intervalo e não um teto de corte.

**Renovação.** De um ativo só: 180 dias a partir da data nova. **De dois ou mais na mesma sessão:
as validades novas são distribuídas pela fórmula acima sobre os ativos renovados**, com o de maior
peso recebendo 180. Renovar em lote nunca recria a coorte — revisar teses de uma vez é o
comportamento natural de quem trabalha, e a regra não pode punir isso.

**Lote novo da CRM** (regra D da Decisão 19, mantida): 180 dias, salvo colisão — aí a maior validade
que couber, nunca abaixo de 90. Se nem 90 couber, o ativo entra e a colisão é reportada ao Gate.

**Auditoria** (regra E da Decisão 19, mantida): o Auditor verifica a cada rodada, com o mapa de
vencimentos dos próximos 180 dias por janela de 30.

#### ⚠️ Três ressalvas medidas
**1. O limite de 35% só é atingido quando N é múltiplo de três.** A geometria do "um terço" vale no
limite de N grande; com poucos ativos a discretização manda. Fração do conjunto na pior janela,
pesos iguais:

| N | 2 | 3 | 4 | **5** | 6 | 7 | 8 | 9 | 12 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|
| Pior janela | 50% | 33% | 50% | **40%** | 33% | 43% | 38% | 33% | 33% | 33% |

**N = 5 é o caso mais provável** — com BTC+ETH em pelo menos 60% e os demais limitados a 8%, cinco
ativos no teto preenchem exatamente os 40% restantes. E N = 5 dá 40%, acima do limite.

**2. A convenção da janela muda o resultado.** Com janela **semiaberta** (`[t, t+30)`), N = 4, 7, 10,
13, 16 e 19 passam a caber; N = 2, 5, 8, 11, 14 e 17 continuam estourando. A regra precisa dizer se
a janela inclui os dois extremos. Aqui está aplicada como **fechada**, que é a leitura conservadora.

**3. Existe um ponto cego entre os dois regimes.** O regime 1 só compara BTC com ETH; o regime 2 só
mede peso dentro do próprio conjunto. **Ninguém mede a soma dos dois regimes numa mesma janela** — e
é essa soma que a trava dos 30% da Decisão 17 enxerga.

> Exemplo real, na carteira BTC 35 · ETH 25 · cinco de 8%: **o ETH sozinho são 25%, abaixo da trava
> de 30%.** Com um ativo de 8% vencendo na mesma janela, viram **33% da parte exposta e a camada 5
> some** — sem que nenhuma das duas regras de regime tenha sido violada.

Por isso o mapa do Auditor traz, além das duas verificações de regime, uma **linha informativa com a
soma de vencimentos por janela sobre a parte exposta inteira**, comparada aos 30% da trava. Não é
limite novo: é a trava que já existe, olhada com antecedência.

### Etiqueta de julgamento — obrigatória
Toda leitura publicada que inclua a camada 5 informa as **três** coisas:
1. que a camada carrega **julgamento humano**;
2. a **data do degrau mais antigo em vigor** — que, com a validade de 180 dias, nunca pode ter mais
   de 180 dias de idade;
3. **quantos ativos estão sem degrau**.

**Sem as três, a leitura não é publicável.**

## PENDÊNCIA ABERTA
**A camada 5 continua fora.** As Decisões 16 e 17 fecharam o **degrau de invalidação** por inteiro —
escala, agregação, ausência e etiqueta. Faltam as outras **três métricas**: pesos, caixa e anos
restantes, e como cada uma normaliza. Só faz sentido definir quando houver carteira.


