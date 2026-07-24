# Learnings — VantageNode-X

Aprendizado acumulado do pipeline. Alimentado **incrementalmente** pelo agente FEEDBACK (06)
a cada ciclo — nunca reescrito do zero (invariante de "Onde vive o quê" no CLAUDE.md).

Cada entrada deve amarrar uma observação de desempenho a uma decisão editorial acionável,
não apenas registrar métricas.

---

<!-- O FEEDBACK acrescenta entradas abaixo desta linha, das mais recentes para as mais antigas. -->
<!-- Formato sugerido por entrada:

## <data> — ciclo <id>
- **Post:** <resumo de 1 linha do ângulo>
- **Sinal:** <métrica que importou — bookmarks, salvamentos, replies de analistas>
- **Leitura:** <o que isso indica sobre o que funciona>
- **Ação:** <ajuste concreto para os próximos ciclos>

-->

## 2026-07-24 — ciclo 2026-07-22-sth-cost-convergence-01 (STH cost convergence)
- **Post:** preço convergindo pra Realized Price do STH (~$69K) — coorte de curto prazo perto do custo-base.
- **Sinal (+48h/52h):** impressões 15 · **bookmarks 0** (KPI, lido no ícone) · likes 0 · replies 1 (só a nossa/link) · reposts 0 · profile visits 0 · detail expands 3 · engagements 6.
- **Leitura:** **5ª medição, alcance ainda caindo: 36 → 33 → 20 → 17 → 15.** Cinco pontos, queda monotônica sem exceção. O teto de ~15 impressões/post torna qualquer inferência sobre copy sem sentido estatístico. Padrão dos analíticos persiste (expands 5, 6, 3 nos três últimos — quem alcança abre), mas é sinal fraco em n minúsculo. **Bookmark rate acumulado (5 ciclos, KPI agora completo): 1 bookmark / 121 impressões = 0,83%** — todo o valor veio do 1º post (MVRV); 4 ciclos seguidos com 0.
- **Ação:** Nada muda no diagnóstico — **distribuição é o único gargalo que importa agora.** Prioridade absoluta = executar a frente Tier A (replies em contas de alcance, timing de publicação), não produzir mais posts no vácuo. **Fonte de captura do KPI travada: bookmarks pelo ÍCONE do post (a fita), não pelo painel de Post Analytics** (que não expõe bookmarks).

## 2026-07-24 — ciclo 2026-07-21-mvrv-sth-resistance-01 (MVRV-STH resistência)
- **Post:** preço encostando na Realized Price do STH — coorte de curto prazo perto do breakeven (zona de custo/oferta).
- **Sinal (+48h/66h):** impressões 17 · **bookmarks 0** (KPI, lido no ícone do post e do reply) · likes 0 · replies 1 (só a nossa/link) · reposts 0 · profile visits 1 · **detail expands 6** · engagements 9.
- **Leitura:** ⚠️ **4ª medição, alcance segue caindo: 36 → 33 → 20 → 17 impressões.** A queda é monotônica e agora inequívoca — o gargalo é distribuição, não conteúdo. Micro-sinal positivo isolado: **6 detail expands em 17 impressões** (quem alcança, ABRE pra ler — a densidade analítica retém), mas n~17 = 1–6 eventos, hipótese não conclusão. **Buraco operacional resolvido:** o painel básico de Post Analytics **não expõe bookmarks** — o KPI real se lê no **ícone do post** (fita). Contagem confirmada = 0 (post e reply).
- **Ação:** (1) Captura do KPI travada: bookmarks pelo ícone do post em toda coleta (não pelo painel). (2) Confirma (4ª vez) que o próximo passo é **reach/distribuição** (Tier A: replies em contas maiores, timing), não copy. Não otimizar texto com <~100 impressões/post. Hipótese a observar quando houver reach: posts de regime/coorte geram expands/retenção acima da média mesmo sem bookmark imediato (agora 5 e 6 expands nos dois últimos analíticos).

## 2026-07-23 — ciclo 2026-07-20-mvrv-cohort-01 (MVRV por coorte)
- **Post:** MVRV agregado esconde a divisão — STH abaixo do custo, LTH em lucro (divergência de coorte).
- **Sinal (+48h/60h):** impressões 20 · **bookmarks 0** (KPI) · likes 0 · replies 1 (só a nossa/link) · reposts 0. Reply teve 16 views.
- **Leitura:** ⚠️ **o alcance está CAINDO: 36 → 33 → 20 impressões** nos 3 posts. **3 medições → bookmark rate:** MVRV 2,8% (1/36), SOPR-LTH 0% (0/33), coorte 0% (0/20); blended 1,1% (1/89). n minúsculo → nada conclui sobre a copy. O sinal repetido e agora mais forte: **o gargalo é distribuição/alcance — e o alcance encolhe, não cresce.**
- **Ação:** o problema **não é o texto**; é **reach/audiência**. Postar diariamente sozinho não está construindo alcance. O próximo passo é **fora da linha editorial** (engajar/interagir com outras contas, timing, replies em terceiros) — não ajustar copy. Manter a disciplina de conteúdo, mas reconhecer que sem distribuição o experimento não gera dado.

## 2026-07-21 — ciclo 2026-07-18-sopr-lth-01 (SOPR-LTH)
- **Post:** SOPR-LTH abaixo de 1 em 26/29 dias — regime de realização de prejuízo dos long-term holders.
- **Sinal (+48h/59h):** impressões 33 · **bookmarks 0** (KPI) · likes 1 · replies 1 (só a nossa/link) · reposts 0 · profile visits 1 · detail expands 5 · engagements 19. _(Verificado no Post Analytics; placeholder "2/41" do X ignorado.)_
- **Leitura:** Alcance ainda quase nulo (33 impressões) → 0 bookmark é ruído estatístico, não veredito da copy. **2 medições agora → bookmark rate:** MVRV 2,8% (1/36) vs SOPR-LTH 0% (0/33); blended 1,4% (1/69). O SOPR-LTH teve MAIS sinais de "lean-in" (5 detail expands vs 2; 1 profile visit vs 0; engagements 19 vs 11) apesar de 0 bookmark — mas n~33 = 1–3 eventos, **hipótese a observar, não conclusão**.
- **Ação:** Confirma o 1º aprendizado — o gargalo é **distribuição/reach, não conteúdo**. Não otimizar copy com <~100 impressões/post. Seguir acumulando bookmark RATE por vários ciclos; hipótese a testar quando houver reach: posts analíticos (regime/coorte) podem gerar mais expands/visitas mesmo sem bookmark imediato.

## 2026-07-20 — ciclo 2026-07-16-mvrv-01 (MVRV)
- **Post:** MVRV 1,208 — regime de custo-base historicamente baixo (leitura de nível, sem previsão).
- **Sinal (+48h/60h):** impressões 36 · **bookmarks 1** (KPI) · likes 1 · replies 1 (só a nossa, com link → 0 orgânicos) · reposts 0 · profile visits 0. Reply teve 35 views.
- **Leitura:** Alcance quase nulo (36 impressões, conta nova) domina o resultado. Amostra pequena demais para julgar a copy. Bookmark rate ~2,8% e bookmarks = likes — levemente favorável ao nosso KPI, mas sem significância estatística. `analyst_saved: false` (não há evidência de que quem salvou seja analista; n insuficiente).
- **Ação:** NÃO ajustar ângulo/voz por causa desses números — o gargalo agora é **distribuição/audiência, não conteúdo**. Passar a acompanhar **bookmark RATE** (bookmarks/impressões) acumulado por vários ciclos antes de concluir sobre a linha editorial.
