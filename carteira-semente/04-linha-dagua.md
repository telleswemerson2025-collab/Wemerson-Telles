# LINHA D'ÁGUA — o instrumento de origem da leitura
Versão 1.6 · 29/08/2026 — Decisões 2, 4 a 11 aplicadas.

## AUTORIDADE
A Linha d'Água é a **autoridade única sobre o estado do mercado**. A classificação é objetiva —
posição do preço contra os três custos de referência — e nada a sobrepõe. Nenhum outro
instrumento, o Índice Semente incluído, reclassifica, promove ou rebaixa estado.

O Índice Semente mede a **intensidade dentro do estado** que a Linha d'Água já definiu, e modula o
aporte em no máximo ±20% sobre a base do estado — sem nunca alcançar o patamar de um estado
vizinho. Quando os dois parecem discordar, não há empate: o estado é o da Linha d'Água, e a
divergência vira nota na saída diária da Torre.

## LINHA D'ÁGUA DO MERCADO (classificador de estado)
Indicador proprietário já existente (arquivo Waterline). Plota o **preço do BTC** contra três
custos de referência e classifica o mercado em quatro estados fixos.

| Estado | Condição | Estação disparada (com o Abrigo) |
|---|---|---|
| Capitulação profunda | preço abaixo do custo de quem segura há anos (LTH) | Plantio · aporte integral · **habilita o Reforço de Fundo** |
| Prejuízo do mercado | preço abaixo do custo médio da rede (Realized Price) | Plantio · aporte integral · **habilita o Reforço de Fundo** |
| Estresse de curto prazo | preço acima da rede, abaixo do custo dos recém-chegados (STH) | Crescimento · aporte parcial |
| Mercado saudável | preço acima dos três | Colheita · caixa começa a crescer |

A estação não sai do estado sozinho: sai do **cruzamento do estado com o tempo restante até a
entrega** — o Índice de Plantio, em `02-agentes.md`.

**Leitura de 28/08/2026:** preço US$ 77.839,19 · rede US$ 53.057,77 · STH US$ 69.977,18 ·
LTH US$ 49.449,51 → preço acima dos três → **Mercado saudável**.
Índice Semente do mesmo dia: 47,78 (Equilíbrio). Nota: estado saudável, intensidade em equilíbrio.
Modulação resultante: M = 1,00889 — praticamente nula, como se espera em equilíbrio.
Reforço de Fundo bloqueado: exige Capitulação ou Prejuízo, e o estado de hoje é Mercado saudável.

## A LINHA D'ÁGUA TAMBÉM ABRE O SIMULADOR (Decisão 8)
A fase de partida da simulação é lida daqui, no dia em que a simulação é aberta:

| Estado | Condição | Fase | Mês de entrada |
|---|---|---|---|
| Capitulação profunda | — | 0 · queda | 9 |
| Prejuízo do mercado | — | 0 · queda | 3 |
| Estresse de curto prazo | — | 1 · recuperação | 0 |
| Mercado saudável | Índice < 65 | 2 · alta | 0 |
| Mercado saudável | Índice ≥ 65 | 3 · correção | 0 |

O mapeamento devolve um **par** (fase, mês), não só a fase (Decisão 11): Capitulação e Prejuízo são
momentos diferentes da mesma queda e entram em pontos diferentes dela.

O desdobramento de Mercado saudável (Decisão 10) é o único ponto em que o Índice entra no
mapeamento, e mesmo aí ele **não classifica estado**: o estado continua sendo Mercado saudável nos
dois casos. O Índice só diz em que altura do estado se está.

**Sem leitura disponível, o simulador não assume fase** — exibe indisponível e não projeta.
Isso faz da Linha d'Água uma dependência dura do simulador, não só do Alocador.

## LINHA D'ÁGUA DA SEMENTE (o mesmo conceito, do lado do pai)
Plota o **valor da carteira** contra:
- **a linha d'água** = tudo o que já foi aportado (abaixo dela, a carteira está submersa)
- **o piso protegido** = a parte que o Abrigo já travou e não corre mais risco

Leitura: acima da linha d'água, a carteira está à frente do que saiu do bolso. Abaixo, submersa —
e é aí que o aporte do mês compra mais barato.

Fórmula do piso: `piso = aportado + (valor − aportado) × (1 − exposição)`,
onde a exposição vem da glidepath do Abrigo.
