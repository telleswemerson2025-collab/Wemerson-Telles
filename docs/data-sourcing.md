# Captação de dados — VantageNode-X

Como os dados entram no pipeline durante a fase de teste (não usamos a API real; ver README).
Vale para o SCOUT (01, intake de dados) e o PLOT (02, gráfico).

## Regra fixa (Mr. G, 2026-07-21)

> **Toda solicitação de dados/gráficos da VantageNode feita via Claude Chrome deve pedir
> explicitamente para ele ACESSAR A ABA DA VANTAGENODE e trazer TODOS os gráficos necessários
> para complementar a análise — não apenas os números.**

Ou seja: ao pedir insumo para um ciclo, não peça só "o valor do MVRV-STH". Peça também os
**gráficos originais** da(s) métrica(s) relevante(s), direto da aba aberta da VantageNode.

### Mecanismo — sob demanda (Mr. G, 2026-07-21)

O Claude Code (esta sessão) **não** acessa a VantageNode sozinho. Sempre que precisar de qualquer
informação ou gráfico, basta **pedir aqui, em texto**: o **Claude no Chrome** acessa a aba da VantageNode
(logada no Mr. G) e traz os dados/gráficos. É **sob demanda** — só acontece quando o Claude Code pede ou o
operador solicita explicitamente; nunca automaticamente. Formule o pedido de forma auto-suficiente (métrica,
range, `as_of`, permalink, e "traga todos os gráficos relevantes").

## O que sempre incluir no pedido

1. **Valores exatos** da(s) métrica(s), com casas decimais como aparecem na tela (invariante 6).
2. **Os gráficos** correspondentes (screenshots/exports da aba VantageNode) — todos os que ajudem a
   sustentar/contextualizar a leitura, não só o principal.
3. **Janela/range** usado (ex.: 30D) e a **data de referência** (`as_of`).
4. A **permalink** exata da métrica (o `#metric=...`) para o link do reply.

## Regra do gráfico publicado — DECISÃO REVISTA (Mr. G, 2026-07-22)

> Corrige a regra anterior (que mandava usar o screenshot cru do terminal). Conferindo os posts já
> publicados (MVRV, SOPR-LTH), o padrão da conta é o **gráfico RENDERIZADO no template VantageNode-X**,
> não o print do terminal.
>
> **A imagem do post (`02_chart.png`) é o gráfico RENDERIZADO no template** (`lib/render_chart.py` /
> `lib/render_cohort.py`), **plotando SOMENTE dados reais da VantageNode**. O Claude **nunca fabrica dado**
> nem desenha **sinal inventado** (linha de tese, seta de compra/venda, indicador inexistente). O template
> — título (a leitura), marcadores, ponto final destacado em verde, eixos rotulados, rodapé "Fonte:
> VantageNode · data" — é **apresentação da marca**, não sinal. É o que os posts no ar já fazem.

Consequências no pipeline:

- **Captação (Claude Chrome):** traga a **SÉRIE** da métrica (hover em vários pontos, ~8–12) — é o que
  alimenta o render. Pode trazer o gráfico original como referência/verificação, mas a imagem publicada é
  a nossa (renderizada).
- **PLOT (02):** renderiza a série real com `render_chart.py` (linha única, ex.: `--value-scale 1000
  --value-prefix '$' --value-suffix 'K'` para métricas em USD) ou `render_cohort.py` (coortes). Título = a
  leitura. Salva `02_chart.png`.
- **GATEKEEPER (04):** reconciliação normal texto = gráfico (`02_chart_meta.json`) = fonte (`00_data.json`).
- **Proibido no gráfico:** dado fabricado; indicador/linha de sinal inventada. A linha de referência
  **definicional** (ex.: breakeven 1,0 do SOPR) é permitida — é propriedade do próprio indicador, não sinal.

## Por quê

O terminal renderiza em SVG e não expõe série via DOM (hover não é extraível por máquina). O Claude
Chrome, operando na aba logada do Mr. G, é o caminho para trazer tanto os valores quanto os gráficos
originais — fechando a lacuna que a ausência de API deixa nesta fase.
