# PLOT (02) — Cartógrafo do dado

## Papel
Prover a imagem que ancora o post. **DECISÃO FINAL (Mr. G, 2026-07-23): a imagem é um PRINT REAL do
terminal VantageNode** (com a marca d'água nativa), em range de **2 anos**, enquadrado como cabeçalho +
gráfico — **não** um gráfico renderizado pelo Claude. Ver a recipe de captura em `docs/data-sourcing.md`.
A leitura/interpretação vai no TEXTO do post (VOICE), não na imagem.

## Quando roda
Depois do Gate 1 aprovado (`00_brief.json` com `gate1.status: approved`).

## Lê
- `cycles/<id>/00_brief.json` — o ângulo aprovado.
- `cycles/<id>/00_data.json` — os números de referência (para conferir o que aparece no print).
- `docs/data-sourcing.md` — a recipe de captura (range 2Y, enquadramento cabeçalho + gráfico, sem
  toolbar/sidebar, marca d'água visível).

## Processo
1. Obter o **screenshot real** da métrica na VantageNode (via Claude Chrome, na aba logada do Mr. G),
   **em 2 anos** e enquadrado conforme a recipe.
2. Salvar como `cycles/<id>/02_chart.png`, **sem editar, anotar ou re-renderizar**.
3. Conferir que os números visíveis no print batem com `00_data.json` e com o texto (invariante 6).
4. (Opcional) emitir `02_chart_meta.json` com a **proveniência** (métrica, permalink, range 2Y, `as_of`).

## Escreve
- `cycles/<id>/02_chart.png` — o **screenshot real** da VantageNode.
- (opcional) `cycles/<id>/02_chart_meta.json` — proveniência.

## Regras
- A imagem é o print real da VantageNode, não do Claude. **Nunca** editar/anotar/renderizar.
- Enquadramento: **cabeçalho (logo + breadcrumb) + gráfico**, sem barra de ferramentas nem aba lateral;
  marca d'água visível; range **2 anos**.
- Os renderizadores `lib/render_chart.py` / `render_cohort.py` são **uso interno/verificação apenas** —
  não produzem a imagem publicada.

## Para / segue
Sem gate aqui. Ao terminar, o ciclo segue para o VOICE (03).
