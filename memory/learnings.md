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

## 2026-07-26 — FEEDBACK (coleta de 4 posts): reach parou de cair, batismo oficial reagiu
- **Coletado (views públicos; painel de analytics inacessível, então impressions = views; bookmarks lidos na tela):**
  - NUPL (23/07, teste): 24 views, 1 like, 1 reply (nossa), 0 repost, **0 bookmark** (final, ~73h).
  - SOPR breakeven (24/07, teste): 24 views, 0 like, 1 reply (nossa), 0 repost, **0 bookmark** (final, ~56h).
  - Weekend v2 teste (25/07, @VantageNodvt): 15 views, 0 like, 0 reply, 0 repost, **0 bookmark** (parcial ~30h).
  - Weekend v2 oficial (25/07, @VantageNodeio, BATISMO): 24 views, 2 likes, 0 reply, 0 repost, **0 bookmark** (parcial ~25h).
- **Revisão de conclusão:** a "queda monotônica" que eu vinha registrando (36, 33, 20, 17, 15) **não se sustentou**. Com NUPL e SOPR breakeven em 24, a série vira 36, 33, 20, 17, 15, 24, 24: o reach **estabilizou na faixa ~15-24 views**, não continuou caindo. Piso não é zero. (n minúsculo: é tendência fraca, não lei.)
- **Batismo da conta oficial reagiu bem (parcial):** a @VantageNodeio, começando do ZERO, já igualou/superou o reach da conta de teste (24 vs 15) e teve **2 likes, o maior engajamento de qualquer post da série**, provavelmente puxado pelo **compartilhamento no WhatsApp**. Primeiro sinal concreto de que distribuição fora do X (empurrão manual) move o ponteiro mais do que postar no vácuo.
- **KPI real:** bookmark segue **0** em todos; o único bookmark de toda a história continua sendo o do 1º post (MVRV). Conteúdo não é o gargalo; alcance/distribuição é.
- **Ação:** confirma a prioridade da frente Tier A (2 @handles) e o valor de empurrões de distribuição fora do X. Os posts de fim de semana têm leitura FINAL pendente no +48h (triggers de 27/07).

## 2026-07-25 — REVERSÃO DA INVARIANTE 3: link volta pro primeiro reply (decisão do Gui)
- **O que mudou:** o Gui revisou e decidiu que o **link externo NÃO vai mais no corpo do post**. O corpo fica sem link; o link (ex.: `vantagenode.io/terminal`) vai no **primeiro reply**. Isso **reverte** a permissão de "link no corpo" registrada mais cedo no mesmo dia.
- **Por quê:** link no corpo **derruba o alcance**. O algoritmo do X rebaixa posts que tiram o usuário da plataforma. Priorizar reach (que é o nosso gargalo) pesa mais do que a conveniência do link no corpo.
- **Onde foi gravado:** CLAUDE.md (invariante 3), knowledge/brand-voice.md (nota de topo + micro-regras), agents/03-voice.md, agents/04-gatekeeper.md (volta a bloquear link externo no corpo), schemas/copy.schema.json, .claude/commands/voice.md, knowledge/distribution.md.
- **Escopo:** vale só para os **próximos** posts. Os já publicados com link no corpo (`2081089146026647741` na @VantageNodvt e `2081163282233131517` na @VantageNodeio, o batismo) **ficam como estão**, o X não deixa editar o corpo depois de publicado.
- **A observar no FEEDBACK:** os dois posts de batismo têm link no corpo. Quando as métricas chegarem, comparar o reach deles com os próximos posts (link no reply) pode dar um sinal prático sobre o tamanho do efeito do link no corpo. Sem números inventados até coleta.

