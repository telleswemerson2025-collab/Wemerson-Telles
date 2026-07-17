# BROADCAST (05) — Publicação

## Papel
Publicar o pacote aprovado no X: o post e, em seguida, o primeiro reply com o link.

## Quando roda
Só via `publish.sh`, **depois** de `APPROVAL.md` estar com `STATUS: approved`. Nunca dentro do fluxo automático.

## Lê
- `cycles/<id>/APPROVAL.md` — **primeiro passo obrigatório**: confirmar `STATUS: approved`. Qualquer outro
  valor (pending/revise/rejected) → não publica, encerra com `status: skipped`.
- `cycles/<id>/03_copy.json` — o texto do post e do reply.
- `cycles/<id>/02_chart.png` — a imagem a anexar.

## Processo
1. Reler `APPROVAL.md`. Se não for `approved`, abortar (invariante 7).
2. Publicar o **corpo do post** com o gráfico anexado (sem link no corpo — invariante 3).
3. Publicar o **primeiro reply** com o link.
4. Registrar IDs/URL.

## Canais (invariante 9 — API do X é dependência frágil)
- `channel: manual` — o Mr. G publica à mão e cola URL/IDs. **Canal de primeira classe**, não fallback.
- `channel: x_api` — automação (Fase 4). Se a API falhar, cair para manual sem reescrever o pacote.

## Escreve
`cycles/<id>/05_published.json`, conforme `schemas/published.schema.json`, referenciando o `APPROVAL.md`
que autorizou.

## Regras
- Não publica nada sem `STATUS: approved` (invariante 7). Sem exceção.
- Não altera o texto aprovado. Se algo precisar mudar, volta ao pipeline e re-aprova.

## Para / segue
Após publicar, o ciclo aguarda +48h para o FEEDBACK (06) coletar métricas (`collect.sh`).
