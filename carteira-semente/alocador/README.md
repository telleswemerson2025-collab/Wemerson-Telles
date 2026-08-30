# PEÇA 3 — ALOCADOR
Conferência. Versão 1.1 · 29/08/2026 — a D43 fechou a divergência do início do Abrigo

**32 testes.** Rodar da raiz do repo: `node --test carteira-semente/alocador/alocador.test.mjs`

O que ele faz: recebe a leitura da Torre e o estado do Registro, e **propõe** para onde
vai o aporte do mês. Não executa nada — nem o aporte, nem o reforço, nem a venda.

---

## O TESTE QUE VALE MAIS QUE OS OUTROS
A **matriz do aporte** está publicada em `02-agentes.md`, e foi derivada antes deste
código existir. As **vinte células** batem, com o índice real de 29/08/2026:

| Estado | +3 anos | 3 anos | 2 anos | 1 ano | entrega |
|---|---|---|---|---|---|
| Capitulação profunda | 99,7% | 65,8% | 44,9% | 24,9% | 15,0% |
| Prejuízo do mercado | 89,7% | 59,2% | 40,4% | 22,4% | 13,5% |
| Estresse de curto prazo | 64,8% | 42,8% | 29,2% | 16,2% | 9,7% |
| Mercado saudável | 39,9% | 26,3% | 17,9% | 10,0% | 6,0% |

É a única checagem que não é o código conferindo a si mesmo.

---

## DECISÃO → CÓDIGO → TESTE

| Decisão | Código | O teste prova |
|---|---|---|
| **D4** · fórmula de modulação | `modulador()` | M(50) = 1 · M(50,7536) = 0,99699 · clamp [0,80; 1,20] |
| doc 02 · modular com o índice **cheio** | idem | M(50,7536) ≠ M(51) — arredondar cria degrau artificial |
| doc 02 · teto absoluto **regra 2** | `limitesDoPatamar()` | as quatro bandas efetivas: 90-100 · 72-100 · 52-78 · 32-48 |
| doc 02 · teto absoluto **regra 3** | `mEfetivo()` | com Abrigo, `min(M,1)`: reduz, nunca eleva |
| **D25 A** · alvo interpolado | `alvoDaGlidepath()` | os quatro passos: 2,83 · 1,75 · 1,67 · 0,83 |
| **D30** · banda de 3 pontos 🔒 | `demandaDaGlidepath()` | dentro dela não se move nada |
| **D51 A** · a banda afunila no último ano 🔒 | `bandaDoMes()` | `3 × (meses restantes ÷ 12)`, zero na entrega |
| **D52 A** · o mês corrige a posição | `demandaDaGlidepath()` | `min(distância, max(passo, distância − banda))` |
| **D25 B** · velocidade pelo **estado** | `fatorDeVelocidade()` | 1,50 · 1,00 · 0,50 · 0,25, e o Índice não entra |
| **D25 C** · defasagem | idem | acumula 1,31 em Capitulação, recupera 0,88 em Saudável |
| **D25 C** · teto de 12 pontos 🔒 | idem | no teto o fator volta a 1,00 mesmo em Capitulação |
| **D25 D** · últimos 12 meses | idem | fator 1,00 em todo estado, e defasagem **liquidada** |
| **D26** · precedência | `destinacaoDoAporte()` | *"aporte integralmente destinado à proteção"* |
| **D27** · caixa → aporte → venda | idem | caixa cobrindo ⇒ venda zero e aporte intocado |
| **D27** · Abrigo ativo, caixa não recebe | idem | excedente vai para a parte protegida |
| **D6** · as sete travas | `reforcoDeFundo()` | as sete aparecem sempre; cada uma bloqueia sozinha |
| **D9** · sem registro, sem reforço | idem | `ciclo: null` ⇒ bloqueado |
| **D31** · trava 6, piso de caixa 🔒 | idem | o piso interrompe a sequência antes das três |
| travas 4+5 juntas | teste derivado | 25,00 · 18,75 · 14,06 → consome 57,8%, restam 42,2% |
| doc 01 · três degraus do teto | `degrauDoAtivo()` | 8% para · 12% vende de volta a 8% · BTC e ETH sem teto |
| doc 01 · ordem de venda | `ordemDeVenda()` | fora das âncoras primeiro, do menor peso; BTC e ETH por último |
| **invariante 1** | `propor()` | a saída diz *"PROPÕE — não executa"*, e a trava 7 nunca passa |

---

## ✅ A DIVERGÊNCIA FOI FECHADA PELA D43
A peça 3 levantou: *a glidepath começa a 4 anos ou a 3?* A **D43 A** alinhou o Abrigo à rampa —
`ABRIGO_ATIVO_ANOS` passou de 3 para 4 e ficou **igual** a `INICIO_DA_RAMPA_ANOS`.

As três regras que estavam desalinhadas passam a valer no mesmo dia em que a rampa começa a mover:

| Regra | Antes | Depois |
|---|---|---|
| teto `M_efetivo = min(M,1)` | só a 3 anos | **a 4 anos** |
| trava 3 do Reforço de Fundo | bloqueia a 3 anos | **bloqueia a 4** |
| ordem caixa → aporte → venda | abre a 3 anos | **abre a 4** |

**Não há mais janela com demanda e caixa fechado.** `divergenciaDoInicioDaGlidepath()` deixou de
existir, e há teste de que ela não viaja mais na proposta — sair da saída é o sinal de que a pergunta
foi respondida.

### O preço, medido
A decisão diz o custo em voz alta. Medi, porque custo dito sem número é custo não conferido — e a
parte maior não é a que a decisão menciona:

