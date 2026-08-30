# PEÇA 1 — REGISTRO DO ALOCADOR
Conferência. Versão 1.3 · 29/08/2026 — Decisões 32, 33 e 34 aplicadas

**Não é aprovação de código. É conferir se o que foi escrito é o que a decisão diz.**

- `registro.mjs` — o módulo. Sem dependências, roda em navegador e em Node.
- `registro.test.mjs` — 49 testes. `node --test` na raiz do repositório.

**A peça 1 são sete registros** (Decisão 32 C), não quatro: ciclo do Reforço ·
composição da CRM · degraus · tranches e defasagem · invalidação do Gate ·
resultado do Filtro de Horizonte · exclusão por teto de contagem.

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
| **D32 A** | leitura retroativa recompõe o dia faltante | campo `retroativa` + `coletadaEm`, janela de 30 dias | *"a contagem se recompõe sozinha"* · *"fora da janela é recusada"* |
| **D32 B** | o registro grava o reset no 30º fechamento | `#gravarMarcoSeCompletou()`, disparado ao gravar leitura | *"o marco completo é gravado pelo registro"* · *"retroativa que completa um marco"* |
| **D23 B** | "invalidar" do Gate, com data e motivo | tipo `gate_invalidar`, motivo obrigatório | *"invalidação do Gate exige motivo"* |
| **D16 B** | resultado do Filtro, com o motivo | tipo `filtro_horizonte`, veredito + motivo obrigatórios | *"os dois motivos são tipos distintos"* |
| **D22 C** | exclusão por contagem, distinguível do filtro | tipo `teto_contagem` **separado**; `situacaoDoAtivo()` devolve `voltaSozinho` | *"reprovado no filtro não volta sozinho; excluído por contagem volta"* |
| **D33 A** | leitura para data que já tem leitura é recusada | checagem em `registrar()`, apontando a retificação como caminho | *"leitura de dia que já tem leitura é recusada"* |
| **D33 B** | retificação é evento próprio, com quatro obrigatórios e Gate | tipo `retificacao`; validação exige data retificada, valor antigo, valor novo, motivo e `aprovadoEm` | *"exige os quatro obrigatórios"* · *"sem o Gate é recusada"* |
| **D33 B** | as duas versões permanecem para sempre | `historicoDaLeitura()` devolve original, retificações e vigente | *"as duas versões permanecem no log"* |
| **D33 C** | as derivações leem a vigente | `#leiturasVigentes()`; contagem, marco e sequência leem dela | *"as derivações leem a versão vigente"* |
| **D33 D** | retificação não apaga marco | `#anularMarcosDesfeitos()` cria `anulacao_marco` apontando marco e retificação | *"gera anulação, e o marco não some"* |
| **D33 E** | um marco por sequência | `#gravarMarcoSeCompletou()` grava uma vez por sequência | *"sequência de 200 dias produz o mesmo marco"* · *"rompida e reformada, produz um segundo"* |
| **D34 A** | o valor antigo bate com o **vigente**, não com o original | checagem em `registrar()`, por campo | *"a cadeia vale campo a campo"* |
| **D34 B** | a retificação cobre a leitura inteira | campo `campo` obrigatório, com caminho pontuado; `leCampo`/`comCampo` | *"o estado é retificável"* · *"indicador individual é retificável"* |
| **D34 B** | uma retificação por campo, nunca várias de uma vez | o evento nomeia um campo só; `historicoDaLeitura().porCampo` separa a cadeia | *"o histórico separa as retificações por campo"* |
| **D34 C** | anulação vale para o que deriva | `#anularDerivacoesDesfeitas()`, varredura genérica | *"retificar o estado não anula marco"* |

## O QUE A DECISÃO 32 RESOLVEU
As três coisas levantadas na conferência da v1.0 foram decididas e aplicadas:

1. **Dia sem leitura** — continua interrompendo, mas agora é **recuperável**. A
   leitura retroativa se grava com a data original, marcada, com a data de
   coleta, dentro de 30 dias. A contagem se recompõe sozinha porque é função pura
   do log. Uma falha de coleta custa o trabalho de recuperar o dia, não a
   contagem inteira — e nada é presumido, porque o número gravado é o número real
   daquele dia.
2. **Quem grava o reset** — o registro grava, no 30º fechamento consecutivo, com
   o intervalo que o produziu no rastro. `marcoPendenteDeRegistro()` saiu.
3. **Os três registros** entraram, e o filtro e o teto de contagem são **tipos
   distintos**, nunca um só com motivo livre.

## O QUE A DECISÃO 33 RESOLVEU
As duas coisas levantadas na conferência da v1.1 foram decididas e aplicadas.
A retificação existe, com Gate, e o marco único virou texto com a razão junto.

