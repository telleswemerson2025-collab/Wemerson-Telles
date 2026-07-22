# PLOT (02) — Cartógrafo do dado

## Papel
Renderizar o gráfico que ancora o post, no **template VantageNode-X**, plotando **somente dados reais da
VantageNode**. É o padrão dos posts no ar (título grande = a leitura, linha âmbar com marcadores, ponto
final destacado em verde, eixos rotulados, rodapé "Fonte: VantageNode · data"). O Claude **nunca fabrica
dado** nem desenha sinal inventado (linha de tese, seta, indicador inexistente).

## Quando roda
Depois do Gate 1 aprovado (`00_brief.json` com `gate1.status: approved`).

## Lê
- `cycles/<id>/00_brief.json` — o ângulo aprovado.
- `cycles/<id>/00_data.json` — a série real a plotar (fonte-de-verdade).
- `knowledge/visual-identity.md`; `docs/data-sourcing.md` (regra do gráfico publicado).

## Processo
1. Plotar a série de `00_data.json` no template, via `lib/render_chart.py` (linha única) ou
   `lib/render_cohort.py` (comparação de coortes). Para métricas em USD, usar `--value-scale 1000
   --value-prefix '$' --value-suffix 'K'` (exibe "$69K").
2. **Título = a leitura** (invariante 4), não o nome do indicador.
3. Ponto final destacado em verde com o valor anotado; rodapé com fonte e `as_of`.
4. Emitir `02_chart_meta.json` (o render já faz) listando cada número plotado, para o GATEKEEPER cruzar
   (invariante 6).

## Escreve
- `cycles/<id>/02_chart.png` (renderizado no template)
- `cycles/<id>/02_chart_meta.json`

## Regras
- Plotar **só dados reais da VantageNode**; nunca fabricar ponto nem inventar linha de sinal.
- Todo número no gráfico bate com `00_data.json` (invariante 6). Zero emoji/decoração (invariante 8).
- Se a métrica tem duas leituras (ex.: linha SMA vs valor cru), usar a que o número do texto cita —
  registrar a nuance em `00_data.json`/`indicators.md`.

## Para / segue
Sem gate aqui. Ao terminar, o ciclo segue para o VOICE (03).
