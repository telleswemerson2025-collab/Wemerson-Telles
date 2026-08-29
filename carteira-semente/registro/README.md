# PEÇA 1 — REGISTRO DO ALOCADOR
Conferência. Versão 1.1 · 29/08/2026 — Decisão 32 aplicada

**Não é aprovação de código. É conferir se o que foi escrito é o que a decisão diz.**

- `registro.mjs` — o módulo. Sem dependências, roda em navegador e em Node.
- `registro.test.mjs` — 31 testes. `node --test` na raiz do repositório.

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

## DUAS COISAS QUE APARECERAM AGORA

### 1. Leitura de dia que já tem leitura é recusada
A retroativa abre uma porta que não existia: gravar leitura para uma data
passada. Se essa data já tivesse leitura, a segunda seria **correção
disfarçada** de um número real — e o log deixaria de ser append-only na prática,
mesmo continuando append-only na forma.

Implementado como **recusa**, para leitura normal e retroativa igualmente. A
consequência é que um número errado gravado por engano não tem conserto dentro
desta peça. Se isso precisar existir, é evento próprio — uma retificação
explícita, que deixa as duas versões no log — e é decisão sua, não minha.

### 2. Sequência longa produz um marco só
Trinta fechamentos consecutivos completam o marco no 30º dia. Se a sequência
continuar até o 45º, **não nasce um segundo marco**: o ciclo é o intervalo entre
duas viradas, e a sequência precisaria romper e se formar de novo.

É a leitura natural da D9, e está testada — mas a decisão não diz isso com essas
palavras, e a alternativa (um marco a cada 30 dias de sequência) zeraria o
contador do reforço repetidamente num bull longo.

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
