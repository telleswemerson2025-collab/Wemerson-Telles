# AGENTES DO SISTEMA CARTEIRA SEMENTE
Especificação para implementação. Cada agente tem entrada, saída e limite definidos.
Versão 1.23 · 29/08/2026 — Decisões 1, 2, 4, 5, 6, 7, 9, 12 a 30 aplicadas.

---

## 1. TORRE DE CONTROLE
**Função:** dizer em que mundo estamos operando hoje. Não olha ativo, olha regime.

**Entrada (varredura diária no terminal VantageNode, sempre os mesmos, nesta ordem):**

| # | Camada | Indicador | Pasta/Seção |
|---|---|---|---|
| 1 | Estado do preço | Preço do BTC | — |
| 2 | Estado do preço | Realized Price | RealizedPrice |
| 3 | Estado do preço | Realized Price · STH | RealizedPrice |
| 4 | Estado do preço | Realized Price · LTH | RealizedPrice |
| 5 | Régua da camada 1 | MVRV Ratio (preço ÷ Realized Price) | MVRV |
| 6 | Comportamento | SOPR | SOPR |
| 7 | Comportamento | Supply in Profit (%) | Supply in Profit/Loss |
| 8 | Comportamento | Liveliness | Cointime Statistics |
| 9 | Macro | DXY | Macro |
| 10 | Macro | Fed Funds Rate | Macro |
| 11 | Macro | US M2 | Macro |
| 12 | Macro | Yield Curve 10Y-2Y | Macro |
| 13 | Fluxo | ETF Net Inflow | ETF |
| 14 | Fluxo | Funding Rate | Futuros |

São os mesmos 14 indicadores de sempre (invariante 7). O que mudou na versão 1.1 é **onde o MVRV
entra na conta**: ele é a régua da camada 1 e saiu da média da camada 2 (Decisão 1). A coleta é
idêntica.

**Regras de coleta:** valor de FECHAMENTO do último candle, confirmado pela tooltip.
Registrar também mínima e máxima da série no range ALL (necessário para normalizar).
Se algo vier zerado ou com traço: reportar, NÃO inventar.

**Saída (bloco fixo, todo dia, mesmo formato):**
- Os 14 números com data de fechamento
- Variação de cada um vs. a leitura anterior
- **O ESTADO do mercado**, pela Linha d'Água — é o número de cima do bloco
- O **Índice Semente** (0–100) e a **faixa de intensidade** correspondente, com a **camada 5
  marcada como FORA da conta** enquanto não houver carteira ativa — nunca desenhada como 50
- **A confiança de cada série ao lado do valor** (Decisão 7). Hoje só o ETF Net Inflow entra
  amortecido: 2,63 anos de série, confiança 0,53, bruto 55,0 e ajustado 52,6.
- **A etiqueta de julgamento, sempre que a camada 5 entrar** (Decisão 17): que ela carrega
  julgamento humano · a data do degrau mais antigo em vigor · quantos ativos estão sem degrau. Sem
  as três, a leitura não é publicável.
- **Se as condições do Reforço de Fundo estão reunidas** — é sinalização, não acionamento
- **Lembretes de degrau a vencer** (Decisão 18): a partir dos 150 dias, diário para BTC e ETH,
  semanal para os demais. É lembrete, não cobrança — a Torre avisa, quem atribui é o Gui.
- **A NOTA DE DIVERGÊNCIA**, quando estado e intensidade apontam para lados diferentes
  (ex.: "estado saudável, mas intensidade em equilíbrio"). É nota, não disputa.
- **O que mudou desde ontem** — só o que mudou
- ⚠️ SEM recomendação de compra ou venda

### VARREDURA DA COMPOSIÇÃO DA CRM (Decisão 16, parte B)
Segunda varredura, **separada dos catorze indicadores**, rodando junto com a leitura do dia: ler a
composição publicada da CRM e comparar com a última lida.

**Entrega:** incluídos · removidos · ou "nada mudou".
- Cada **incluído** passa pelo Filtro de Horizonte na hora, e o resultado é registrado com o motivo.
- Cada **removido** para de receber aporte novo a partir do mês seguinte. Sem venda.

