# 09 — RITUAL OPERACIONAL DA CARTEIRA SEMENTE
Versão 1.5 · 29/08/2026 — conciliado com as Decisões 1 a 18.
*Alterações em relação ao original do Mr. G estão listadas no fim do arquivo.*

Como o Mr. G aciona o sistema no dia a dia. Espelha o ritual da
VantageNode ("vim buscar o trabalho do dia"), com uma diferença de
fundo: na VantageNode o produto é o conteúdo publicado; aqui o
produto é a decisão de alocação, que exige registro gravado.

Três acionamentos. Dois por frase, um automático.

---

## 1. "Vim buscar a leitura do dia"

**Agente:** Torre de Controle
**Cadência:** diária, quando o Mr. G pedir
**Produz:** leitura, não decisão

### Fluxo

1. A Torre monta o comando pro Chrome com a varredura dos **catorze
   indicadores**, sempre os mesmos, sempre na mesma ordem.
2. O Chrome busca, em modo somente leitura: nunca publica, nunca
   altera, nunca apaga, restaura o estado da tela.
2b. **Na mesma ida, lê a composição publicada da CRM** e compara
   com a última lida (Decisão 16). É varredura separada dos
   catorze indicadores.
3. A Torre normaliza cada indicador contra a própria faixa
   histórica (log para série multiplicativa, linear para aditiva)
   e **amortece as séries de janela curta pelo fator de confiança**
   (`confiança = anos ÷ 5`, limitado a 1).
4. Aplica os pesos das camadas ativas, renormalizados sobre a soma
   das ativas. **Hoje a camada 5 (Carteira) está fora**, e os pesos
   são 38,6 · 29,5 · 18,2 · 13,6.

### Entrega

- **Índice Semente** de hoje, 0 a 100, com a faixa.
- **Estado da Linha d'Água**: Capitulação profunda · Prejuízo do
  mercado · Estresse de curto prazo · Mercado saudável.
- **Nota de divergência**, quando estado e intensidade apontam para
  lados diferentes. É nota, não disputa.
- **A confiança de cada série**, ao lado do valor.
- **O que mudou** desde a última leitura. Se nada mudou de faixa
  nem de estado, a resposta é uma linha só.
- **Composição da CRM**: incluídos, removidos, ou "nada mudou".
  Cada incluído já vem com o resultado do Filtro de Horizonte e o
  motivo registrado.
- **Ausências**, nomeadas uma a uma.
- **Etiqueta de julgamento**, se a camada 5 entrar: julgamento
  humano · data do degrau mais antigo · ativos sem degrau.
- **Degraus a vencer**: a partir dos 150 dias, diário para BTC e
  ETH, semanal para os demais.

### Regras

- Indicador que não voltou se reporta como ausente. Nunca se
  estima, nunca se repete o valor de ontem. É a invariante do
  default silencioso.
- Com indicador ausente o Índice é calculado só sobre as camadas
  que voltaram, com os pesos renormalizados, e a entrega diz
  quais camadas entraram.
- Se faltar a Linha d'Água, não há estado e não há projeção.
- Se a composição da CRM não puder ser lida, o universo elegível
  fica congelado no último estado conhecido, marcado como
  desatualizado desde tal data. Nunca se presume que não mudou.
- A Torre não classifica estação e não dispara decisão. Ela lê.

---

## 2. "Vim buscar o aporte do mês"

**Agente:** Alocador, com Auditor e Gate humano em sequência
**Cadência:** mensal, na data de aporte de cada carteira
**Produz:** **proposta**, com registro. A ordem é do Gui.

### Fluxo

1. Roda a leitura do dia primeiro. Sem leitura fresca não há aporte.
2. Cruza estado da Linha d'Água com anos restantes até os 18 de
   cada carteira. Sai o Índice de Plantio — `base × fator do Abrigo`
   (3 anos 0,66 · 2 anos 0,45 · 1 ano 0,25 · entrega 0,15).
3. **Depois** aplica a modulação pelo Índice Semente
   (`M = 1 + (50 − Índice)/50 × 0,20`). Com Abrigo ativo vale
   `M = min(M, 1,00)`: o teto do Abrigo prevalece.
4. Confere os tetos absolutos: nunca acima de 100% nem abaixo de 0%,
   e nunca no patamar de um estado vizinho.
5. Avalia o Reforço de Fundo contra as sete travas.
6. **Grava.** Sem registro gravado não há liberação de reforço.
7. **Passa pelo Auditor**, que confere os 18 itens do checklist e
   CARIMBA ou REPROVA.
8. **Vai ao Gate 2**, que o Gui assina ou veta. Só o "Aprovado
   DD/MM" dele libera execução.

### Entrega, por carteira

- Percentual do aporte do mês que vai para ativo.
- Estação: Plantio · Crescimento · Colheita · Abrigo.
- Abrigo ativo, sim ou não, e o fator vigente.
- Reforço de Fundo: liberado ou travado, com **todas** as travas que
  travaram, não só a primeira.
- A proposta de ordem: ordem limite, na zona. Nunca a mercado.

### Regras

- O aporte do mês é limitado a 100%. O Reforço de Fundo é fluxo
  separado, sai do caixa acumulado, nunca do aporte.
- Sem registro gravado do acionamento não há liberação de reforço.
- No máximo três acionamentos por ciclo. Ciclo fecha quando o
  Índice fecha em 65 ou mais por 30 dias corridos consecutivos —
  um único fechamento abaixo de 65 recomeça a contagem do zero.
