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

## Regra do gráfico publicado — DECISÃO FINAL (Mr. G, 2026-07-23)

> Histórico das voltas: screenshot cru → template renderizado → **SCREENSHOT REAL (final)**. A imagem do
> post é o **PRINT REAL do terminal VantageNode** (com a marca d'água nativa), **não** um gráfico
> renderizado pelo Claude.
>
> **`02_chart.png` = screenshot real do terminal VantageNode.** O Claude NÃO gera a imagem publicada nem a
> edita/anota. Os `render_*.py` voltam a ser **uso interno/verificação apenas**.

### Recipe de captura (Claude Chrome / Mr. G) — seguir à risca

- **Range: 3 anos (3Y).** Contexto de ciclo — só num range longo "historicamente baixo/alto" faz sentido.
- **SMA:** deixar como está (**SMA = 7**); ajustar **só o range** para 3 anos (o "7 dias" é a média móvel, não o range).
- **Enquadrar SOMENTE:** a **faixa de cabeçalho do topo** (logo VantageNode + breadcrumb, ex.:
  `Studio / Market Value to Realized Value (MVRV) / MVRV · STH`) **+ o gráfico logo abaixo**.
- **NÃO incluir:** a barra/painel de **ferramentas** (SMA / 7D / 14D / 30D, ferramentas de desenho,
  Y LOG / BTC LOG) **nem a aba/painel lateral** de métricas.
- **Marca d'água VantageNode visível** no gráfico. É o **mesmo enquadramento da view em tela cheia**.

### Consequências no pipeline

- **Captação:** o screenshot (3Y, enquadrado) vem do Claude Chrome / Mr. G. O Claude não captura o terminal.
- **PLOT (02):** salva o screenshot recebido como `02_chart.png`, **sem editar/anotar/re-renderizar**.
- **A leitura vai 100% no TEXTO do post** (o screenshot não traz título-leitura do Claude). Invariante 4
  satisfeito pelo texto.
- **GATEKEEPER (04):** reconciliação do gráfico = **conferência VISUAL** (imagem não parseável): o número do
  texto bate com o visível no gráfico e com `00_data.json`; confirma que é o **print real** (marca d'água,
  enquadramento correto: cabeçalho + gráfico, sem toolbar/sidebar), sem edição do Claude.
- **Ângulo:** com 3 anos no gráfico, os posts tendem a **leituras de contexto de ciclo** (onde estamos na
  faixa histórica), não micro-movimentos de 30D.

## Por quê

O terminal renderiza em SVG e não expõe série via DOM (hover não é extraível por máquina). O Claude
Chrome, operando na aba logada do Mr. G, é o caminho para trazer tanto os valores quanto os gráficos
originais — fechando a lacuna que a ausência de API deixa nesta fase.
