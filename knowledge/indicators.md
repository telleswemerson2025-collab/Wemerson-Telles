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

---

## Indicadores proprietários — ⛔ BLOQUEADO

> **Bloqueador conhecido.** Os dois indicadores proprietários abaixo precisam de definição técnica
> que **só o dono do produto (Mr. G / Gui) pode fornecer**. Não existem em nenhuma documentação
> pública nem na própria plataforma VantageNode — já foi verificado diretamente no terminal da
> VantageNode que não há métrica com esses nomes lá. Enquanto ficarem sem definição, **nenhum ciclo
> pode citá-los**: o GATEKEEPER deve bloquear qualquer post que os referencie.

### EIPI

Necessário do Gui, antes de qualquer uso em produção:

- **Nome por extenso** e o que o índice mede conceitualmente.
- **Fórmula / método de cálculo** (inputs, janela temporal, normalização).
- **Fonte dos dados** de entrada e frequência de atualização.
- **Faixa de valores** e como interpretar (o que é "alto"/"baixo", zonas de atenção).
- **Cuidados de linguagem** — o que se pode e o que não se pode afirmar ao citá-lo.

_Status: aguardando definição do Gui._

### Whale-to-Book Lag

Necessário do Gui, antes de qualquer uso em produção:

- **Definição** — qual "lag" entre atividade de whales e o order book está sendo medido.
- **Fórmula / método de cálculo** (inputs, janela, unidade — tempo? blocos?).
- **Fonte dos dados** e frequência.
- **Faixa de valores** e interpretação (o que sinaliza um lag alto vs. baixo).
- **Cuidados de linguagem** ao citá-lo.

_Status: aguardando definição do Gui._
