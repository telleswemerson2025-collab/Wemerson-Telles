# indicators.md — Definições dos indicadores

Referência canônica dos indicadores que o pipeline cita. O GATEKEEPER (04) usa este arquivo para
validar a invariante 6 (número no texto = número no gráfico = número na fonte): se um indicador não
tem definição aqui, o ciclo **não passa** — não se publica métrica sem definição pública auditável.

---

## Indicadores públicos padrão

Indicadores de definição pública e auditável. Podem ser citados no pipeline sem depender do Gui.

### MVRV (Market Value to Realized Value)

- **O que mede:** relação entre o valor de mercado e o valor realizado do ativo — um proxy do lucro/prejuízo
  não realizado agregado do mercado. Em outras palavras, o quanto o preço atual está acima (ou abaixo) do
  custo-base médio de quem detém o ativo.
- **Fórmula:** `MVRV = Market Value / Realized Value`, onde
  - **Market Value (MV):** preço atual × oferta em circulação (a capitalização de mercado).
  - **Realized Value (RV):** soma de cada unidade (ex.: cada BTC) avaliada ao preço em que se moveu pela
    última vez on-chain (a *realized cap*). Aproxima o custo-base agregado do mercado.
- **Unidade:** `ratio` (adimensional, um múltiplo). MVRV ≈ 1 significa que, na média, o mercado está no
  próprio custo-base; leitura derivada útil: `(MVRV − 1) × 100` = % acima/abaixo do custo-base.
- **Interpretação (heurística histórica, NÃO sinal):**
  - **Baixo / próximo de 1 ou abaixo:** mercado perto do custo-base agregado — historicamente associado a
    zonas de valor/capitulação.
  - **Alto (historicamente na casa de ~3,5–4+):** grande lucro não realizado — historicamente associado a
    zonas de euforia/topo.
  - As faixas são referências históricas, **não gatilhos de compra/venda**. Nunca afirmar direção de preço a
    partir do MVRV (invariante 5).
- **Fonte no pipeline:** durante a fase de teste, valores vêm por transferência manual da VantageNode
  (`00_data.json`). A definição oficial da VantageNode para MVRV está registrada como confirmação **menor**
  em `docs/pendencias-gui.md` (caso usem alguma variação do padrão) — não bloqueia o uso do MVRV.
- **Cuidados de linguagem:** descrever nível/regime ("faixa historicamente baixa", "custo-base"), nunca
  prever preço nem chamar de "fundo"/"topo" como certeza.

### SOPR (Spent Output Profit Ratio)

- **O que mede:** para as moedas que se movem on-chain num período, a razão entre o preço de venda e o
  preço de aquisição — ou seja, se o mercado está, na média, realizando **lucro** (>1) ou **prejuízo** (<1).
- **Fórmula:** `SOPR = valor de venda (USD) / valor na aquisição (USD)` dos outputs gastos.
- **Cortes por idade (usados no pipeline):**
  - **SOPR-LTH** (long-term holders): moedas movidas por quem segura há muito tempo.
  - **SOPR-STH** (short-term holders): moedas movidas por quem comprou recentemente.
- **Unidade:** `ratio`. Referência: **1,0 = breakeven** (venda no zero a zero). Abaixo de 1 = realização
  no prejuízo; acima de 1 = no lucro.
- **Interpretação (heurística, NÃO sinal):** SOPR-LTH abaixo de 1 é incomum (o coorte de longo prazo
  costuma vender no lucro) — sustentado, sugere regime de realização de prejuízo. É ruidoso no dia a dia;
  usar a leitura agregada da janela, nunca um único dia. Nunca prever preço a partir dele (invariante 5).
- **Usado em:** ciclo `2026-07-18-sopr-lth-01`.

### Realized Price STH (custo-base do short-term holder)

- **O que mede:** o preço médio de aquisição (custo-base), em USD, das moedas em mãos de **short-term
  holders**. É a *realized price* restrita ao coorte STH.
- **Cálculo:** realized cap do coorte STH ÷ oferta do coorte STH (preço médio ponderado a que as moedas do
  STH se moveram pela última vez). Ligada ao MVRV-STH: **MVRV-STH = preço / Realized Price STH** (≈1 quando
  preço = custo do STH).
- **Unidade:** USD. Cortes disponíveis na VantageNode: agregado, LTH e STH (sidebar mostra os três).
- **Interpretação (heurística, NÃO sinal):** preço **abaixo** da Realized Price STH = compradores recentes,
  na média, no prejuízo. Essa linha costuma atuar como **zona de custo/oferta** (suporte/resistência).
  Nunca prever rompimento nem direção de preço a partir dela (invariante 5).
- **⚠️ Nuance de leitura na VantageNode:** no range **30D o gráfico aplica SMA-30** — a **linha plotada é
  média móvel suavizada** (o valor do último ponto no tooltip), enquanto a **sidebar mostra o valor cru
  diário** (podem diferir ~$1K). Para coerência texto↔imagem (invariante 6), **cite o valor da LINHA** que
  o leitor vê no gráfico anexado, não o cru da sidebar. O tooltip arredonda ao milhar → use "~" nos valores.