| Momento | Estado | Índice | Antes | Depois | Perda |
|---|---|---|---|---|---|
| 3,5 anos | Capitulação profunda | 10 | 96,3% | **83,0%** | **−13,3 pts** |
| 3,5 anos | Prejuízo do mercado | 10 | 86,7% | 74,7% | −12,0 |
| 3 anos | Capitulação profunda | 10 | 76,6% | 66,0% | −10,6 |

No fundo mais fundo a carteira aporta **13 pontos a menos** no trecho que a D43 passou a proteger.
*É a invariante 6 aplicada onde ela custa — o único lugar onde invariante prova que vale.*

**Os vinte números da matriz não mudaram**, porque hoje M = 0,99699 já é menor que 1 e o teto não
morde. A decisão muda o comportamento com Índice abaixo de 50, não o número publicado hoje.

---

## 🐛 UM ERRO MEU QUE A D25 C PEGOU
Escrevi a modulação incidindo sobre a **distância acumulada** até o alvo. A tabela da
D25 C não fechava: ela publica *"Capitulação 0,25 → acumula 1,31 pt"*, e 1,31 só sai de
**1,75 × 0,75** — 1,75 é o **passo mensal** do trecho 3→2 anos.

**A modulação incide sobre o passo do mês, não sobre a distância.** Modular a distância
contaria a defasagem duas vezes: ela já é, por definição, o que a modulação deixou de
mover.

*O erro não aparecia em teste de forma nenhuma — só apareceu porque a decisão publica um
número derivado e eu fui bater contra ele. É o mesmo padrão da conferência dos extremos:
o que pega erro é comparar com número gerado fora do código.*

**E isso separou duas coisas que eu tinha misturado:** a **banda de 3 pontos** é
tolerância de *posição* e não gera defasagem; a **defasagem** é o que a *modulação*
deixou de mover. Estar dentro da tolerância não é estar atrasado.

---

## O QUE ESTA PEÇA NÃO FAZ
- **Não executa.** Nem aporte, nem reforço, nem venda. A trava 7 do Reforço nunca passa
  por código nenhum, e a saída diz isso em texto.
- **Não classifica estado.** O estado vem da Linha d'Água pela Torre (D2).
- **Não grava.** O evento do reforço sai pronto (`eventoDeReforco`) para a peça 1 gravar
  quando o Gate assinar.
- **Não monta a composição** — o espelho filtrado da CRM, o Filtro de Horizonte e o teto
  de contagem estão na Torre (peça 2). Aqui só entram os **tetos de concentração**, que
  são decisão de alocação.
- **Não confere a si mesmo.** Isso é o Auditor, e ele não está nesta peça.


## ⚠️ O QUE A D51 A MEDIU, DEPOIS DE IMPLEMENTADA — E O QUE A D52 FEZ COM ISSO
*Superado pela D52 A, e mantido porque o registro guarda a decisão, a medição e a correção.*


O afunilamento da banda **não moveu a exposição da entrega**. Mês a mês, a trajetória com banda
afunilada é idêntica à com banda de 3, nas cinco partidas — a carteira segue chegando 2,83 a 3,19
pontos acima do alvo.

A banda nunca chega a ser consultada no último ano: **em 12 dos 12 meses a distância já é maior que
o passo**, e nesse regime `mover = min(passo, distância) = passo`. O mês anda um passo, o alvo desce
um passo, e a folga fica onde estava. Com banda 3 ou banda 0,25, dá no mesmo.

E a folga não nasce no fim: **2,83 é o passo do primeiro trecho da rampa** (4a→3a). Ela aparece no
primeiro mês em que a rampa move e é carregada intacta até a entrega.

O que a fecharia — e **não foi feito, porque não foi decidido** — é deixar o mês corrigir a
*posição* quando ela está fora da banda, em vez de só acompanhar o passo:

```js
programado = Math.min(distancia, Math.max(passo, distancia - banda))
```

Isso não mexe na D25 C: a modulação continuaria incidindo sobre `programado`. Muda o que
`programado` é. **A decisão acertou o alvo e errou a arma** — o que segurava a exposição acima do
alvo nunca foi a banda.

A medida está fixada em teste (`mesesEmQueABandaSegurou === 0`, `mesesTravadosNoPasso === 12`), com
a mensagem dizendo que, se ela mudar, a conclusão registrada na D51 precisa ser refeita.


## A D52 A, E A GUARDA QUE ELA EXIGIU

A correção de posição sozinha fez **quatro das cinco partidas entregarem ABAIXO do alvo** — 13,50%
contra 15,83% —, ainda vendendo com a carteira sub-exposta nos últimos oito meses.

A causa: `mover = movidoPeloFator + aRecuperar + liquidacao`. Os dois últimos termos foram escritos
para um `programado` limitado ao passo, e passaram a ser somados por cima de um `programado` que já
fecha a distância inteira. **Dupla contagem da defasagem, entrando pela outra porta** — a mesma que o
comentário da D25 C alertava.

A guarda é o que a D52 B já afirmava: **banda zero, distância zero. Não negativa.**

```js
const mover = Math.min(moverBruto, Math.max(distancia, 0));
```

Com ela, quatro partidas fecham o último mês exatamente no alvo do mês, e a quinta fecha 0,25 acima
— que é a banda daquele mês.

### E a tabela da D25 C passou a valer só num regime
A acumulação da defasagem é `(1 − fator) × programado`. Com `programado` limitado ao passo, isso é
`(1 − fator) × passo`, que é a tabela publicada. Longe do alvo, é `(1 − fator) × (distância − banda)`,
que é maior — e o teto de 12 pontos é alcançado em menos meses que os nove que a D25 C descreve.
As duas fórmulas têm asserção própria, e o fixture da tabela publicada foi movido para o regime que
ela de fato descreve.
