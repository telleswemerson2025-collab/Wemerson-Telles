# CLAUDE.md — VantageNode-X

Instruções globais lidas por qualquer instância do Claude Code trabalhando neste repositório. Este arquivo é a lei do pipeline — se uma regra aqui conflitar com julgamento de um agente, a regra vence.

## O que é este projeto

Pipeline "empresa de um + 6 agentes" para produzir conteúdo de indicadores onchain no X (Twitter). A VantageNode publica dados com narrativa própria, não dados neutros — isso eleva o peso da revisão de risco (agente GATEKEEPER).

Operador humano: Mr. G (Diretor Editorial). Ele intervém em 2 checkpoints (gates) e em mais nenhum outro ponto do ciclo.

**Conta oficial no X:** `@VantageNodeio` (e-mail de contato: contato@vantagenode.io). Definida pelo Gui em 25/07/2026. Todo post/ciclo novo publica nesta conta. A antiga `@VantageNodvt` foi **conta de teste** e deixou de ser a principal; os ciclos já publicados nela ficam no repo como referência histórica de teste (não migrar nem apagar).

## Arquitetura

File-driven: cada agente é um prompt (`agents/*.md`) + comando slash (`.claude/commands/`). O estado de cada post viaja como arquivos JSON e imagem dentro de `cycles/<id-do-ciclo>/`. Nada roda em servidor 24/7 — Claude Code orquestra tudo via scripts shell.

## O fluxo (01 → 06)

```
SCOUT (01) → PLOT (02) → VOICE (03) → GATEKEEPER (04) → [GATE HUMANO] → BROADCAST (05) → FEEDBACK (06)
```

| # | Agente | Lê | Escreve |
|----|-------------|--------------------------------------------------|--------------------------------------------------|
| 01 | SCOUT | dados do dia + `memory/learnings.md` | `00_brief.json` |
| 02 | PLOT | brief + série de dados | `02_chart.png` |
| 03 | VOICE | brief + gráfico + `knowledge/brand-voice.md` | `03_copy.json` |
| 04 | GATEKEEPER | dados + gráfico + copy | `04_review.json` + `APPROVAL.md` |
| 05 | BROADCAST | pacote aprovado (`STATUS: approved`) | `05_published.json` |
| 06 | FEEDBACK | post publicado (+48h) | `06_metrics.json` + atualiza `memory/learnings.md` |

- `run_cycle.sh` roda 01→04 e para no Gate 2.
- `publish.sh` roda 05 depois da aprovação.
- `collect.sh` roda 06 depois de +48h.

## Os 2 gates humanos (únicos pontos de intervenção)

- **Gate 1 — Direção editorial (depois do SCOUT):** Mr. G aprova o ângulo/tensão proposto, ou pede outro. Ele não escreve o ângulo, só aprova a direção.
- **Gate 2 — Aprovação de publicação (depois do GATEKEEPER):** Mr. G revisa `APPROVAL.md` e marca `STATUS: approved`. Só então o BROADCAST pode publicar.

Fora desses 2 pontos, o pipeline roda sozinho.

## Invariantes (valem sempre, em todo ciclo, sem exceção)

1. **1 post = 1 ideia.** Nunca empacotar dois insights no mesmo post.
2. **KPI real é bookmark, não like.** Pergunta de teste: "um analista salvaria isto?"
3. **Link externo no primeiro reply, corpo sem link externo.** O corpo do post não leva link externo; o link (ex.: `vantagenode.io/terminal`) vai no **primeiro reply**. Motivo: link no corpo derruba o alcance (o algoritmo do X rebaixa posts que tiram o usuário da plataforma). Decisão do Gui, 25/07/2026, que **reverte** a permissão anterior de link no corpo. Vale só para os próximos posts (os já publicados ficam como estão, o X não deixa editar).
4. **Todo gráfico acompanha uma leitura.** Nunca publicar dado cru sem interpretação.
5. **Contra-consenso é permitido, irresponsabilidade não.** Nunca afirmar certeza sobre preço futuro nem prometer retorno.
6. **Número no texto = número no gráfico = número na fonte.** Qualquer divergência bloqueia o ciclo no GATEKEEPER.
7. **Gate humano é inviolável.** Nada é publicado sem `STATUS: approved`. Nenhum agente marca aprovação em nome do humano.
8. **Sem emoji, sem hype, sem jargão de lua/pump. Sem travessão (em dash `—`).** Voz humanizada e acessível: próxima, conversacional, que explica o dado de um jeito que qualquer pessoa entenda, sem abrir mão da honestidade e do rigor do número (decisão do Gui, 25/07/2026, que substitui a antiga "voz de terminal frio"). Travessão proibido: trocar por vírgula, ponto, dois-pontos ou reescrever a frase. Detalhes em `knowledge/brand-voice.md`.
9. **API do X é dependência frágil, não alicerce.** Tratar automação de publicação como substituível (ver episódio Kaito/jan-2026 em `knowledge/algorithm-x-2026.md`).

## Onde vive o quê

- Lógica de negócio e estratégia editorial → `knowledge/*.md`. Mr. G ajusta estratégia editando markdown, não código.
- Comportamento de cada agente → `agents/*.md`.
- Integração externa (API, render, publicação) → `lib/*.py`.
- Estado de cada post → `cycles/<id>/`.
- Aprendizado acumulado → `memory/learnings.md`, atualizado de forma incremental (nunca reescrito do zero).

## Regras de segurança

- Segredos reais só em `.env` (nunca versionado — ver `.gitignore`).
- Publicação é irreversível e pública: em caso de dúvida, o ciclo para no gate, não avança.

## Roadmap (visão macro)

Fase 0 (fundação) → Fase 1 (mock) → Fase 2 (dados reais) → Fase 3 (gate + publicação manual) → Fase 4 (automação de publicação) → Fase 5 (loop de aprendizado) → Fase 6 (robustez de produção).
