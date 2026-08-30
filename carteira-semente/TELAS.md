# PEÇA 4 — TELAS
Conferência. Versão 1.4 · 29/08/2026 — os quatro itens

| Item | Tela | Estado |
|---|---|---|
| **1** | **`aporte-do-mes.html`** — modulação e Reforço de Fundo | ✅ **feito** |
| **2** | **`registro-de-ciclo.html`** — marco, acionamentos e o log inteiro | ✅ **feito** |
| **3** | **`indice-semente.html`** — reescrita para perguntar à Torre | ✅ **feito** |
| **4** | **`simulador.html`** — motor mensal, partida, capa, deriva | ✅ **feito** |

---

## ITEM 1 · `aporte-do-mes.html`
Os dois mecanismos que não tinham tela nenhuma. Três blocos:

1. **Modulação do aporte** — a fórmula com o índice cheio, os três cartões da conta, e os
   **três tetos absolutos** com a marca de qual mordeu naquela leitura.
2. **Modulação da glidepath** — alvo, passo do mês, fator do estado, quanto move, defasagem.
3. **Reforço de Fundo** — as **sete travas**, uma por linha, com a leitura de cada uma.

Controles para mover estado, índice, meses até a entrega, caixa, carteira e acionamentos: o
mecanismo responde na tela, que é a única forma de conferir que ele responde.

### A tela não calcula nada
Ela **importa `alocador/alocador.mjs`** — os 20 símbolos que usa vêm do módulo da peça 3.
Nenhum número derivado é digitado no HTML (invariante 10). Se a peça 3 mudar, a tela muda junto,
e se as duas discordarem é porque uma delas quebrou.

> **Precisa ser servida, não aberta como arquivo.** `import` de módulo não funciona em `file://`.
> Da raiz do repo: `python3 -m http.server` e abrir `carteira-semente/aporte-do-mes.html`.
> É o preço de a tela usar o módulo de verdade em vez de copiar os números.

### O que ela mostra que não estava em lugar nenhum
- **Qual teto absoluto mordeu**, em cada leitura. A regra 2 só morde em dois casos e ambos são
  difíceis de imaginar sem ver; agora se vê.
- **`M_efetivo = min(M,1)`** acontecendo: com o Abrigo ativo e Índice 20, M seria 1,12 e o cartão
  mostra 1,00000 com a legenda *"travado em 1 pelo Abrigo"*.
- **A trava 7 marcada como Gate**, em cor própria, e não como "passa" nem como "falha". Ela não é
  uma trava que o código avalia — é a assinatura do Gui, e a tela diz isso.
- **Sem registro gravado** vira bloco vermelho, não uma linha discreta: é a D9 regra 5, e sem ela o
  reforço não é liberado.

---

## 🐛 DOIS ERROS QUE SÓ A TELA PEGOU

### 1. A trava 3 dizia "3 anos" com a regra já em 4
A **D43** mudou `ABRIGO_ATIVO_ANOS` de 3 para 4. A *lógica* da trava usa a constante e estava
certa — o **rótulo** estava escrito à mão como `'mais de 3 anos até a entrega'` e não mudou.

Nenhum teste pegava: eles conferem `bloqueiam.includes(3)`, não a redação. E é a redação que a
pessoa lê na tela — um texto dizendo *"3"* com o sistema bloqueando a *4* engana exatamente quem
está tentando conferir. Agora o rótulo é montado da constante, e há teste da redação.

*Mesmo padrão do bug da data no comando de conferência: teste de lógica passa, e quem denuncia é
olhar a saída.*

### 2. Nenhuma das quatro telas declarava charset
`indice-semente.html`, `linha-dagua-mercado.html` e `simulador.html` **nunca tiveram**
`<meta charset="utf-8">` — e as três são escritas em português com acento em quase toda linha.

Servidas por um servidor que não manda `charset` no cabeçalho (ou abertas em `file://`), o
navegador adivinha latin-1 e **toda palavra acentuada corrompe**: *"situação"* vira *"situaÃ§Ã£o"*.
Foi assim que a tela nova apareceu na primeira renderização.

Corrigido nas quatro. É uma linha em cada, não muda comportamento nenhum, e estava lá desde antes
desta implementação começar.

---

## ITEM 2 · `registro-de-ciclo.html`
As sete coisas, na ordem que a decisão pediu — e o log cru por último e por inteiro.

