# schemas/

Contratos dos artefatos que viajam entre os agentes (JSON Schema, draft 2020-12) + template do gate humano.

| Arquivo | Valida | Produzido por |
|---------|--------|---------------|
| `data.schema.json` | `00_data.json` — série manual da VantageNode (fonte-de-verdade dos números) | Mr. G (transferência manual) |
| `brief.schema.json` | `00_brief.json` | SCOUT (01) |
| `copy.schema.json` | `03_copy.json` | VOICE (03) |
| `review.schema.json` | `04_review.json` | GATEKEEPER (04) |
| `published.schema.json` | `05_published.json` | BROADCAST (05) |
| `metrics.schema.json` | `06_metrics.json` | FEEDBACK (06) |
| `APPROVAL.template.md` | template do `APPROVAL.md` (começa em `STATUS: pending`) | GATEKEEPER gera; **só o humano aprova** |

Observações:
- Não há schema para `02_chart.png` (é imagem). O PLOT pode emitir um `02_chart_meta.json` listando todo número plotado, para o GATEKEEPER cruzar (invariante 6).
- Nenhum agente marca `STATUS: approved` em nome do humano (invariante 7).
- Durante a fase de teste, `00_data.json` é preenchido à mão — não integramos a API real ainda.

> **Status:** ✅ schemas e template redigidos a partir do fluxo do CLAUDE.md.