- Em Abrigo não há reforço. Proteção vence convicção.
- Contador por carteira, nunca global.
- **O Alocador propõe. Não executa.** Nem o aporte, nem o reforço.

---

## 3. Alerta de virada

**Dispara sozinho.** O Mr. G não vai buscar.

Três gatilhos:

1. O Índice cruza 65, em qualquer direção.
2. A Linha d'Água muda de estado.
3. O contador de ciclo zera (marco de virada completado, ou
   entrada em Abrigo).
4. **A CRM inclui ou remove um ativo** — muda o universo elegível
   da Semente (Decisão 15). Inclusão manda o ativo para o Filtro de
   Horizonte; remoção corta o aporte novo a partir do mês seguinte,
   sem venda.

O alerta diz o que mudou, o valor antes e depois, e o que isso
libera ou trava. Não sugere ação.

*Os três gatilhos são os mesmos 65 e os mesmos estados que governam
a simulação (D10) e o ciclo do reforço (D9). Cruzar 65 muda, ao mesmo
tempo, a fase de partida do simulador e a contagem do ciclo.*

---

## Persistência

O Alocador é o primeiro agente do sistema com estado durável. Ele
não pode ser reconstruído a cada execução só a partir da leitura do
dia. Precisa gravar, por carteira:

- cada acionamento do Reforço de Fundo, com data e Índice;
- cada reset do contador, com data e o marco que o causou;
- a contagem corrente de dias consecutivos com Índice 65 ou mais;
- a série de leituras diárias, para a auditoria da contagem;
- **a série completa de degraus por ativo — valor, data e motivo
  escrito** (Decisões 16 a 18). **Nunca sobrescreve:** o histórico
  de mudança de tese é auditável para trás. Sem a data não se monta
  a etiqueta de julgamento, e sem etiqueta a leitura não é
  publicável;
- **a última composição da CRM lida**, com a data, para saber
  desde quando o universo está congelado se a leitura falhar.

Por isso a etapa 3 da ordem de construção começa pelo registro, não
pela lógica. Sem registro gravado o reforço não é liberado — logo o
registro é pré-requisito, não acessório.

---

## O que diferencia da VantageNode

| | VantageNode | Carteira Semente |
|---|---|---|
| Produto do dia | print e texto publicados | leitura, e uma vez por mês a proposta de aporte |
| Papel do Chrome | busca para o Mr. G publicar | busca para o Alocador propor |
| Memória | log de publicações | registro obrigatório, trava a decisão |
| Erro tolerável | trocar o indicador do dia | nenhum: sem dado, não decide |
| Quem assina | o Mr. G | o Gui, sempre |

---

## O QUE FOI ALTERADO NO ORIGINAL, E POR QUÊ
O ritual chegou depois das catorze decisões e contradizia quatro pontos já fechados. As correções
abaixo seguem a hierarquia do pacote: decisão registrada prevalece sobre documento derivado.

1. **"oito indicadores das cinco camadas" → "catorze indicadores"** e camada 5 declarada fora.
   A varredura da Torre são catorze indicadores fixos (`02-agentes.md`), e a camada 5 está fora da
   conta desde a Decisão 5. Não existe subconjunto de oito na especificação.

2. **A ordem de cálculo do aporte estava invertida.** O original aplicava a modulação (passo 3)
   antes do Abrigo (passo 4). A Decisão 4 determina o contrário: Abrigo primeiro, e o teto dele
   prevalece — com Abrigo ativo, `M = min(M, 1,00)`. Na ordem antiga, uma carteira a 2 anos da
   entrega com o Índice em 20 receberia modulação para cima antes de a proteção ser aplicada. O
   Abrigo também aparecia duas vezes: implícito no passo 2 (Índice de Plantio já é base × Abrigo) e
   de novo no passo 4. Ficou uma vez só, no lugar certo.

3. **O Auditor e o Gate humano não estavam no fluxo.** O original ia de "Grava" direto para "emite
   a ordem", e o cabeçalho dizia "Produz: ordem". Isso atropela a invariante 1 — *nenhum agente
   compra, vende, aporta ou publica; quem assina é o Gui* — e o limite do próprio Alocador,
   *PROPÕE, não executa*. O fluxo ganhou os passos 7 e 8, e o que o Alocador produz voltou a ser
   **proposta**.

4. **A normalização da Torre não citava o fator de confiança** (Decisão 7), e a entrega não trazia
   nem a nota de divergência (Decisão 2) nem a confiança por série. Foram acrescentados.

Menor, sem conflito: o Reforço travado passa a reportar **todas** as travas que falharam, não só
uma — o Auditor confere as sete uma a uma, e receber só a primeira obrigaria a rodar de novo.

## O QUE PRECISA DE DECISÃO SUA
1. **Ausência parcial dentro de uma camada.** A regra diz que o Índice é calculado "só sobre as
   camadas que voltaram". Não está definido o que acontece quando **um** indicador de uma camada
   falta e os outros voltam: a camada inteira sai da conta, ou a média é tirada sobre os presentes?
   As duas leituras dão números diferentes. Não inventei nenhuma.
2. **O ritual cobre três acionamentos.** Guardiões, Responsável pelos Posts e Laboratório ficaram
   de fora. Se é porque ainda não existem, tudo bem — mas os Guardiões são a etapa 2 da ordem de
   construção e não têm ritual de acionamento definido.
3. ~~Quem observa a CRM~~ — **fechado pela Decisão 16, parte B.** A Torre ganhou a varredura da
   composição, rodando junto com a leitura do dia, com congelamento rotulado quando a leitura falha.