| | Seção | O que mostra |
|---|---|---|
| 1 | **O marco de virada** | dias na sequência, quantos faltam dos 30, o limiar, e se completou |
| 2 | **Acionamentos no ciclo** | data, Índice e % do caixa de cada um; quantos restam dos três |
| 3 | **Resets** | data, o marco que causou, a sequência que o sustentou — e **anulado** riscado, sem sumir |
| 4 | **Retificações** | a data a que se refere ao lado da data de coleta, com motivo e aprovação |
| 5 | **Anulações de marco** | apontando para os **dois**: o marco desfeito e a retificação que o desfez |
| 6 | **Composição da CRM** | congelada ou fresca, e desde quando está desatualizada |
| 7 | **O log inteiro** | cronológico, **sem filtro**, 51 eventos legíveis de cima a baixo |

A tela **pergunta ao registro** — `diasConsecutivosNoMarco`, `cicloReforco`, `composicaoCRM`,
`eventos` — e não recalcula nada. Há teste de que ela chama os quatro, e de que o log renderiza
`eventos.map`, sem filtro no meio.

### O histórico de exemplo, e por que ele existe
`registro/historico-exemplo.mjs` constrói um caso que exercita as seis seções: o fundo com dois
acionamentos, os 30 fechamentos que completam o marco, o reset que o registro grava sozinho, a CRM
que fica ilegível, e uma retificação que **derruba um dia da sequência e anula o marco**.

**Escrito contra o módulo, não contra a minha ideia dele.** A primeira versão da retificação foi
**recusada**: eu tinha posto `valorAntigo: 69.2` e o registro respondeu que o vigente era `71.2`.
Ele estava certo — a sequência sobe 0,3 por dia desde 65+2, e o 15º dia fechou em 71,2.

E o efeito da anulação é a parte que vale ver: o marco cai, o ciclo **volta a ser o primeiro**, e os
**dois acionamentos voltam para a contagem**. Um reforço que parecia gasto volta a estar disponível
porque a leitura que fechava o ciclo estava errada.

### ⚠️ Um limite do exemplo, dito na própria tela
`gravadoEm` é carimbado na hora da **escrita**. Um histórico construído de uma vez tem **todo evento
"retroativo"** por essa medida — as 44 leituras apareciam na seção 4, que virava ruído.

Não é defeito da tela nem do registro: **é limite do exemplo**, e nenhum ajuste de filtro conserta,
porque a distinção só existe em operação real. A seção passou a listar as **retificações**, que são
retroativas por natureza, e a nota abaixo dela diz por que as leituras não entram. *A tela explica a
própria limitação em vez de esconder atrás de um filtro.*

## 🐛 DOIS DEFEITOS DE TEXTO QUE SÓ A PÁGINA MOSTROU
1. **O subtítulo da seção 4 contradizia a tabela** — dizia que ela listava *"as retificações e as
   leituras que passaram da janela"* depois de eu ter mudado a tabela para listar só retificações.
   Texto dizendo uma coisa e mecanismo fazendo outra: exatamente a D44, agora na prosa.
2. **"1 restantes"** — plural fixo. Pequeno, e do tipo que só existe porque ninguém abriu a página.

*Item 9 do Gate 2 se pagou de novo: a suíte passava inteira nos dois casos.*

---

## ITEM 3 · `indice-semente.html`
**Critério de aceite batido: exibe 51, valor interno 50,7536, faixa Equilíbrio** — o número que a
Torre já produz, e que o briefing fixou antes desta tela existir.

A tela foi **reescrita para perguntar**. A versão anterior tinha a tabela de indicadores, os pesos e
a normalização dentro do HTML; agora chama `varrer()` e `camada5()` e mostra o que volta. Há teste de
que `Math.log`, `posCamada`, `c:1` e uma tabela `PESOS` própria **não voltam** ao script.