**A cadeia da retificação ficou com quatro elos, e todos estão testados:**
1. a retificação **acrescenta** e aponta para a original — nada é sobrescrito;
2. a versão **vigente** passa a ser a retificada, e as derivações se recompõem
   sozinhas, como a retroativa já havia mostrado;
3. se isso **desfaz um marco**, nasce a anulação apontando para os dois, e o
   marco permanece no log;
4. se a sequência **volta a valer** por uma retificação posterior, nasce um marco
   novo — e o anulado continua onde estava.

## O QUE A DECISÃO 34 RESOLVEU
As duas coisas levantadas na conferência da v1.2 foram decididas e aplicadas.

**A restrição da cadeia virou regra** (D34 A) — deixou de ser acréscimo do
implementador e passou a ser como a D33 B se lê.

**A retificação cobre a leitura inteira** (D34 B). O campo é nomeado por caminho
pontuado: `indice`, `estado`, `indicadores.MVRV`. A leitura passou a aceitar um
objeto `indicadores` opcional, para que a varredura da Torre caiba nela quando a
peça 2 chegar.

**A cadeia é campo a campo, e isso importa mais do que parece:** retificado o
índice, uma segunda retificação do índice partindo do valor original é recusada —
mas o estado, que não foi tocado, continua retificável a partir do valor
original. Um campo não trava o outro, e cada cadeia é legível sozinha.

## O QUE A PARTE C AINDA NÃO TEM O QUE ANULAR
A mecânica de anulação foi generalizada e a função mudou de nome
(`#anularDerivacoesDesfeitas`). Mas, **na peça 1, nenhuma derivação gravada
depende do estado da Linha d'Água** — a única é o marco de virada, e ele depende
só do índice. Está testado que retificar o estado não anula marco nenhum, porque
não deveria mesmo.

A parte C só passa a ter efeito quando a **peça 3** gravar derivações que leem o
estado — o fator de modulação da glidepath (D25 B) é a primeira delas. A mecânica
já está pronta para recebê-las; a lista é que é curta hoje.

Registro isto para que a ausência de anulações numa retificação de estado seja
lida como correto, e não como esquecimento.

## O QUE NÃO MUDOU

### O aviso semanal (D32 D)
Confirmados os dias 150, 157, 164, 171 e 178, ancorados no início da janela.

### O que a peça faz e não faz
Segue igual: grava, e deriva do que está gravado. Não calcula Índice Semente,
alvo de glidepath, modulação nem alocação — isso é peça 2 e peça 3.

### Nenhum parâmetro novo nasceu
A janela de recuperação de 30 dias vem da D32 A; os demais números vêm das
decisões anteriores. Nada a submeter aos quatro critérios da classe âncora.

---

*As três questões levantadas na conferência da v1.0 — dia sem leitura, quem grava
o reset, e os registros fora das quatro coisas — foram todas decididas pela
Decisão 32 e estão resolvidas acima. O histórico completo delas está em
`../08-decisoes-29-08-2026.md`.*


---

## POR QUE APPEND-ONLY — O CASO QUE A TELA DO CICLO MOSTROU
A tela do item 2 da peça 4 rodou o histórico de exemplo e produziu a melhor demonstração que o
sistema deu de si mesmo até aqui.

**A sequência.** Um fundo de ciclo com dois acionamentos do Reforço. Depois, trinta fechamentos em
65 ou mais completam o marco de virada, e o registro grava o reset sozinho — o contador zera, e os
dois acionamentos ficam para trás, gastos.

**A retificação.** Meses depois, uma tooltip é relida: o dia 15/03 fechou em **61,5**, e a leitura
tinha registrado **71,2** — o valor do dia anterior. Uma retificação entra no log.

**O que acontece sozinho:** aquele dia era um dos trinta. A sequência se rompe, o marco cai, e a
`anulacao_marco` entra apontando para os dois — o marco desfeito e a retificação que o desfez. O
ciclo **volta a ser o primeiro**, e os **dois acionamentos voltam para a contagem**.

> **Um reforço que parecia gasto volta a estar disponível, porque a leitura que fechava o ciclo
> estava errada.**

**Sistema que sobrescreve nunca devolveria.** Se a leitura de 15/03 tivesse sido corrigida por cima,
o log diria 61,5 desde sempre, o marco continuaria gravado como se a sequência tivesse existido, e o
contador continuaria em três. A carteira perderia dois acionamentos de Reforço — no fundo de ciclo,
que é o único momento em que eles importam — **e ninguém saberia**, porque não haveria o que comparar.

O append-only não guarda o passado por respeito ao passado. Guarda porque **o passado ainda pode
mudar de significado**, e só quem manteve os eventos consegue recalcular o que eles implicavam.

*O reset gravado, a anulação e a retificação continuam todos no log, lado a lado. O marco anulado
aparece riscado na tela, e não some: quem ler daqui a dez anos vê que ele existiu e por que deixou
de valer.*
