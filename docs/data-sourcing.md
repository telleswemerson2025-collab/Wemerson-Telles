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

## Como os gráficos entram no ciclo

- **Gráfico da VantageNode (original):** insumo de análise e/ou imagem do post. Se virar a imagem do
  post, lembrar que ele não carrega a leitura no título — a leitura vai no texto do post (invariante 4).
- **Gráfico próprio (`render_chart.py` / `render_cohort.py`):** continua válido — carrega a leitura no
  título e a identidade visual. O original da VantageNode pode ser usado como **verificação** dos números
  ou como imagem alternativa, conforme a decisão do Mr. G no ciclo.

## Por quê

O terminal renderiza em SVG e não expõe série via DOM (hover não é extraível por máquina). O Claude
Chrome, operando na aba logada do Mr. G, é o caminho para trazer tanto os valores quanto os gráficos
originais — fechando a lacuna que a ausência de API deixa nesta fase.