### As oito divergências, e onde cada uma foi resolvida
| | Divergência | Como se resolve |
|---|---|---|
| 1 | dupla contagem do MVRV | a Torre já lê o MVRV como régua da camada 1, e a camada 2 tem três itens |
| 2 | faixas disparando decisão | a faixa é rótulo de **intensidade**; a nota da D2 fica **onde o número aparece** |
| 3 | camada 5 como 50 fixo | ela aparece em **Fora da conta**, com o motivo, e os pesos renormalizam |
| 4 | confiança por janela | seção própria, com bruto e ajustado — ETF 54,97 → **52,61** |
| 5 | netflow na camada Fluxo | a camada mostra os que entraram e nomeia o **ausente** |
| 6 | renormalização interna | o peso **aplicado** aparece ao lado do **nominal**, e a trava do terço é dita |
| 7 | estados dos extremos | os três estados, e as **cinco contagens** separadas |
| 8 | camada 5 suspensa | seção própria, nomeada e datada |

**Os pesos aplicados aparecem ao lado dos nominais** — 38,6% contra 34,0% — que é a renormalização
da D5 visível em vez de deduzida.

### 🐛 Um defeito no MÓDULO que só a tela expôs
Para exercitar a divergência 8 precisei de uma carteira com degrau vencido. A frase que a Torre monta
saiu assim:

> *camada 5 suspensa por tese **tese vencida** em BTC, desde 2025-06-01*

O template dizia `por tese ${razao}` e `razao` já era *"tese vencida"*. **E havia um teste fixando a
duplicação** — escrito a partir da saída, não da intenção, ele congelou o defeito.

Corrigido para *"camada 5 suspensa: degrau de BTC tese vencida, desde 2025-06-01"*, e os dois testes
passaram a conferir **o que a frase precisa dizer** — nomeia o ativo, traz a data, não duplica
palavra — em vez do texto exato. *É a D46 aplicada a um teste que já existia: ele procurava a frase,
não a ligação.*

### 🐛 E um meu, na primeira renderização
`$('exibido').innerHTML` destruía o `<small id="interno">` que vivia dentro dele, e a linha seguinte
morria em `null`. A página abria com um traço no lugar do índice. **Nenhum teste pegaria** — é DOM,
e só aparece abrindo.

---

## ✅ A D44 FECHOU O PADRÃO QUE ESTES ERROS FORMAVAM

### O checklist de toda tela nova
| | Item | Onde é conferido |
|---|---|---|
| 1 | `<meta charset="utf-8">` **antes do primeiro acento** | teste de redação |
| 2 | todo rótulo com número **gerado da constante** | teste de redação |
| 3 | a tela é **renderizada e olhada** antes de dada por pronta | Gate 2, item 9 |
| 4 | **o que entrou no commit é conferido, não suposto** (`git show --stat`) | Gate 2, item 9 |

### O teste de redação — `redacao.test.mjs`
Dezesseis testes que ligam **texto** a **constante**, e que quebram quando os dois divergem:

- **28 trechos de documento** conferidos contra a constante que o sistema usa — o início do
  Abrigo, os quatro pontos da glidepath, a banda, o teto de defasagem, as sete travas, os tetos
  de concentração, o marco de virada, a validade do degrau, o limiar de liquidez.
- **A matriz do aporte** publicada, conferida contra `base × M`.
- **Os pesos renormalizados** do briefing, contra `PESOS` — e a soma 0,88 da camada 5 fora.
- **Os fatores de velocidade** da D25 B, escritos no documento 01.
- **O charset** das quatro telas, e a posição dele antes do primeiro acento.
- **Onze números** que já estiveram escritos à mão na tela, e o nome que passou a gerá-los.
- **Os rótulos das sete travas** que viajam do módulo para a tela.

**Provei que ele morde** — `provas.mjs`, **21 provas**, quebrando cada uma de propósito: trocar *"Começa a 4 anos"* por *3* no
documento 01 e devolver `±20%` como literal na tela. Os dois acusaram, com a linha e a constante
esperada. *Teste que não pode falhar não é teste.*

### A invariante 12
> **Texto visível que cita número sai da constante.** É irmã da invariante 11: aquela proíbe
> digitar **derivado**, esta proíbe digitar **constante**.

---

## O QUE ESTA TELA NÃO FAZ
- **Não executa, e diz que não executa** — o selo *"propõe — quem assina é o Gui"* fica no topo,
  fixo, em toda leitura.
- **Não lê o terminal.** Os controles são de simulação: servem para ver o mecanismo, não para
  publicar leitura. A leitura real vem da Torre.
- **Não grava.** O registro de ciclo é o item 2.

---

