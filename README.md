# VantageNode-X

Pipeline "empresa de um + 6 agentes" para produzir conteúdo de indicadores onchain no X (Twitter).
A lei do projeto está em [`CLAUDE.md`](./CLAUDE.md) — leia primeiro.

> **Isolamento total:** esta branch (`vantagenode-x`) tem histórico próprio (órfão) e contém **somente**
> o VantageNode-X — nenhum arquivo em comum com o app de adega/Bitget que vive na branch `claude` deste
> mesmo repositório. São projetos sem qualquer relação, mantidos independentes de propósito.

## Fluxo

```
SCOUT (01) → PLOT (02) → VOICE (03) → GATEKEEPER (04) → [GATE HUMANO] → BROADCAST (05) → FEEDBACK (06)
```

## Estrutura

```
CLAUDE.md              # lei do pipeline
.env.example           # template de segredos (.env real nunca é versionado)
agents/                # prompt de comportamento de cada agente (01–06)
knowledge/             # estratégia editorial e definições (markdown editável pelo Mr. G)
schemas/               # contratos JSON de cada artefato + template APPROVAL.md
.claude/commands/      # comandos slash que disparam cada agente
lib/                   # integração externa (API, render, publicação)
cycles/                # estado de cada post: cycles/<id>/
memory/learnings.md    # aprendizado acumulado (incremental, alimentado pelo FEEDBACK)
```

## Status

**Fase 0 — fundação:** ✅
- [x] `CLAUDE.md`, `.gitignore`, `.env.example`, esqueleto de diretórios
- [x] `memory/learnings.md` (vazio, pronto pro FEEDBACK popular)

**Fase 1 — esqueleto do pipeline:** ✅ (redigido a partir do fluxo do CLAUDE.md)
- [x] `schemas/*` — contratos JSON dos 5 artefatos + `data.schema.json` (entrada manual) + `APPROVAL.template.md`
- [x] `agents/01..06` — prompts de comportamento dos 6 agentes
- [x] `knowledge/positioning · algorithm-x-2026 · brand-voice · visual-identity` — estratégia editorial
- [x] `.claude/commands/*` — comandos slash de cada agente
- [x] `lib/fetch_data.py` — **modo manual** (lê/valida `00_data.json`; API real stubada, desligada)

**Fase 3 — orquestração + gate manual:** ✅
- [x] `lib/render_chart.py` (gera `02_chart.png` + `02_chart_meta.json`) · `lib/validate.py` (valida artefatos vs. schema)
- [x] `run_cycle.sh` (01→04: valida cada etapa, reconcilia números, impõe o Gate 1, para no Gate 2) · `publish.sh` (só publica com `STATUS: approved`) · `collect.sh` (06 após +48h)
- [x] Ciclo **real** `2026-07-16-mvrv-01` rodado 01→04 com dado real de MVRV — parado no Gate 2 aguardando aprovação do Mr. G

**Bloqueado (depende do Gui):**
- [ ] `knowledge/indicators.md` — definições técnicas de **EIPI** e **Whale-to-Book Lag** (não existem em fonte pública)
- [ ] Fase 2 (API real de dados) — token da API VantageNode + bug no endpoint de MVRV

**Fase de teste:** os dados entram por **transferência manual** da aba VantageNode (Mr. G) → `cycles/<id>/00_data.json`. Nada de API real por enquanto.

**Próximos:** decidir o Gate 2 do ciclo MVRV (Mr. G) e publicar (canal manual) · testar o caminho de **bloqueio** do GATEKEEPER · Fase 4 (automação de publicação via API do X) quando fizer sentido.
