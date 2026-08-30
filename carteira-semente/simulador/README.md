# MOTOR DO SIMULADOR — peça 4, item 4
*v1.0 · fecha as cinco divergências do `simulador.html` listadas no briefing*

O simulador **projeta mecanismo**. Não promete retorno, não prevê preço, e nada do que sai daqui é
recomendação. É a mesma regra dos outros três: a tela não calcula, ela pergunta.

## O QUE MUDOU DE VERDADE: O LAÇO

O motor era **anual** — iterava ano a ano e aplicava uma fase por ano civil. Com o mês de entrada
da Decisão 11 a fase muda no meio do ano, e um laço anual não consegue representar isso. O laço
passou a ser mensal, com **duas indexações diferentes no mesmo laço**:

```
para t de 0 até (anos × 12 − 1):
    exp = EXPO[anos restantes]                       ← o Abrigo anda por ANO   (D11 regra 3)
    f   = ((fase × 12 + mês + t) ÷ 12) mod 4         ← a fase anda por MÊS     (D11)
    m   = (1 + padrão[f] × exp)^(1/12) − 1
    saldo = (saldo + aporte) × (1 + m)
```

**O critério de aceite da regra 4 foi rodado DEPOIS da troca, não só antes:** com mês de entrada 0,
a expressão de `f` colapsa em `(fase + ano) mod 4`, que é o motor anual. Nas doze combinações de
fase e cenário a diferença é **exatamente zero** — `criterioDeAceiteD11()` roda isso, e o teste
compara com `assert.equal`, não com tolerância. O motor anual continua no arquivo por um motivo
só: ser o réu dessa comparação. Ele não alimenta tela nenhuma.

`faseDoMes()` existe como função própria e não inline. É o coração da troca do laço, e ponto de uso
único é o que permite mirar a mutação nele (D47 A) — duplicado, a prova deixaria um gêmeo de pé.
Isso não é teoria: a prova nasceu reprovando por **mira ambígua**, com a expressão em dois lugares.

## AS CINCO PARTIDAS, E POR QUE A REFERÊNCIA É RODADA

`PARTIDAS` carrega, por estado, o par (fase, mês de entrada) da D11 — e mais um campo:
`faseNaV13`, a fase que a mesma leitura teria recebido na v1.3.

Ele existe por uma razão só: a tabela de deriva da D12 B / D13 é medida contra a v1.3, e medir
contra número transcrito à mão seria **carimbar**, não conferir (D48). Rodando as duas pelo mesmo
motor, a deriva é medida. O teste exige que onde a partida não mudou a deriva seja exatamente zero,
e que onde mudou ela **não** seja zero — as duas metades, senão a asserção passaria por vazio.

## O QUE A LEITURA DE TRÁS PARA A FRENTE RESOLVEU

A modulação de velocidade da D25 B é indexada ao **estado**, e o simulador anda por **fase**. A
fase 0 tem dois estados (Capitulação e Prejuízo), então a volta não é imediata.

Ela é imediata, sim — está na própria tabela da D11. Prejuízo entra na fase 0 no mês 3, com nove
meses pela frente; Capitulação entra no mês 9, com três. Logo, **dentro da fase 0 os primeiros meses
são Prejuízo e os últimos são Capitulação**. Não é mapa novo: é o que os meses de entrada afirmam.

Sem a D11 a fase 0 seria ambígua e a modulação de velocidade não teria estado para ler. A decisão
que existia para separar duas projeções acabou sendo a que tornou a modulação implementável.

O mesmo caminho tirou o `NOME` escrito à mão da tela antiga, que mandava a fase 3 para *Plantio*.
A fase 3 é entrada de **Mercado saudável** (D10), e Mercado saudável é **Colheita** (doc 01). A
estação passou a sair do estado, nunca da fase.

## O QUE ESTÁ MEDIDO E NÃO APLICADO

`custoDaModulacaoNaProjecao()` mede o que a modulação da D25 custaria **se a projeção passasse a
usar a exposição real em vez do alvo do ano**. Na partida de hoje: +4,5% no conservador, +11,4% no
moderado, +17,1% no forte.

Não está aplicado, e o motivo está dito na tela: as quinze células publicadas — e a própria
referência v1.3 — foram todas calculadas com o alvo do ano. Trocar a base moveria as quinze de uma
vez, e a D13 regra 2 mandaria a revisão inteira para o Gui. **A troca é decisão dele, não do
implementador** (invariante 9). Enquanto não houver decisão, a tela mostra a diferença e diz que
ela não está aplicada.

## O QUE ESTE MÓDULO NÃO FAZ

- Não classifica estado. Quem classifica é a Linha d'Água, e só ela (D2).
- Não escolhe partida quando falta leitura. `partidaDaLeitura()` **recusa e nomeia o que faltou**;
  não devolve partida junto com a recusa, e não guarda última leitura conhecida.
- Não decide aporte. A matriz do Índice de Plantio que a tela desenha vem do Alocador.
- Não executa nada. Invariante 1.