## ITEM 4 · `simulador.html`
A tela que existia desde antes das decisões de 29/08, e que acumulava **cinco divergências** — a
última delas estrutural. O motor saiu do HTML e virou módulo (`simulador/motor.mjs`), como a Torre
e o Alocador já eram.

### As sete coisas pedidas, e onde cada uma ficou
| | O que a decisão manda | Onde |
|---|---|---|
| 1 | motor **mensal**, Abrigo por ano e fase por mês (D11 · D25 A) | `motorMensal` · `faseDoMes` · `expoDoAno` |
| 2 | par **estado-índice** definindo fase e mês, com os quatro na tela (D8 · D10 · D11) | `partidaDaLeitura` · bloco *A leitura que define a partida* |
| 3 | Abrigo a **4 anos**, tabela EXPO completa (D43) | `TABELA_EXPO` · seção *O Abrigo* |
| 4 | velocidade pelo estado, defasagem com teto, últimos doze sem modular (D25 B·C·D) | `trajetoriaDaGlidepath` · gráfico *Alvo × exposição real* |
| 5 | capa vira o **piso**, leitura do dia em segunda linha rotulada, cinco partidas ao lado (D12 A) | `numeroDeCapa` · bloco *O número que abre* |
| 6 | tabela de deriva **permanente, por linha**, contra a v1.3 (D12 B · D13) | `grade` · seção *Deriva por linha* |
| 7 | sem Linha d'Água **não há projeção** (D8) | caminho de recusa, com `return` |

### O critério de aceite, rodado DEPOIS da troca do laço
> Com mês de entrada 0, o motor mensal reproduz o anual com **diferença zero** nas doze
> combinações de fase e cenário.

Rodado de novo com o laço já trocado: **12 combinações, maior diferença 0,000000.** O motor anual
ficou no arquivo só para ser o réu dessa comparação — ele não alimenta tela nenhuma. E o resultado
aparece **na própria tela**, no bloco *Conferência do motor*, não só no teste.

As cinco partidas nos três cenários reproduzem as tabelas publicadas número a número, e a grade de
deriva reproduz a da D13 célula a célula — **6 de 15 acima do limite**, as mesmas seis.

### 🐛 O QUE SÓ APARECEU NA TELA
**1. O rótulo do TETO colidia com o do alvo.** Na entrega o teto da defasagem (12) e o alvo (15,8)
ficam a menos de quatro pontos um do outro, e num gráfico de 280 px isso é dez pixels. Os três
rótulos da direita se escreviam por cima. O teto foi para dentro, à esquerda; os dois da direita
passaram a ser separados por **altura mínima**, não pela posição crua.

**2. As células da tabela quebravam o `R$` do número.** `R$ 297.492` virava duas linhas. `nowrap`
nas células numéricas, `normal` só na primeira coluna.

Nenhum dos dois quebra teste nenhum: são de tela, e só a tela mostra.

### 🐛 E DOIS QUE A SUÍTE PEGOU, DOS QUAIS UM ERA MEU
**A asserção da defasagem no teto estava um mês fora.** O teste dizia *"no teto o fator volta a
1,00"* e lia a defasagem **depois** do mês. Mas quem decide o fator é a defasagem **com que o mês
começou** — o mês que leva a defasagem ao teto ainda modula, e é o seguinte que trava. O módulo
passou a guardar `defasagemAntes` e `defasagem` na mesma linha, e a asserção passou a perguntar
pela certa. A regra não mudou; a leitura dela é que estava.

**A prova do motor nasceu reprovando por mira ambígua.** A expressão da fase aparecia em dois
lugares do módulo, e mutar um deixaria o outro de pé (D47 A). A resposta não foi `todas: true`, foi
extrair `faseDoMes()` — ponto de uso único é melhor que mutação em duplicata.

### ⚠️ DUAS COISAS MEDIDAS QUE PEDEM DECISÃO
**a) A banda de 3 pontos sobrevive à entrega, e nada a liquida.** A defasagem chega a zero em todas
as cinco partidas, como a D25 D manda. Mas a exposição chega **2,8 a 3,2 pontos acima do alvo** em
todas elas — porque a banda é tolerância de posição e, por definição (D25 E), *não gera defasagem*.
O que a D25 D liquida é a defasagem; a banda não é defasagem, e por isso nada a liquida. A carteira
entrega a 18,7% com alvo em 15,8%. **Suspender a banda nos últimos doze meses, junto com a
modulação, é decisão do Gui — não foi tomada aqui.**

