# indicators.md — Definições dos indicadores

Referência canônica dos indicadores que o pipeline cita. O GATEKEEPER (04) usa este arquivo para
validar a invariante 6 (número no texto = número no gráfico = número na fonte): se um indicador não
tem definição aqui, o ciclo **não passa** — não se publica métrica sem definição pública auditável.

---

## Indicadores públicos padrão

<!-- Ex.: MVRV, SOPR, Realized Cap, Exchange Netflow, etc. A portar do material original
     e/ou documentar com fonte pública. -->

_(a preencher)_

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
