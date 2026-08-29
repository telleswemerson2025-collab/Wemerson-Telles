# PEÇA 1 — REGISTRO DO ALOCADOR
Conferência. Versão 1.0 · 29/08/2026

**Não é aprovação de código. É conferir se o que foi escrito é o que a decisão diz.**

- `registro.mjs` — o módulo. Sem dependências, roda em navegador e em Node.
- `registro.test.mjs` — 20 testes. `node --test` na raiz do repositório.

## O QUE ESTA PEÇA FAZ, E O QUE NÃO FAZ
**Faz:** grava os eventos duráveis e deriva deles o que é pura função do log —
contador de ciclo, dias consecutivos no marco, validade de degrau, congelamento
da composição da CRM, defasagem acumulada, etiqueta de julgamento.

**Não faz:** não calcula Índice Semente, não calcula alvo de glidepath, não
modula, não aloca. Isso é peça 2 e peça 3. O registro guarda e devolve; quem
decide vem depois.

## DE CADA DECISÃO PARA O CÓDIGO

| Decisão | O que ela manda | Onde está | Teste que prova |
|---|---|---|---|
| **D18 D** | série completa por ativo, **nunca sobrescreve** | só existe `registrar()`; sem update nem delete; evento `Object.freeze` | *"não existe update nem delete"* · *"evento gravado é congelado"* |
| **Invariante 3** | sem default silencioso | toda derivação devolve `{disponivel:false, motivo}` em vez de valor | *"sem leitura de hoje, a contagem é ausente"* · *"ilegível sem leitura anterior é ausência"* |
| **D9 · 1** | contador zera no dia do marco | `cicloReforco()` conta só o que veio depois do último reset | *"contador zera no reset"* |
| **D9 · 2** | enquanto o marco não se completa, o ciclo é o mesmo | sem reset gravado, `desde: null` e o contador nunca zera pelo tempo | *"contador zera no reset"* |
| **D9 · 4** | contador **por carteira**, nunca global | toda derivação recebe `carteira` e filtra por ela | *"o contador é por carteira"* |
| **D9 · 5** | sem registro gravado, o reforço não é liberado | `marcoPendenteDeRegistro()` **aponta**, não grava | *"o marco completo é apontado como pendente"* |
| **D9 (D21 A)** | 30 dias **corridos consecutivos**, janela fechada | um fechamento abaixo de 65 recomeça do zero | *""consecutivos" é literal"* |
| **D16 B** | ilegível congela e marca a data | `composicaoCRM()` devolve `congelada` e `desatualizadaDesde` | *"composição ilegível congela"* |
| **D16 D / D17** | escala ordinal 0 · 33 · 66 · 100 | `DEGRAUS_VALIDOS`, validado na entrada | *"degrau fora da escala ordinal é recusado"* |
| **D17 D** | etiqueta com as três informações | `etiquetaDeJulgamento()` | *"a etiqueta traz as três informações"* |
| **D18 A** | 180 dias; vencido vira **ausência** | `degraus()` devolve `status:'vencido'` e `valor:null` | *"degrau vence em 180 dias"* |
| **D18 A (efeito)** | a data do mais antigo em vigor não passa de 180 | vencido sai de "em vigor" antes da etiqueta | *"a data do mais antigo nunca passa de 180 dias"* |
| **D18 B** | aviso aos 150 · diário nas âncoras, semanal nos demais | `degrausAVencer()` | *"aviso aos 150 dias"* |
| **D18 C** | reatribuição é ato novo, com **motivo escrito** | motivo vazio é recusado na validação | *"degrau sem motivo escrito é recusado"* |
| **D21 B** | BTC ou ETH vencido **suspende** a camada 5 | `suspensaoDaCamada5()`, com ativo, razão e data | *"BTC ou ETH vencido suspende"* |
| **D21 B (extensão da D28)** | nunca atribuído tem o mesmo tratamento | mesma função, `razao:'nunca atribuído'` | *"BTC sem degrau nenhum também suspende"* |
| **D24 B** | tranche com data, ativo, quantidade, exposição antes e depois | validação exige os quatro | *"tranche exige exposição antes e depois"* |
| **D25 C** | a defasagem não se perde | `defasagemAcumulada()` soma e guarda a série com o fator | *"a defasagem soma e guarda o fator"* |

## TRÊS COISAS QUE APARECERAM AO ESCREVER

### 1. Dia sem leitura interrompe a contagem do marco — e isso não estava dito
A D9 diz "30 dias corridos consecutivos" e a D21 A fixou a janela como fechada.
Nenhuma das duas diz o que fazer com um **dia sem leitura nenhuma**.

Implementado como **interrompe**, pela invariante 3: não se pode presumir que o
dia ausente fechou acima de 65. A alternativa — ignorar o buraco e emendar os
dias vizinhos — presumiria exatamente isso.

Consequência prática: uma falha de coleta de um único dia custa a contagem
inteira e o marco recomeça. É conservador na direção certa (o ciclo demora mais
a fechar, e o contador do reforço demora mais a zerar), mas é rigoroso, e é
decisão sua confirmar.

### 2. O reset do marco não é gravado sozinho
A D9 regra 1 diz que o contador zera no 30º dia; a regra 5 diz que cada reset é
gravado. As duas juntas não dizem **quem grava**.

Implementado como: o registro **aponta** o marco pendente
(`marcoPendenteDeRegistro`) e não o cria. Registro que derivasse sozinho um
reset que a decisão manda gravar estaria inventando um evento — e o contador
passaria a zerar sem rastro. Fica para o Alocador (peça 3) gravar, ou para o
Gate.

### 3. Há registros duráveis exigidos pelas decisões que não estão entre os quatro
As quatro coisas da lista foram implementadas. Ao percorrer as decisões, achei
mais três que precisam ser duráveis e não têm lugar definido:

| Registro | Decisão | Coberto? |
|---|---|---|
| Escolha do Gate na vaga bloqueada: **manter** | D23 B | **sim** — a D24 D fez o "manter" valer como reatribuição de degrau, e degrau já é gravado |
| Escolha do Gate: **invalidar** | D23 B | **não** — leva a saída ordenada, e não é degrau |
| Resultado do Filtro de Horizonte, com o motivo | D16 B | **não** |
| Exclusão por **teto de contagem**, com o motivo | D22 C | **não** |

Não inventei tipo de evento para eles: a peça 1 foi definida como as quatro
coisas, e acrescentar por conta própria seria a mesma classe de erro que a regra
da classe âncora proíbe. Ficam para a sua decisão — cabem aqui, ou são peça 3.

## NENHUM PARÂMETRO NOVO NASCEU
Nada a submeter aos quatro critérios da classe âncora. Todos os números do
módulo vêm das decisões: 180 dias e o aviso aos 150 (D18), 65 e 30 dias (D9),
a escala 0·33·66·100 (D16 D), BTC e ETH como âncoras de tese (D21 B).

*Única escolha de fase, sem parâmetro novo:* o aviso semanal dos não-âncora cai
nos dias 150, 157, 164, 171 e 178 — ancorado no início da janela. A D18 B diz
"uma vez por semana" sem dizer em que dia da semana.
