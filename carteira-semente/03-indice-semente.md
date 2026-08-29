# ÍNDICE SEMENTE — indicador composto
Régua única de 0 a 100 que reúne as camadas de leitura.
Versão 1.2 · 29/08/2026 — Decisões 1, 2, 4 e 5 aplicadas.

## O QUE ELE É, E O QUE ELE NÃO É
O Índice Semente **mede a intensidade** da situação de mercado. Ele **não classifica o estado**.

Quem classifica o estado é a Linha d'Água, por regra objetiva de posição do preço contra os três
custos de referência. O Índice não reclassifica, não promove nem rebaixa estado, e nunca dispara
decisão sozinho. Ele **modula o tamanho do aporte dentro da faixa que o estado já definiu**, pela
fórmula da Decisão 4 (em `02-agentes.md`, seção Alocador).

> Estado é da Linha d'Água. Intensidade é do Índice. Estação é do Índice de Plantio
> (estado × tempo restante). Ver a hierarquia completa em `00-BRIEFING-CODE.md`.

## PESOS
A camada 5 (Carteira) **está fora da conta** enquanto não existir carteira ativa para medir. Os
quatro pesos restantes são renormalizados proporcionalmente (base 88).

| Camada | Peso hoje | Peso com carteira ativa | O que entra |
|---|---|---|---|
| 1 · Estado do preço | **38,6%** | 34% | preço ÷ Realized Price, normalizado em log pela faixa histórica do MVRV |
| 2 · Comportamento | **29,5%** | 26% | SOPR · Supply in Profit · Liveliness (média de **três**) |
| 3 · Macro | **18,2%** | 16% | DXY* · Fed Funds* · M2 · Curva 10Y-2Y (média) |
| 4 · Fluxo | **13,6%** | 12% | ETF Net Inflow · Funding Rate (média) |
| 5 · Carteira | **fora** | 12% | pesos · caixa · distância do stop · anos restantes |

\* DXY e Fed Funds entram **invertidos**: dólar forte e juro alto tiram ar do risco.

### ⚠️ A CAMADA 5 FICA FORA, NÃO VALE 50 (Decisão 5, 29/08/2026)
Na versão 1.1 a camada 5 entrava com 12% travados em 50. Isso não é neutro: é peso morto que puxa
o índice para o centro por construção e contamina a leitura. Enquanto não houver carteira, ela sai
da conta e os quatro pesos são renormalizados (34/88 · 26/88 · 16/88 · 12/88).

**Quando a carteira existir**, a camada 5 volta com 12% e os demais retomam 34 · 26 · 16 · 12.
**Na tela, a camada tem que aparecer marcada como FORA** — não desenhada como se valesse 50.

### ⚠️ O MVRV NÃO ENTRA DUAS VEZES (Decisão 1, 29/08/2026)
A razão preço ÷ Realized Price **é** o MVRV. Ela é a régua da camada 1 e **não** entra também na
média da camada 2. Na versão 1.0 entrava nos dois lugares, e o MVRV pesava sozinho ~40,5% do
índice. A camada 2 tem três itens.

## NORMALIZAÇÃO
Cada leitura vira posição de 0 a 100 dentro da **própria faixa histórica** do terminal
(0 = mínima da série, 100 = máxima).
- Séries de escala multiplicativa (preço, MVRV, SOPR, Realized Price): normalização **logarítmica**.
- Séries de escala aditiva (percentuais, taxas, fluxo): normalização **linear**.

## AS FAIXAS — INTENSIDADE, NÃO DECISÃO
As faixas descrevem o quão esticada está a situação. **Nenhuma delas dispara aporte.**
Os nomes deixaram de reutilizar o vocabulário de estado da Linha d'Água justamente para que os
dois instrumentos não sejam confundidos.

| Índice | Faixa | O que significa | Modulador M |
|---|---|---|---|
| 0–20 | Fundo | Intensidade no extremo comprimido da faixa histórica | 1,20 a 1,12 |
| 20–40 | Comprimido | Abaixo do meio da régua | 1,12 a 1,04 |
| 40–60 | Equilíbrio | Nem comprimido nem esticado | 1,04 a 0,96 |
| 60–80 | Esticado | Acima do meio da régua | 0,96 a 0,88 |
| 80–100 | Extremo | Intensidade no extremo esticado da faixa histórica | 0,88 a 0,80 |

O modulador é contínuo, não muda em degrau na fronteira da faixa. A faixa é rótulo de leitura; a
conta é a fórmula.

## LEITURA DE 29/08/2026 (dado real, confirmado por tooltip)
**Estado (Linha d'Água): Mercado saudável** — preço acima dos três custos de referência.
**Índice Semente = 50,91 (exibido 51) · faixa Equilíbrio.**
**Nota de divergência:** estado saudável, mas intensidade apenas em equilíbrio. O estado manda;
a intensidade qualifica. Não há disputa a resolver.

| Camada | Posição | Peso | Composição |
|---|---|---|---|
| 1 · Estado do preço | 44,41 | 38,6% | preço ÷ Realized Price = 1,46706 |
| 2 · Comportamento | 60,27 | 29,5% | SOPR 32,8 · Supply in Profit 49,4 · Liveliness 98,6 |
| 3 · Macro | 50,88 | 18,2% | DXY 36,3 · Fed Funds 32,2 · M2 100,0 · Curva 35,0 |
| 4 · Fluxo | 49,11 | 13,6% | ETF 55,0 · Funding 43,3 |
| 5 · Carteira | — | fora | sem carteira ativa |

Conta: `(0,34×44,41 + 0,26×60,27 + 0,16×50,88 + 0,12×49,11) ÷ 0,88 = 50,91`

Histórico do mesmo dia, para rastreabilidade:
`50` (v1.0, com dupla contagem do MVRV) → `50,80` (v1.1, Decisão 1) → **`50,91`** (v1.2, Decisão 5).
A faixa nunca mudou: Equilíbrio em todas as versões.

### ⚠️ OBSERVAÇÃO OBRIGATÓRIA EM QUALQUER LEITURA PUBLICADA
A camada Comportamento subiu de 56 para 60 porque, sem o MVRV puxando para baixo, **a Liveliness
em 98,6 da faixa histórica passou a pesar mais** — de 1/4 para 1/3 da camada.

Quanto ela responde, medido: a Liveliness contribui com **9,7 dos 50,91 pontos** do índice (19%).
Se ela estivesse em 50 em vez de 98,6, o índice de hoje seria **46,1** — ou seja, ela sozinha
**levanta a leitura em 4,8 pontos**. É o número que está segurando o índice no Equilíbrio.

### O que salta na leitura individual
- **Liveliness em 98,6** — praticamente na máxima. Moeda velha se movendo: distribuição. É o número
  mais gritante da tela, e agora também o mais influente.
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

*Nota de fonte:* a camada 1 usa a razão calculada a partir de duas leituras do terminal
(77.839,19 ÷ 53.057,77 = 1,46706). O MVRV lido diretamente no terminal é 1,465 e dá posição 44,36
contra 44,41 — diferença de 0,05 ponto, sem efeito no índice exibido.

## PENDÊNCIA ABERTA
**As métricas internas da camada 5** — pesos, caixa, distância do stop, anos restantes — e como
cada uma normaliza. Só faz sentido definir quando houver carteira. Até lá a camada fica fora.
