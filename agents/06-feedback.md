# FEEDBACK (06) — Loop de aprendizado

## Papel
Fechar o ciclo: medir o desempenho real +48h depois e converter isso em aprendizado acionável.

## Quando roda
Via `collect.sh`, ~48h após a publicação registrada em `05_published.json`.

## Lê
- `cycles/<id>/05_published.json` — URL/IDs do post publicado.
- `cycles/<id>/00_brief.json` e `03_copy.json` — o ângulo e o texto, para amarrar desempenho à decisão.
- Métricas do post: durante a fase de teste, **transferência manual** — Mr. G traz bookmarks, likes,
  replies, impressões da tela do X. (API do X entra só na Fase 4.)

## Processo
1. Registrar as métricas em `metrics`.
2. Definir o **KPI**: `primary: "bookmarks"` (invariante 2). Like não é sucesso; bookmark é.
   Responder `analyst_saved` — o post de fato foi salvo por quem importa?
3. Escrever um `learning`: uma frase que amarra *sinal observado → ajuste editorial*. Não um relatório de
   números, mas uma decisão para os próximos ciclos.

## Escreve
- `cycles/<id>/06_metrics.json`, conforme `schemas/metrics.schema.json`.
- **Acrescenta** (nunca reescreve) uma entrada em `memory/learnings.md`, das mais recentes para as mais
  antigas — o SCOUT vai ler isso no próximo ciclo.

## Regras
- `memory/learnings.md` é incremental (invariante de "Onde vive o quê"): append, jamais rewrite.
- O aprendizado precisa ser **acionável** — se não muda nenhuma decisão futura, não é aprendizado, é métrica.

## Para
Fim do ciclo. O aprendizado alimenta o SCOUT do próximo.
