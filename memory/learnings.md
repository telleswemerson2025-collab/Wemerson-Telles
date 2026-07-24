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

## 2026-07-24 — ciclo 2026-07-21-mvrv-sth-resistance-01 (MVRV-STH resistência)
- **Post:** preço encostando na Realized Price do STH — coorte de curto prazo perto do breakeven (zona de custo/oferta).
- **Sinal (+48h/66h):** impressões 17 · **bookmarks n/d** (KPI inaudível no painel básico) · likes 0 · replies 1 (só a nossa/link) · reposts 0 · profile visits 1 · **detail expands 6** · engagements 9.
- **Leitura:** ⚠️ **4ª medição, alcance segue caindo: 36 → 33 → 20 → 17 impressões.** A queda é monotônica e agora inequívoca — o gargalo é distribuição, não conteúdo. Micro-sinal positivo isolado: **6 detail expands em 17 impressões** (quem alcança, ABRE pra ler — a densidade analítica retém), mas n~17 = 1–6 eventos, hipótese não conclusão. **Buraco operacional:** o painel básico de Post Analytics **não expõe bookmarks** — nosso KPI real ficou n/d. Ação: passar a ler a contagem de bookmarks no **ícone do post** (fita), não só no painel.
- **Ação:** (1) Consertar a captura do KPI — bookmarks pelo ícone do post em toda coleta. (2) Confirma (4ª vez) que o próximo passo é **reach/distribuição** (Tier A: replies em contas maiores, timing), não copy. Não otimizar texto com <~100 impressões/post. Hipótese a observar quando houver reach: posts de regime/coorte geram expands/retenção acima da média mesmo sem bookmark imediato (agora 5 e 6 expands nos dois últimos analíticos).

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