**b) O fator 1,50 não faz nada enquanto não há defasagem.** Ele move o passo do mês vezes
`min(fator, 1)` e só recupera defasagem acima disso (D25 C). Numa trajetória sem defasagem
acumulada, 1,50 anda exatamente o mesmo que 1,00. Está correto e é o que a decisão diz — mas
contraria o que o rótulo sugere a quem lê, e por isso a tela escreve o que cada fator **faz com o
passo do mês**, e não só o número.

### O checklist da tela nova, item por item
| | Item | Como ficou |
|---|---|---|
| 1 | charset antes do primeiro acento | já estava, conferido pelo teste |
| 2 | todo rótulo com número gerado da constante | 10 constantes interpoladas, 9 literais proibidos |
| 3 | renderizada e olhada | aberta servida, nos três caminhos: leitura, recusa e hipotética |
| 4 | o que entrou no commit é conferido | `git show --stat` depois de gravar |

E os três caminhos foram abertos de verdade: a leitura de hoje (Mercado saudável · 51 · fase 2 ·
mês 0), a recusa (*"faltam 4 de 4 séries de origem"*, sem projeção embaixo) e a hipotética (o
seletor mudado marca **simulação hipotética** e a segunda linha continua sendo a do dia).

---

## D51 · O QUE ENTROU NA TELA DEPOIS DA CONFERÊNCIA
| | O que a decisão manda | Onde ficou |
|---|---|---|
| 51 A | a banda afunila de 3 a zero no último ano | `bandaDoMes()` · painel *A trajetória desta partida* |
| 51 B | o ganho da modulação é medido e mostrado, nunca aplicado | bloco *Ganho não projetado* |
| 49 | os R$ 150 são referência, e saem rotulados | `APORTE_DE_REFERENCIA` · nota da base |

O painel da trajetória ganhou três campos: **folga na entrega**, **banda no último mês** e **a banda
segurou — 0 de 12 meses**. O terceiro existe porque o segundo, sozinho, deixaria a leitura acreditar
que a banda passou a fazer o trabalho.

### ⚠️ O afunilamento é inerte, e a tela diz isso
A exposição na entrega não se moveu: 18,67 a 19,02 por cento, contra alvo de 15,83, as mesmas de
antes. A banda não decidiu nada em nenhum dos doze meses do último ano — em 12 dos 12 a distância já
era maior que o passo. Quem segura a folga é o teto `min(passo, distância)`, não a banda.

A tela escreve isso **na própria nota**, com os números da partida em uso, e o registro completo com
o que fecharia a folga está na D51 e no README do Alocador. Não foi feito porque não foi decidido.

---

## D52 · O MÊS CORRIGE A POSIÇÃO
O painel da trajetória foi refeito, e por um motivo que não é cosmético: ele chamava **dois alvos
diferentes de "entrega"**.

| Campo | O que é |
|---|---|
| Exposição no último mês | onde a carteira fecha o último mês que o cronograma administra |
| Contra o marco da entrega | quanto sobra contra os 15% da tabela — o passo que ninguém executa |
| Banda no último mês | 0,25 pt, ponta do afunilamento da D51 A |
| A banda dimensionou o mês | a medida que passou a carregar o diagnóstico (D52 D) |

`alvoNaEntrega` era o alvo do **último mês administrado** (15,83%), não o marco da entrega (15%).
Enquanto a folga era de 2,83 pontos, o mês escondido no nome não aparecia. Com a D52 fechando a
folga, sobrou exatamente ele — **0,83 pontos, um passo de rampa** — e o nome errado ficou visível.

### 🐛 Um rótulo comercial que virou falso
A D51 B mandou rotular o bloco como **"ganho não projetado"**. Depois da D52 o efeito pode ser
negativo, e na partida da leitura de hoje é: **−3,8% no conservador**. Escrever *ganho* sobre um
número negativo em tela de venda é rótulo falso.

O rótulo passou a sair da medida — *Ganho* quando o efeito é todo para cima, *Efeito* quando não é —
como manda a D44. E a nota diz, com os números da partida, que a frase da D51 B sobre o número
publicado subestimar deixou de valer para todas.

### O checklist, item 4 outra vez
`git show --stat` depois de gravar. Doze arquivos, conferidos.
