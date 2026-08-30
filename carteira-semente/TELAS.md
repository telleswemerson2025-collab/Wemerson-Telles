# PEÇA 4 — TELAS
Conferência. Versão 1.1 · 29/08/2026 — item 1 de 4 · D44 aplicada

| Item | Tela | Estado |
|---|---|---|
| **1** | **`aporte-do-mes.html`** — modulação e Reforço de Fundo | ✅ **feito** |
| 2 | registro de ciclo (D9 · D32) | a fazer |
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

## ✅ A D44 FECHOU O PADRÃO QUE ESTES ERROS FORMAVAM

### O checklist de toda tela nova
| | Item | Onde é conferido |
|---|---|---|
| 1 | `<meta charset="utf-8">` **antes do primeiro acento** | teste de redação |
| 2 | todo rótulo com número **gerado da constante** | teste de redação |
| 3 | a tela é **renderizada e olhada** antes de dada por pronta | Gate 2, item 9 |

### O teste de redação — `redacao.test.mjs`
Sete testes que ligam **texto** a **constante**, e que quebram quando os dois divergem:

- **28 trechos de documento** conferidos contra a constante que o sistema usa — o início do
  Abrigo, os quatro pontos da glidepath, a banda, o teto de defasagem, as sete travas, os tetos
  de concentração, o marco de virada, a validade do degrau, o limiar de liquidez.
- **A matriz do aporte** publicada, conferida contra `base × M`.
- **Os pesos renormalizados** do briefing, contra `PESOS` — e a soma 0,88 da camada 5 fora.
- **Os fatores de velocidade** da D25 B, escritos no documento 01.
- **O charset** das quatro telas, e a posição dele antes do primeiro acento.
- **Onze números** que já estiveram escritos à mão na tela, e o nome que passou a gerá-los.
- **Os rótulos das sete travas** que viajam do módulo para a tela.

**Provei que ele morde**, quebrando dois de propósito: trocar *"Começa a 4 anos"* por *3* no
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