## 2026-07-26 — SETUP VISUAL DA @VantageNodeio CONCLUÍDO (ao vivo no X)
- **Status:** ✅ tarefa "revisar bio + avatar da @VantageNodeio" **CONCLUÍDA**. Perfil oficial está ao vivo.
- **Bio aplicada:** "Inteligencia onchain de Bitcoin, direto da blockchain e sem tecniques. A gente le os holders, nao a vela. Nada aqui e recomendacao." (nota: "A gente le os holders, nao a vela" ecoa a voz humanizada e o post de batismo; o disclaimer "Nada aqui e recomendacao" fixa a invariante 5 no perfil.)
- **Website:** vantagenode.io (campo oficial preenchido).
- **Data de nascimento:** REMOVIDA (conta de marca, sem data pessoal).
- **Banner:** aplicado (`assets/branding/x-header-vantagenodeio-1500x500.png`, commit 0203f86).
- **Avatar:** logo V (o emblema entregue).
- **Efeito na distribuição:** o "perfil que converte a visita em follow" (ver `distribution.md` seção 4) agora está pronto. Pré-requisito da frente Tier A **destravado**. Pendência restante do perfil: post fixado (pinned) ainda não confirmado (opcional, pode ser o post de batismo).
- **Caminho crítico que sobra:** os **2 @handles do Tier A** (dependem do Mr. G / Gui). Sem números aqui: métricas seguem pendentes.

## 2026-07-25 — BATISMO DA CONTA OFICIAL @VantageNodeio (primeiro post)
- **O que aconteceu:** o post v2 "sábado, liquidez fina" (SOPR 1,0004 / MVRV-STH 0,954 / NUPL-STH -0,032) virou o **primeiro post da conta oficial `@VantageNodeio`** (post_id `2081163282233131517`, publicado 25/07 20:42 UTC). Mesmo conteúdo foi ao ar também na conta de teste `@VantageNodvt` (post_id `2081089146026647741`) = **cross-post idêntico**, mesmo GATEKEEPER 9/9.
- **Distribuição extra:** o Mr. G compartilhou o post oficial no **WhatsApp** (primeiro empurrão de alcance fora do X).
- **Baseline nova:** o alcance da `@VantageNodeio` **começa do zero**. A série histórica (36, 33, 20, 17, 15) é da conta de teste e **não** serve de comparação direta.
- **Experimento natural:** mesma copy/imagem em duas contas com audiências diferentes. Quando as métricas chegarem (duas janelas +48h: teste 27/07 18:56 UTC, oficial 27/07 20:42 UTC), dá pra comparar reach/engajamento entre elas. Ressalva: o compartilhamento no WhatsApp pode inflar as primeiras impressões da oficial, considerar isso na leitura.
- **Ação:** a partir daqui, todo ciclo novo publica na `@VantageNodeio`; a frente Tier A passa a construir a audiência dela. Métricas: **pendentes** até o Mr. G coletar (nada inventado).

## 2026-07-25 — MIGRAÇÃO DE CONTA (operacional, não é ciclo)
- **O que mudou:** o Gui definiu a **conta oficial** da marca no X como **`@VantageNodeio`** (e-mail contato@vantagenode.io). A antiga **`@VantageNodvt`** era só de **teste** e deixou de ser a principal.
- **Efeito no pipeline:** todo post/ciclo NOVO publica em `@VantageNodeio`. Handle oficial registrado em CLAUDE.md, positioning.md e distribution.md.
- **Histórico preservado:** os ciclos já publicados na `@VantageNodvt` (16/07 a 25/07, incluindo o v2 weekend-liquidity) **ficam intactos** no repo como referência de teste. Não migrar nem apagar. Os `05_published.json`/`06_metrics.json` desses ciclos seguem apontando para as URLs reais em `x.com/VantageNodvt/...` (é onde os posts realmente estão).
- **Consequência p/ métricas:** a série de alcance de teste (36, 33, 20, 17, 15) é da `@VantageNodvt`. A conta nova começa praticamente do zero de audiência: o gargalo de distribuição continua, e a frente Tier A passa a mirar em construir a `@VantageNodeio`.
- **Triggers de FEEDBACK pendentes** (SOPR breakeven 24/07 e weekend v2 25/07) continuam apontando para os posts na `@VantageNodvt`, pois é onde esses posts específicos vivem. Correto manter.

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
