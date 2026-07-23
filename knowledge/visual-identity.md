# visual-identity.md — Identidade visual dos gráficos

Editável pelo Mr. G.

> **ATENÇÃO (Mr. G, 2026-07-23 — DECISÃO FINAL):** a **imagem publicada (`02_chart.png`) é um PRINT REAL
> do terminal VantageNode** (range 2 anos; enquadramento cabeçalho + gráfico; marca d'água nativa) — ver
> `docs/data-sourcing.md`. Portanto **esta identidade visual NÃO se aplica à imagem publicada** (que é a
> cara do próprio terminal). Vale apenas para gráficos **internos/de apoio** feitos com `lib/render_*.py`,
> que não vão ao post.

Objetivo (para os gráficos internos): legível, no espírito "terminal analítico".

> **Nota:** os valores concretos abaixo (cores hex, fonte) são um ponto de partida. Mr. G ajusta
> livremente — é markdown, não código.

## Princípios

1. **Todo gráfico tem uma leitura embutida.** Título é a tese, não o nome do indicador (invariante 4).
   Ex.: título "MVRV volta à faixa de euforia", não "Gráfico de MVRV".
2. **Legibilidade acima de estética.** O número-chave precisa ser lido no thumbnail do feed.
3. **Sem ruído.** Sem gradientes chamativos, sombras, 3D, emoji. Estética de terminal.
4. **Número no gráfico = número no texto = número na fonte** (invariante 6).

## Especificação de partida (⚠️ confirmar/ajustar com o Mr. G)

- **Fundo:** escuro (ex.: `#0B0E11`) — leitura de terminal.
- **Linha principal:** um tom de destaque (ex.: âmbar `#E8A33D` ou verde-terminal `#3DDC84`).
- **Grid/eixos:** cinza discreto (ex.: `#2A2E35`), baixo contraste.
- **Tipografia:** monoespaçada para números (ex.: uma mono do sistema), sans para título.
- **Anotação:** marque no gráfico o `latest_value` e a zona relevante à leitura (faixa, média, evento).
- **Fonte/carimbo:** rodapé discreto "Fonte: VantageNode · {as_of}" — crédito e rastreabilidade.
- **Proporção:** priorizar formato que renderize bem no feed do X (ex.: 16:9 ou 4:3).

## Checklist do PLOT antes de salvar 02_chart.png

- [ ] Título carrega a leitura, não só o nome do indicador.
- [ ] `latest_value` destacado e legível em tamanho de thumbnail.
- [ ] Todos os números do gráfico batem com `00_data.json`.
- [ ] Rodapé com fonte e data de referência.
- [ ] Zero emoji, zero elemento decorativo.
- [ ] (Opcional) `02_chart_meta.json` emitido, listando cada número plotado para o GATEKEEPER cruzar.
