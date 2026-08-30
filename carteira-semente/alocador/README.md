# PEÇA 3 — ALOCADOR
Conferência. Versão 1.0 · 29/08/2026 — decisão → código → teste que prova

**30 testes.** Rodar da raiz do repo: `node --test carteira-semente/alocador/alocador.test.mjs`

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

## 🔴 UMA DIVERGÊNCIA DE ESPECIFICAÇÃO — LEVANTADA, NÃO RESOLVIDA
**Quando a glidepath começa: 4 anos ou 3?**

| Fonte | Diz |
|---|---|
| **D25 A**, tabela de passos | trecho **"4 → 3 anos · 2,83 pts"** — a rampa começa a **4 anos** |
| **doc 01 §7** | *"Começa a 3 anos da entrega"* · *"+3 anos: carteira cheia"* |
| **doc 02** | Abrigo ativo = *"3 anos ou menos até a entrega"* |

**Implementei em 4 anos, porque é o único valor aritmeticamente possível.** Começar a
3 exigiria ir de 100% a 66% em **zero mês** — um degrau de **34 pontos** no dia em que
a carteira cruza os 3 anos. O próprio doc 01 §7 proíbe isso em texto:

> *"É progressivo, não de uma vez — desligar o risco num único dia transforma a data
> num sorteio."*

### O que isso deixa aberto
O trecho de **4 a 3 anos move 34 pontos — o maior da glidepath inteira**, maior que os
21 do trecho seguinte, os 20 do outro e os 10 do último. E ele acontece **inteiro**
numa janela em que o Abrigo ainda não está "ativo". Nessa janela:

- o teto `M_efetivo = min(M,1)` **não vale** — o Índice pode elevar o aporte;
- a **trava 3 do Reforço** não bloqueia — o caixa pode ser drenado para o mercado;
- a ordem **caixa → aporte → venda** não está aberta — a D27 a abre *"quando o Abrigo
  começa"*, então a glidepath vende em vez de consumir o caixa.

Os três últimos pontos são a mesma coisa vista de três lados: **o caixa é
simultaneamente o amortecedor da glidepath e a munição do Reforço, e não há regra de
precedência entre os dois** — porque a D27 foi escrita para a janela em que a trava 3
já bloqueava o Reforço.

**Não escolhi.** `divergenciaDoInicioDaGlidepath()` viaja em **toda proposta**, e há
teste de que ela viaja. Três saídas possíveis, e a escolha é do Gui:
1. mover o início do Abrigo para 4 anos (alinha as três regras à D25 A);
2. mover a rampa para 3→0 anos e reescrever os quatro passos;
3. manter os 4 anos e escrever a regra de precedência do caixa na janela.

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