**Se a composição não puder ser lida:** a Torre reporta ausência e o universo elegível **fica
congelado no último estado conhecido, marcado explicitamente como desatualizado desde tal data.**
**Nunca se presume que não mudou** — é a invariante 3 aplicada a um insumo que não é indicador.

**Limite:** não decide nada. Lê regime e lê composição. Não classifica estado por conta própria — o
estado vem da Linha d'Água — e não decide elegibilidade sozinha: aplica o Filtro de Horizonte, que
é regra escrita, e registra o motivo.

---

## 2. GUARDIÕES DAS CARTEIRAS
**Função:** duvidar. Um por carteira.

**Perguntas que ele responde todo dia:**
- O que pode dar errado aqui?
- Qual o cenário de queda e quanto ele custa?
- Onde a tese quebra? Qual nível invalida?
- Que posição está grande demais?
- Alguma tese está perto de ser invalidada, e qual seria o nível ou fato que a invalida?
  *(a Semente não opera com stop — Decisão 15. Ativo stopado na CRM não sai daqui por isso.)*
- Algum ativo saiu da CRM, e portanto para de receber aporte novo no mês seguinte?
- Alguma vaga está bloqueada há 90 dias ou mais, e portanto a tese daquele ativo precisa ir ao
  Gate com as duas saídas escritas?
- A exposição atual saiu da banda de 3 pontos em torno do alvo da glidepath?
- O teto de concentração está respeitado: BTC+ETH em pelo menos 60%, nenhum outro acima de 8%?

**Saída:** lista de riscos abertos, cada um com o nível que o dispara e o custo estimado.

**Limite:** não vende, não reduz. Aponta.

---

## 3. ALOCADOR
**Função:** propor o destino do aporte do mês.

