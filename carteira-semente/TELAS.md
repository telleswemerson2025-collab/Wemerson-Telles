# PEÇA 4 — TELAS
Conferência. Versão 1.2 · 29/08/2026 — itens 1 e 2 de 4

| Item | Tela | Estado |
|---|---|---|
| **1** | **`aporte-do-mes.html`** — modulação e Reforço de Fundo | ✅ **feito** |
| **2** | **`registro-de-ciclo.html`** — marco, acionamentos e o log inteiro | ✅ **feito** |
| 3 | divergências do `indice-semente.html` | a fazer |
| 4 | divergências do `simulador.html`, com o motor mensal | a fazer |

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

## ✅ A D44 FECHOU O PADRÃO QUE ESTES ERROS FORMAVAM

### O checklist de toda tela nova
| | Item | Onde é conferido |
|---|---|---|
| 1 | `<meta charset="utf-8">` **antes do primeiro acento** | teste de redação |
| 2 | todo rótulo com número **gerado da constante** | teste de redação |
| 3 | a tela é **renderizada e olhada** antes de dada por pronta | Gate 2, item 9 |

### O teste de redação — `redacao.test.mjs`
Dez testes que ligam **texto** a **constante**, e que quebram quando os dois divergem:

- **28 trechos de documento** conferidos contra a constante que o sistema usa — o início do
  Abrigo, os quatro pontos da glidepath, a banda, o teto de defasagem, as sete travas, os tetos
  de concentração, o marco de virada, a validade do degrau, o limiar de liquidez.
- **A matriz do aporte** publicada, conferida contra `base × M`.
- **Os pesos renormalizados** do briefing, contra `PESOS` — e a soma 0,88 da camada 5 fora.
- **Os fatores de velocidade** da D25 B, escritos no documento 01.
- **O charset** das quatro telas, e a posição dele antes do primeiro acento.
- **Onze números** que já estiveram escritos à mão na tela, e o nome que passou a gerá-los.
- **Os rótulos das sete travas** que viajam do módulo para a tela.

**Provei que ele morde** — `provas.mjs`, **15 provas**, quebrando cada uma de propósito: trocar *"Começa a 4 anos"* por *3* no
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
