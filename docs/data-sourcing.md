# Captação de dados — VantageNode-X

Como os dados entram no pipeline durante a fase de teste (não usamos a API real; ver README).
Vale para o SCOUT (01, intake de dados) e o PLOT (02, gráfico).

## Regra fixa (Mr. G, 2026-07-21)

> **Toda solicitação de dados/gráficos da VantageNode feita via Claude Chrome deve pedir
> explicitamente para ele ACESSAR A ABA DA VANTAGENODE e trazer TODOS os gráficos necessários
> para complementar a análise — não apenas os números.**

Ou seja: ao pedir insumo para um ciclo, não peça só "o valor do MVRV-STH". Peça também os
**gráficos originais** da(s) métrica(s) relevante(s), direto da aba aberta da VantageNode.

## O que sempre incluir no pedido

1. **Valores exatos** da(s) métrica(s), com casas decimais como aparecem na tela (invariante 6).
2. **Os gráficos** correspondentes (screenshots/exports da aba VantageNode) — todos os que ajudem a
   sustentar/contextualizar a leitura, não só o principal.
3. **Janela/range** usado (ex.: 30D) e a **data de referência** (`as_of`).
4. A **permalink** exata da métrica (o `#metric=...`) para o link do reply.

## Regra do gráfico publicado — DECISÃO (Mr. G, 2026-07-21)

> **A imagem do post (`02_chart.png`) é SEMPRE o gráfico ORIGINAL da VantageNode.**
> O Claude NÃO gera o gráfico publicado, e **NUNCA** acrescenta sinal, dado, indicador, linha, cor de
> alerta, título-leitura ou qualquer marcação própria à imagem. **Gráficos carregam apenas sinais/dados
> da VantageNode — nunca do Claude.**

Consequências no pipeline:

- **PLOT (02):** obtém o gráfico original da métrica na VantageNode (via Claude Chrome) e o salva como
  `02_chart.png`, **sem editar/anotar/re-renderizar por cima**. Traz todos os gráficos relevantes.
- **A leitura/interpretação vai 100% no TEXTO do post** (VOICE, 03) — nunca embutida na imagem. O
  invariante 4 ("todo gráfico acompanha uma leitura") é satisfeito pelo texto que acompanha o gráfico.
- **`lib/render_chart.py` e `lib/render_cohort.py` viram uso INTERNO/verificação apenas** — podem ajudar
  o Claude a conferir os números ou explorar, mas **não produzem a imagem publicada**.
- **GATEKEEPER (04):** como a imagem original não é "parseável" por máquina, a reconciliação do gráfico
  (invariante 6) é **conferência visual** — o número no texto tem de bater com o número visível no
  gráfico da VantageNode e com `00_data.json`. Deve também confirmar que a imagem é o original da
  VantageNode, sem marcação do Claude.

## Por quê

O terminal renderiza em SVG e não expõe série via DOM (hover não é extraível por máquina). O Claude
Chrome, operando na aba logada do Mr. G, é o caminho para trazer tanto os valores quanto os gráficos
originais — fechando a lacuna que a ausência de API deixa nesta fase.