**Entrada:** **estado do mercado (Linha d'Água)** · Índice Semente e faixa de intensidade ·
anos restantes até a entrega · **universo elegível** (espelho filtrado da CRM, Decisão 15) ·
composição atual da carteira · caixa disponível · zonas publicadas.

**Regra central — o ÍNDICE DE PLANTIO** (percentual do aporte que vai para o ativo).
Quem dispara a estação é o cruzamento do **estado** com o **tempo restante**. O Índice Semente
não entra nesta tabela: ele modula o resultado dela, depois, pela fórmula da Decisão 4.

| Estado do mercado (Linha d'Água) | Base | × Abrigo (anos restantes) |
|---|---|---|
| Capitulação profunda | 100% | +3a: 1,00 · 3a: 0,66 · 2a: 0,45 · 1a: 0,25 · entrega: 0,15 |
| Prejuízo do mercado | 90% | idem |
| Estresse de curto prazo | 65% | idem |
| Mercado saudável | 40% | idem |

O que sobra vai para o caixa, aguardando zona.

⚠️ **O gatilho 3 tem precedência sobre esta tabela** (Decisão 26). A ordem de destinação do aporte é:
**(1)** a defesa, até fechar a demanda da glidepath do mês; **(2)** o que sobrar segue o Índice de
Plantio; **(3)** sobrando ainda, o excedente vai para a parte protegida. Se a defesa consumir o
aporte inteiro, o Índice de Plantio não aloca nada naquele mês e a proposta diz *"aporte
integralmente destinado à proteção"*.

⚠️ **Com o Abrigo ativo, o caixa deixa de receber** (Decisão 27) — o passo 3 substitui a regra
acima. E o caixa existente vira o **primeiro** recurso da glidepath: a ordem do passo mensal é
**caixa → aporte → venda**.

### A MODULAÇÃO PELO ÍNDICE SEMENTE (Decisão 4, 29/08/2026)

```
aporte_final = base_do_estado × fator_do_Abrigo × M

M = 1 + (50 − Índice)/50 × 0,20        limitado a [0,80 ; 1,20]
```

| Índice | M | Efeito |
|---|---|---|
| 10 | 1,16 | mercado deprimido: reforça um pouco |
| 30 | 1,08 | |
| 50 | 1,00 | neutro: manda a base pura |
| 70 | 0,92 | |
| 90 | 0,84 | mercado esticado: alivia um pouco |

**Por que ±20%:** é ajuste fino, não decisão. Quem decide o patamar é o estado (Linha d'Água); o
Índice só afina dentro dele. Banda mais larga transformaria o Índice em segundo juiz, o que a
Decisão 2 proíbe.

**Modular com o índice cheio, não com o exibido.** O índice é calculado em ponto flutuante e
arredondado só para exibição. Modular com o valor arredondado introduz degrau artificial na
fronteira de cada ponto. Hoje: índice 50,7536 → M = 0,99699 (com 51 arredondado daria 0,99600).

### TETO E PISO ABSOLUTOS (valem sempre, acima da fórmula)
1. O resultado nunca passa de 100% do aporte nem fica abaixo de 0%.
2. A modulação **nunca move a decisão para o patamar de um estado vizinho**.
3. Se o Abrigo estiver ativo (3 anos ou menos até a entrega), ele é aplicado **antes** da
   modulação e **o teto dele prevalece**: a modulação pode reduzir o resultado, nunca elevá-lo
   acima de `base × fator_do_Abrigo`. Deixar o Índice empurrar exposição para cima do que o
   Abrigo já travou desmontaria a própria proteção. Na prática, com Abrigo ativo vale
   `M_efetivo = min(M, 1,00)`.

⚠️ **A regra 2 é mais apertada que a banda de ±20% nos dois estados de cima.** As bases 100% e 90%
estão separadas por 10 pontos, e a banda é de ±20% relativos. Onde a regra 2 morde:

| Estado | Base | Banda pela fórmula | Banda efetiva com a regra 2 | Quando morde |
|---|---|---|---|---|
| Capitulação profunda | 100% | 80% a 100% | **90% a 100%** | Índice acima de 75 |
| Prejuízo do mercado | 90% | 72% a 108% | **72% a 100%** | Índice abaixo de 22 |
| Estresse de curto prazo | 65% | 52% a 78% | 52% a 78% | nunca |
| Mercado saudável | 40% | 32% a 48% | 32% a 48% | nunca |

O caso de cima é teórico: exigiria Índice acima de 75 com o preço abaixo do custo do holder de
longo prazo, combinação que a correlação entre os dois torna quase impossível. **O caso de baixo
é real:** Índice abaixo de 22 com o preço abaixo do custo médio da rede é exatamente um fundo de
ciclo, e ali a regra 2 e o teto de 100% se encontram no mesmo lugar. Registrado como pendência
em `08-decisoes-29-08-2026.md`.

### MATRIZ DO APORTE — leitura de 29/08/2026 (Índice 50,75 · M = 0,99699)
| Estado | +3 anos | 3 anos | 2 anos | 1 ano | entrega |
|---|---|---|---|---|---|
| Capitulação profunda | 99,7% | 65,8% | 44,9% | 24,9% | 15,0% |
| Prejuízo do mercado | 89,7% | 59,2% | 40,4% | 22,4% | 13,5% |
| Estresse de curto prazo | 64,8% | 42,8% | 29,2% | 16,2% | 9,7% |
| **Mercado saudável** (estado de hoje) | **39,9%** | 26,3% | 17,9% | 10,0% | 6,0% |

Com o índice quase exatamente em 50, a modulação de hoje é praticamente nula — é o que se espera
de um ajuste fino num mercado em equilíbrio. As colunas com Abrigo ativo já trazem
`M_efetivo = min(M, 1)` aplicado.

### FLUXO 2 · REFORÇO DE FUNDO (Decisão 6, 29/08/2026)
Os dois fluxos são separados e **não se misturam**:

| | Fluxo 1 · Aporte do mês | Fluxo 2 · Reforço de fundo |
|---|---|---|
| Dinheiro | o que entrou naquele mês | o **caixa acumulado**, e só ele |
| Teto | 100%, absoluto | 25% do caixa por acionamento |
| Quando | todo mês | só nas condições abaixo |

**100% do aporte é todo o aporte — não existe 108% de uma coisa que acabou.** O reforço nunca
estica o aporte do mês; ele abre uma segunda torneira, que é o caixa. É para isso que o caixa é
guardado.

**As sete travas (todas obrigatórias; qualquer uma que falhe BLOQUEIA):**
1. Estado **Capitulação profunda** ou **Prejuízo do mercado** — só esses dois.
2. **Índice Semente ≤ 30.**
3. **Mais de 3 anos até a entrega.** Abrigo ativo bloqueia o reforço.
4. Libera no máximo **25% do caixa acumulado** por acionamento.
5. No máximo **3 acionamentos por ciclo**, espaçados em pelo menos **30 dias**.
   O que é um ciclo, aqui, está definido logo abaixo (Decisão 9).
6. Nunca deixa o caixa abaixo de **10% da carteira**.
7. Passa pelo **Gate humano como decisão própria**, separada do aporte do mês.

**Razão:** a tese é "acumular no desânimo". Sem esse fluxo o caixa vira enfeite e a tese não se
cumpre no único momento em que ela importa. Com as sete travas ele não vira gatilho de impulso:
exige estado ruim, intensidade baixa, horizonte longo, e ainda é fatiado.

**O que as travas 4 e 5 produzem juntas** (derivado, não digitado): como cada acionamento leva 25%
do que sobrou, três acionamentos consomem no máximo `1 − 0,75³ = 57,8%` do caixa, e restam 42,2%.
A sequência é 25,00% · 18,75% · 14,06% do caixa original. O ciclo mínimo de três acionamentos leva
60 dias. O piso da trava 6 pode interromper a sequência antes disso.

**Isto fecha o conflito da Decisão 4.** O caso que mordia era Prejuízo do mercado com Índice
abaixo de 22 — dentro da janela do reforço (estado válido, Índice ≤ 30). O aporte segue travado em
100% e o reforço vem por fora, do caixa. Com **Abrigo ativo o teto continua mordendo sem
compensação**, e isso é intencional: a trava 3 existe justamente para a proteção vencer.

### O CICLO E O RESET DA TRAVA 5 (Decisão 9, 29/08/2026)
**Ciclo, para efeito exclusivo de contar os três acionamentos**, é o intervalo entre dois marcos
de virada.

> **Marco de virada** = o Índice Semente fechar em **65 ou mais** por **30 dias corridos
> consecutivos**. Um único fechamento abaixo de 65 recomeça a contagem dos 30 dias do zero.

1. O contador de acionamentos **zera no dia em que o marco se completa** — o 30º dia.
2. Enquanto o marco não se completa, **o ciclo é o mesmo**, independentemente de quanto tempo
   passe. Um mercado deprimido por cinco anos sem nunca sustentar 65 por 30 dias dá três reforços
   nesses cinco anos, e não mais.
3. **A entrada em Abrigo também zera o contador**, mas a trava 3 continua valendo: em Abrigo não há
   reforço. O reset fica registrado para o caso de a carteira sair do Abrigo.
4. O contador é **por carteira**, não global.
5. O sistema **grava data e índice de cada acionamento e de cada reset**.
   **Sem registro gravado, o reforço não é liberado.**

**Consequência de implementação:** a regra 5 torna o Alocador um agente **com estado persistente**.
Ele não pode ser reconstruído a cada execução a partir só da leitura do dia — precisa de um
registro durável de acionamentos e resets por carteira. É o primeiro ponto do sistema com essa
exigência.

**O primeiro ciclo de cada carteira** começa na abertura dela, com o contador em zero. Não existe
marco de virada anterior para consultar, e nenhum é presumido.

**Nota de coerência com a Decisão 2:** aqui o Índice Semente define uma fronteira de contagem, o
que é papel permitido — ele **restringe ou permite, nunca aloca**. Continua sem classificar estado
e sem disparar decisão: o reforço ainda exige o estado da Linha d'Água, as outras seis travas e o
Gate humano.

**Saída:** proposta com ativo, percentual, faixa de preço e justificativa em uma linha. Se as
condições do Reforço de Fundo estiverem reunidas, ela vai **separada**, como segunda proposta,
acompanhada do registro do ciclo: quantos acionamentos já houve e quando foi o último reset.

**Limite:** PROPÕE. Não executa. Nem o aporte, nem o reforço.

---

## 4. AUDITOR
**Função:** o cão de guarda. Confere a proposta do Alocador.

**Checklist de reprovação (qualquer item falho = REPROVA):**
1. O peso resultante estoura o limite do ativo — 8% para qualquer um fora de BTC e ETH, e BTC+ETH
   somados em pelo menos 60%? Algum ativo ficou **abaixo do piso de 2%** da parte exposta? A carteira
   tem **mais de 8 ativos** fora de BTC e ETH? O rebalanceamento proposto usa aporte novo, e não
   venda?
2. O caixa fica abaixo do mínimo?
3. O preço proposto bate com a zona publicada?
4. Todo número citado bate com a fonte (tooltip/terminal)?
5. A proposta respeita o Abrigo dos anos finais?
6. Há promessa de retorno ou previsão de preço em algum texto?
7. A proposta usa o principal na fatia tática? (proibido — só ganho realizado)
8. O estado usado é o da Linha d'Água? (o Índice Semente não classifica estado)
9. Algum número derivado foi digitado à mão em vez de calculado da fonte primária?
10. A modulação respeitou os tetos absolutos — 0% a 100%, sem invadir patamar de estado vizinho,
    e sem elevar acima do que o Abrigo travou?
11. A camada 5 foi tratada como FORA da conta, e não como 50?
12. As séries de janela curta entraram amortecidas pelo fator de confiança?
13. Se há Reforço de Fundo na mesa: as sete travas foram TODAS conferidas uma a uma, e ele veio
    separado do aporte do mês, e não misturado nele?
14. O contador do ciclo foi lido de registro GRAVADO, e não recontado de memória? Sem registro, o
    reforço não é liberado.
15. **Se a rodada mexeu em projeção publicada:** o número de capa é o PISO conservador entre as
    cinco partidas, a tabela de deriva acumulada está presente e atualizada, e as cinco partidas
    foram recalculadas nos três cenários? Publicar só a linha afetada REPROVA. Deriva acima de
    +15% sobre a v1.3 em **qualquer uma das quinze células** não é reprovação automática, mas
    **para a revisão inteira** e sobe para o Gui — não se publica a parte que não estourou.
16. **O dono do piso mudou desde a versão anterior?** Se mudou, está registrado e reportado, mesmo
    que o valor do piso não tenha se movido?
17. **Se a rodada desdobrou alguma partida:** cada linha nova herdou a referência da linha de que
    nasceu, em vez de entrar sem base? Desdobramento sem herança REPROVA — zera a trava por via
    indireta.
18. **A base da deriva continua na v1.3?** Qualquer remedição contra base diferente da v1.3
    REPROVA, inclusive depois de recalibragem do limite.
19. **Todo ativo proposto está no universo elegível**, ou seja, veio da CRM, passou nas quatro
    alíneas do Filtro de Horizonte e está entre os **8 de maior capitalização de mercado** entre os
    aprovados? Ativo fora do universo
    REPROVA. Exclusão por **teto de contagem** foi registrada como tal, e não como reprovação de
    tese?
29. **Alguma âncora estrutural foi alterada?** São **oito** — as sete abaixo mais a **banda de 3
    pontos** da glidepath: a base v1.3 da trava de deriva · o teto
    de 12 pontos de defasagem · o piso de 60% em BTC e ETH · a lista fechada dos três gatilhos de
    venda · a validade de 180 dias do degrau · o teto de 8% por ativo com a faixa até 12% · o piso
    de 2% por posição. Alteração sem decisão registrada, com razão escrita e passagem pelo Gate 2,
    **REPROVA** — e vale nos dois sentidos, para tirar e para pôr. **A faixa 8%–12% é âncora de par:
    mover só o gatilho de 12% conta como alteração do teto.**
20. **O universo elegível está fresco?** Se a composição da CRM não pôde ser lida, a proposta diz
    desde quando o universo está congelado? Universo desatualizado sem rótulo REPROVA.
21. **Os tetos foram medidos sobre a parte EXPOSTA**, e não sobre a carteira inteira? Se algum
    ativo passou de 12% da parte exposta, a venda parcial de volta a 8% foi levada ao Gate como
    decisão própria e registrada com data, ativo e percentual antes e depois?
22. **Se a camada 5 entrou:** a agregação é média ponderada pelo tamanho da posição na parte
    exposta? Ativo sem degrau ficou FORA do cálculo, em vez de entrar como 100 ou 0? Os ativos **fora
    de BTC e ETH** sem degrau somam 30% ou menos da parte exposta — e, se somam mais, a camada saiu
    inteira? A etiqueta de julgamento traz as três informações?
23. **Os degraus de BTC e ETH estão vigentes?** Vencido ou nunca atribuído em qualquer um dos dois,
    a camada 5 é SUSPENSA por inteiro e a leitura diz isso em texto, com a data. Camada 5 calculada
    sem o degrau de BTC ou de ETH REPROVA — renormalizar sem um ativo de 30% ou mais descreve outra
    carteira.
24. **Algum degrau usado passou de 180 dias?** Degrau vencido é ausência, nunca valor herdado.
    Renovação sem data nova e motivo escrito não é renovação — REPROVA.
25. **O mapa de vencimentos dos próximos 180 dias, por janela fechada de 30, foi produzido?** Sem o
    mapa REPROVA. O mapa traz duas linhas (Decisão 21):
    a. **BTC e ETH** — a 45 dias ou mais um do outro. Abaixo disso REPROVA.
    b. **Régua única** — nenhuma janela `[t, t+30]` com vencimentos de ativos fora de BTC e ETH
       somando mais de **30% da parte exposta**. Estouro **REPROVA** até ser escalonado. É a régua
       oficial desde a Decisão 21, não mais linha informativa.
26. **Se houve consolidação de posição abaixo do piso de 2%:** ela foi levada ao Gate como decisão
    própria, registrada com data, ativo e percentual antes e depois? Consolidação executada sem
    passar pelo Gate REPROVA — é venda, e vale a mesma regra do degrau 3.
27. **Toda venda proposta é um dos TRÊS gatilhos determinísticos — estouro acima de 12%, queda
    abaixo de 2%, ou realização programada da glidepath — ou uma decisão de tese registrada?** Venda
    que não caiba REPROVA. **Gatilho novo nunca nasce de implementação: exige decisão registrada.**
    No gatilho 3: o alvo foi **interpolado mês a mês**, e não lido como degrau anual? O fator do
    estado foi aplicado (1,50 · 1,00 · 0,50 · 0,25)? A **defasagem acumulada** está registrada e
    abaixo do teto de 12 pontos — e, se no teto, o fator voltou a 1,00? Nos **últimos 12 meses** o
    fator é 1,00 e a defasagem está sendo liquidada? O fluxo do mês foi consumido antes de qualquer
    venda? A ordem de venda respeita o peso de longo prazo, com BTC e ETH por último? A banda de 3
    pontos foi respeitada? Cada tranche tem data, ativo, quantidade e exposição antes e depois?
    **A precedência foi respeitada** — defesa primeiro, Índice de Plantio no que sobrar, excedente
    para a parte protegida? Aporte consumido pela defesa saiu com a frase exata *"aporte
    integralmente destinado à proteção"*? **Com o Abrigo ativo, o caixa parou de receber aporte
    novo, e o caixa existente foi consumido ANTES do aporte e da venda?**
28. **Alguma vaga bloqueada passou de 90 dias sem ir ao Gate?** Prorrogação silenciosa REPROVA — a
    escolha entre manter e invalidar tem de estar registrada com data e motivo.

**Saída:** CARIMBA ou REPROVA, com o motivo.

**Limite:** não propõe alocação. Só confere.

---

## 5. RESPONSÁVEL PELOS POSTS
**Função:** transformar a decisão aprovada em comunicação ao cliente.

**Regras (herdadas da voz da casa):**
- Uma ideia por post · sem emoji · sem hype
- Nomeia o indicador E traduz na mesma frase (Teste da Amiga)
- Proibido `=` e `≠` no texto
- Sem previsão de preço · sempre "a decisão final é sempre sua"
- Fecha com o "café": laço aberto no começo, retorno e pergunta no fim

**Limite:** monta o rascunho. **Publicar é humano.**

---

## 6. LABORATÓRIO
**Função:** estudar, não mandar.

**O que faz:** testa hipóteses contrafactuais — e se tivéssemos rotacionado capital daqui para ali
naquele momento? Estuda migração de capital entre ativos e carteiras.

**Saída:** aprendizado registrado. Nunca ordem.

**Quando construir:** por último, com a carteira já rodando.