- **Usado em:** ciclo `2026-07-22-sth-cost-convergence-01`.

### NUPL (Net Unrealized Profit/Loss)

- **O que mede:** a fração do valor da oferta que é **lucro (ou prejuízo) não realizado** — um termômetro
  agregado de **euforia × estresse** do mercado.
- **Fórmula:** `NUPL = (Market Value − Realized Value) / Market Value`. Equivale a `1 − 1/MVRV`.
- **Unidade:** `ratio` (adimensional). Na prática oscila de levemente negativo (capitulação) a ~0,75+ (euforia).
- **Zonas (heurística, NÃO sinal):** `< 0` capitulação · `0–0,25` esperança/medo · `0,25–0,5` otimismo/ansiedade ·
  `0,5–0,75` crença/ganância · `> 0,75` euforia. **Baixo** = pouco lucro embutido (bear/recuperação); **alto** =
  muito lucro não realizado (risco de topo). Descrever posição/trajetória, nunca prever preço (invariante 5).
- **Cortes:** agregado, LTH, STH.
- **Nuance na VantageNode:** a linha é **colorida por zona** (verde alto → laranja/vermelho baixo). No range longo
  o gráfico usa **SMA = 7**. Ver a recipe de captura em `docs/data-sourcing.md` (range 3 anos, cabeçalho + gráfico).
- **Usado em:** ciclo `2026-07-23-nupl-bear-easing-01`.

### Candidatos legítimos (públicos na VantageNode — a documentar quando forem usados)

Indicadores que o Gui usa e que **são públicos** na plataforma — podem virar ciclos futuros. Definição
formal (fórmula/interpretação) a ser preenchida aqui no primeiro uso, com dados por transferência manual:

- **Addresses by Size** — distribuição de endereços por faixa de saldo (ex.: acumulação de faixas grandes).
  _(Avaliado no SCOUT de 22/07 e descartado como pauta: contagem de endereços ≠ moedas — ver `memory/learnings.md`.)_

---

## Indicadores proprietários / internos — ⛔ BLOQUEADO

> **Regra geral (invariante 9).** Nenhum indicador desta seção pode ser citado no pipeline: não temos
> acesso real aos dados nem à definição de cálculo. O GATEKEEPER deve **bloquear** qualquer post que os
> referencie, e **nunca** se deve fabricar valor ou definição para eles.

### Categoria A — proprietários que o produto pretende usar (aguardando definição do Gui)

Só o dono do produto (Mr. G / Gui) pode fornecer a definição técnica. Não existem em fonte pública nem no
terminal da VantageNode (verificado). Destravam quando o Gui definir (ver `docs/pendencias-gui.md`).

#### EIPI

Necessário do Gui, antes de qualquer uso em produção:

- **Nome por extenso** e o que o índice mede conceitualmente.
- **Fórmula / método de cálculo** (inputs, janela temporal, normalização).
- **Fonte dos dados** de entrada e frequência de atualização.
- **Faixa de valores** e como interpretar (o que é "alto"/"baixo", zonas de atenção).
- **Cuidados de linguagem** — o que se pode e o que não se pode afirmar ao citá-lo.

_Status: aguardando definição do Gui._

#### Whale-to-Book Lag

Necessário do Gui, antes de qualquer uso em produção:

- **Definição** — qual "lag" entre atividade de whales e o order book está sendo medido.
- **Fórmula / método de cálculo** (inputs, janela, unidade — tempo? blocos?).
- **Fonte dos dados** e frequência.
- **Faixa de valores** e interpretação (o que sinaliza um lag alto vs. baixo).
- **Cuidados de linguagem** ao citá-lo.

_Status: aguardando definição do Gui._

### Categoria B — ferramentas internas de engenharia de dados do Gui/equipe (off-limits)

Indicadores identificados em vídeos do canal do Gui Telles que **NÃO** fazem parte dos planos pagos
públicos da VantageNode — são ferramentas internas, de acesso exclusivo do Gui e da equipe dele. Mesma
categoria de EIPI/Whale quanto ao bloqueio: **sem acesso aos dados, sem definição de cálculo → não usar,
não fabricar.** Diferença: não são (por ora) algo que o pipeline pretende publicar, então não estão na
lista de pendências do Gui — estão listados aqui para o GATEKEEPER e o SCOUT os reconhecerem e evitarem.

- Supply LTH
- Realized Loss STH
- ETF Cost Basis
- Drawdown Risk (incl. a versão **"V3"**, a mais recorrente nos vídeos)
- STH Cost Basis Heatmap
- Realized Loss by Age
- Capitulation Zone (painel)

_Status: off-limits. Se algum dia o produto quiser usá-los, passam a exigir o mesmo tratamento da
Categoria A (definição fornecida pelo Gui)._
