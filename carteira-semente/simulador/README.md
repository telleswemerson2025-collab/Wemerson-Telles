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

## A MODULAÇÃO ESTÁ APLICADA, E A REFERÊNCIA NÃO A SEGUE

`exposicaoModulada()` alimenta a projeção publicada desde a D53 A — a D51 B, que a mantinha fora,
está revogada. `efeitoDaModulacao()` mostra quanto ela move, em cada partida, **com o sinal que
tiver**: hoje é −3,2% no conservador e +0,1% no forte, e por isso nenhum rótulo fixo serve.

**`motorDaV13` é o ponto mais fácil de errar deste arquivo.** A referência da tabela de deriva é *a
v1.3*, não "o mapeamento da v1.3 rodado pelo motor de hoje". Enquanto o motor não mudava, os dois
davam no mesmo. Com a regra de exposição trocada, deixar a referência seguir o motor faria os dois
lados se moverem juntos e a deriva mediria **zero por construção** — a trava da D13 ficaria cega
justamente para a revisão que ela existe para pegar. Ela fica congelada no alvo do ano, que é o que
produziu os R$ 67.725 publicados, e há asserção disso nas quinze células.

## O MÊS MIRA O FECHAMENTO

`demandaDaGlidepath` mira `alvo(mesesAteEntrega − 1)` (D53 C). Mirando a abertura, todo mês ficava
um passo atrasado e nenhum mês jamais mirava o marco da entrega — a carteira parava em 15,83% com o
marco publicado em 15,00%. Não foi preciso acrescentar mês ao laço: bastou corrigir a mira. As cinco
partidas entregam a **15,0000%**.

## O QUE ESTE MÓDULO NÃO FAZ

- Não classifica estado. Quem classifica é a Linha d'Água, e só ela (D2).
- Não escolhe partida quando falta leitura. `partidaDaLeitura()` **recusa e nomeia o que faltou**;
  não devolve partida junto com a recusa, e não guarda última leitura conhecida.
- Não decide aporte. A matriz do Índice de Plantio que a tela desenha vem do Alocador.
- Não executa nada. Invariante 1.


## AS DUAS TRAVAS, E POR QUE SÃO DUAS

| | Mede | Base | Limite |
|---|---|---|---|
| **deriva** (D13) | afastamento acumulado | v1.3, congelada | 15% por célula |
| **salto** (D54) | degrau de uma rodada | versão anterior | 5% na capa · 10% nas demais |

Elas **não pegam as mesmas células**. Capitulação profunda está retida pela deriva nos três cenários
(+17,7% a +48,5%) e passa folgada no salto (+1,8% a +9,1%); Saudável · Índice ≥ 65 é o inverso
exato. Há asserção de que exista célula pega só por uma e célula pega só pela outra — se isso deixar
de valer, a razão escrita na D54 A precisa ser refeita.

E a de salto aciona por **queda**, que a de deriva não consegue: voltar à origem é o que zera o
acumulado dela. A v1.5 marcou +0,0% de deriva com a capa caindo 16,7%.

`historico-publicado.mjs` é **registro, não cálculo** — a versão anterior não sai do motor de hoje,
porque o motor mudou. Append-only, com a mesma regra do Registro. De v1.3 a v1.9 só há a capa; as
quinze células começam na v1.10, e salto por célula não é calculável para trás. **"Não calculável"
nunca vira zero.**
