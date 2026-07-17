# schemas/

Contratos dos artefatos que viajam entre os agentes (JSON Schema) + template de aprovação.

- `brief.schema.json` — valida `00_brief.json` (SCOUT)
- `copy.schema.json` — valida `03_copy.json` (VOICE)
- `review.schema.json` — valida `04_review.json` (GATEKEEPER)
- `published.schema.json` — valida `05_published.json` (BROADCAST)
- `metrics.schema.json` — valida `06_metrics.json` (FEEDBACK)
- `APPROVAL.template.md` — template do gate humano (Gate 2); começa em `STATUS: pending`

> **Status:** a portar do material original. Nenhum agente marca `STATUS: approved` em nome do humano
> (invariante 7).
