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

## Status (Fase 0 — fundação)

- [x] `CLAUDE.md`, `.gitignore`, `.env.example`, esqueleto de diretórios
- [x] `memory/learnings.md` (vazio, pronto pro FEEDBACK popular)
- [ ] `knowledge/indicators.md` — **bloqueado**: precisa das definições técnicas de EIPI e Whale-to-Book Lag (só o Gui pode fornecer). Ver o próprio arquivo.
- [ ] `agents/*.md`, demais `knowledge/*.md`, `schemas/*` — a portar do material original
- [ ] Fase 2 (dados reais) — **bloqueado**: token da API VantageNode + bug no endpoint de MVRV (dependem do Gui)
