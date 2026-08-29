# ÍNDICE SEMENTE — indicador composto
Régua única de 0 a 100 que reúne as cinco camadas de leitura.
Versão 1.1 · 29/08/2026 — Decisões 1 e 2 aplicadas.

## O QUE ELE É, E O QUE ELE NÃO É
O Índice Semente **mede a intensidade** da situação de mercado. Ele **não classifica o estado**.

Quem classifica o estado é a Linha d'Água, por regra objetiva de posição do preço contra os três
custos de referência. O Índice não reclassifica, não promove nem rebaixa estado, e nunca dispara
decisão sozinho. Ele modula o tamanho do aporte **dentro da faixa que o estado já definiu**.

> Estado é da Linha d'Água. Intensidade é do Índice. Estação é do Índice de Plantio
> (estado × tempo restante). Ver a hierarquia completa em `00-BRIEFING-CODE.md`.

## PESOS
| Camada | Peso | O que entra |
|---|---|---|
| 1 · Estado do preço | 34% | preço ÷ Realized Price, normalizado em log pela faixa histórica do MVRV |
| 2 · Comportamento | 26% | SOPR · Supply in Profit · Liveliness (média de **três**) |
| 3 · Macro | 16% | DXY* · Fed Funds* · M2 · Curva 10Y-2Y (média) |
| 4 · Fluxo | 12% | ETF Net Inflow · Funding Rate (média) |
| 5 · Carteira | 12% | pesos · caixa · distância do stop · anos restantes |

\* DXY e Fed Funds entram **invertidos**: dólar forte e juro alto tiram ar do risco.
\* A camada 5 fica fixa em 50 até existir carteira ativa para medir. Enquanto isso, 12% do índice
é peso morto ancorado no meio da régua — o índice é estruturalmente puxado para 50.

### ⚠️ O MVRV NÃO ENTRA DUAS VEZES (Decisão 1, 29/08/2026)
A razão preço ÷ Realized Price **é** o MVRV. Ela é a régua da camada 1 e **não** entra também na
média da camada 2. Na versão 1.0 entrava nos dois lugares, e o MVRV pesava sozinho ~40,5% do
índice (34% direto + 6,5% via média de quatro itens da camada 2). A camada 2 agora tem três itens.

## NORMALIZAÇÃO
Cada leitura vira posição de 0 a 100 dentro da **própria faixa histórica** do terminal
(0 = mínima da série, 100 = máxima).
- Séries de escala multiplicativa (preço, MVRV, SOPR, Realized Price): normalização **logarítmica**.
- Séries de escala aditiva (percentuais, taxas, fluxo): normalização **linear**.

## AS FAIXAS — INTENSIDADE, NÃO DECISÃO
As faixas descrevem o quão esticada está a situação. **Nenhuma delas dispara aporte.**
Os nomes deixaram de reutilizar o vocabulário de estado da Linha d'Água justamente para que os
dois instrumentos não sejam confundidos.

| Índice | Faixa | O que significa |
|---|---|---|
| 0–20 | Fundo | Intensidade no extremo comprimido da faixa histórica |
| 20–40 | Comprimido | Abaixo do meio da régua |
| 40–60 | Equilíbrio | Nem comprimido nem esticado |
| 60–80 | Esticado | Acima do meio da régua |
| 80–100 | Extremo | Intensidade no extremo esticado da faixa histórica |

## LEITURA DE 29/08/2026 (dado real, confirmado por tooltip)
**Estado (Linha d'Água): Mercado saudável** — preço acima dos três custos de referência.
**Índice Semente = 50,8 · faixa Equilíbrio.**
**Nota de divergência:** estado saudável, mas intensidade apenas em equilíbrio. O estado manda;
a intensidade qualifica. Não há disputa a resolver.

| Camada | Posição | Composição |
|---|---|---|
| 1 · Estado do preço | 44,4 | preço ÷ Realized Price = 1,467 |
| 2 · Comportamento | 60,3 | SOPR 32,8 · Supply in Profit 49,4 · Liveliness 98,6 |
| 3 · Macro | 50,9 | DXY 36,3 · Fed Funds 32,2 · M2 100,0 · Curva 35,0 |
| 4 · Fluxo | 49,1 | ETF 55,0 · Funding 43,3 |
| 5 · Carteira | 50,0 | fixo, sem carteira ativa |

Conta: `0,34×44,4 + 0,26×60,3 + 0,16×50,9 + 0,12×49,1 + 0,12×50,0 = 50,8`

**O valor 50 publicado na versão 1.0 fica invalidado** — foi calculado com a dupla contagem do
MVRV. A correção sobe o índice em 1,05 ponto e **não muda a faixa**: continua Equilíbrio.

*Nota de fonte:* a camada 1 usa a razão calculada a partir de duas leituras do terminal
(77.839,19 ÷ 53.057,77 = 1,46706). O MVRV lido diretamente no terminal é 1,465 e dá posição 44,36
contra 44,41 — diferença de 0,05 ponto, sem efeito no índice arredondado.

### O que salta na leitura individual
- **Liveliness em 98,6** da própria faixa histórica — praticamente na máxima. Moeda velha se
  movendo: distribuição. É o número mais gritante da tela, e com a camada 2 reduzida a três itens
  ele pesa mais do que pesava.
- **SOPR em 32,8** — quem vende não está com lucro gordo.
- **Camada 1 em 44,4** — o mercado não está caro em relação ao custo da rede.
- **US M2 em 100** — mas é máxima de série mensal, chapada desde 01/jul/2026. Não é notícia nova.
- **DXY em 36,3 e Fed Funds em 32,2** (já invertidos) — o macro não está ajudando.

### Tensão editorial detectada
**Realized Price · LTH está a 1,08% da máxima histórica** (US$ 49.449,51 contra US$ 49.991,21 de
26/07/2026) **enquanto o preço está 37,4% abaixo do topo** (US$ 77.839,19 contra US$ 124.353,95 de
06/out/2025). Base de custo do holder longo subindo num mercado que caiu: gente comprando devagar
para segurar. Cruzado com a Liveliness quase na máxima, as duas leituras aparentemente se
contradizem — e contradição é o coração de uma boa thread.

## PENDÊNCIA ABERTA
A Decisão 2 estabelece que o Índice **modula o tamanho do aporte dentro da faixa do estado**, mas
**a fórmula da modulação ainda não existe**. Hoje o Índice de Plantio (`02-agentes.md`) é
determinístico: base do estado × fator do Abrigo. Falta definir quanto o Índice move esse número
dentro da faixa, e qual o teto e o piso desse movimento. Enquanto não estiver definido, o Alocador
opera só com base × Abrigo, e o Índice entra como nota informativa. Não inventar a fórmula.
