# distribution.md — Frente de distribuição (Tier A)

Estratégia de **alcance** da VantageNode-X no X. Editável pelo Mr. G (é markdown, não código).

> **Por que este arquivo existe.** Em 5 ciclos medidos, o alcance caiu de forma monotônica
> (36 → 33 → 20 → 17 → 15 impressões) e o KPI real (bookmark) ficou em 1/121 = 0,83%, todo do 1º post.
> Diagnóstico gravado em `memory/learnings.md`: **o gargalo não é conteúdo, é distribuição.** Postar
> sozinho não constrói audiência. Esta frente ataca o denominador (quantas pessoas veem), não o texto.

## Regra-mãe desta frente (inviolável)

> **NENHUM reply vai ao ar sem aprovação do Gui.** Este arquivo é só critério e estratégia. O pipeline
> pode **rascunhar** replies (na nossa voz, sobre um post de terceiro), mas publicar exige o **mesmo tipo
> de gate humano** dos posts (invariante 7 adaptado). Nenhum agente publica reply em nome do humano.

Vale também tudo do arquivo-mãe: sem emoji/hype e **sem travessão (em dash)** (inv. 8), número =
gráfico = fonte (inv. 6), sem previsão de preço (inv. 5), **voz humanizada e acessível** (ver `brand-voice.md`).

> **Nota sobre link (atualização de 25/07/2026):** no NOSSO post o link agora pode ir no corpo (inv. 3 mudou).
> Mas em **reply na casa de terceiro** a regra é outra e continua valendo: **não** despejar link (é spam e
> queima reputação). São coisas diferentes: link no nosso post = ok; link no reply a estranho = evitar.

---

## 1. Critérios de escolha de conta

### Quem ENTRA (conta-alvo Tier A)
- **Conta grande de conteúdo/educação BTC ou macro** com audiência de gente que lê análise — não de
  gente que caça sinal de trade.
- **Publica takes/threads que se beneficiam de um dado onchain** como complemento (preço, ciclo, holders,
  custo-base). Ou seja: há **gancho natural** pra nossa leitura entrar somando.
- **Engajamento real** (replies com discussão, não só likes), audiência **no nicho** (BTC/onchain/macro),
  e **tom compatível** com o nosso (analítico, não cassino).
- **Modera a própria seção de replies** minimamente (não é um esgoto de spam onde nada é lido).

### Quem NÃO entra (bloqueio)
- **Concorrente direto de ferramenta onchain / analytics.** ⛔ Regra dura: não fazemos reply em conta que
  **vende o mesmo produto** que a VantageNode (plataformas de métricas onchain, dashboards concorrentes,
  serviços de sinal pagos). Some reputação zero e ainda entrega leitura pro concorrente.
- **Contas de hype/pump, "call" de trade, moon/lambo, shill de altcoin.** Público errado, associação errada.
- **Contas de polêmica/drama** (rage-bait, política tóxica) — o alcance vem, mas contamina a marca.
- **Influencer genérico sem nicho** (audiência dispersa não converte pra "quem salvaria um dado").
- **Contas onde o dado não agrega** (o post não tem gancho pra onchain — forçar seria spam).

### Teste de uma linha (antes de adicionar uma conta)
> "A audiência **desta** conta contém analistas/curiosos de BTC que **salvariam** um dado onchain bem lido —
> e esta conta **não vende o nosso produto**?" Se não for um **sim** claro nas duas, não entra.

---

## 2. Critérios do reply (o que agrega × o que queima)

### ✅ Agrega valor (pode rascunhar pro gate do Gui)
- **Traz um dado/leitura onchain que soma ao ponto do autor**, na nossa voz de terminal. Ex.: o autor fala
  "mercado incerto" → a gente entra com "o SOPR agregado acabou de cruzar o breakeven (0,9876 → 1,0004):
  saiu do prejuízo, mas os LTH não acompanharam". Complementa, não contradiz por esporte.
- **Número com contexto** (nunca valor solto), com a mesma disciplina do post (inv. 4 e 6).
- **Curto e denso.** Um reply é ainda mais implacável que um post — uma ideia, sem rodeio.
- **Autossuficiente sem link.** O corpo do reply a terceiro **não leva link** (norma anti-spam desta frente, não a inv. 3, que é só sobre o nosso próprio post). Se a pessoa quiser a fonte,
  ela pergunta ou visita o perfil — e é aí que o perfil (bio + posts fixados) faz o trabalho de conversão.
- **Respeitoso e de nível.** Fala com quem lê como um par que entende, não como quem quer aparecer.
- **Honesto quando o dado não confirma a tese do autor** — discordar com dado, com hedge (inv. 5), constrói
  mais autoridade que concordar por bajulação.

### ❌ Queima reputação (não fazer — nem rascunhar)
- **Link no corpo do reply** (spam clássico; mata alcance e vira "self-promoter"). Link só se o Gui decidir,
  e mesmo assim **nunca** como primeira interação numa conta.
- **Copiar/colar** a mesma leitura em várias contas (padrão de bot → shadowban de replies).
- **"Ótimo post! 🚀"** / elogio vazio / emoji / hype — ruído, invariante 8.
- **Corrigir o autor com arrogância** ou brigar nos comentários (drama = alcance tóxico).
- **Previsão de preço** pra parecer ousado (inv. 5). Nunca.
- **Reply fora de contexto** (encaixar nosso dado à força onde não cabe) — é spam disfarçado.
- **Vender a VantageNode** no reply. A gente entrega leitura; o produto se vende pelo perfil, não pelo pitch.

### Fluxo de um reply (com gate)
```
post de terceiro (conta Tier A)  ->  Claude rascunha reply na nossa voz (dado + contexto, sem link)
   ->  [GATE GUI: aprova / ajusta / descarta]  ->  Mr. G publica manualmente o reply aprovado
   ->  registra no tracker (conta, link do post, texto, data)  ->  +48h: mede o efeito
```

---

## 3. Como medir se está funcionando

O reply não tem "bookmark" como KPI — o objetivo dele é **te fazerem conhecido** e **trazer gente pro perfil**.
Métricas do reply (lidas no Post Analytics do reply + no perfil), por reply publicado:

| Métrica | O que diz | Onde ler |
|---|---|---|
| **Impressões do reply** | quantos viram nossa leitura na casa alheia | Post Analytics do reply |
| **Visitas ao perfil** (atribuídas) | quantos se interessaram a ponto de clicar no @ | Post Analytics / painel |
| **Novos seguidores** (na janela) | conversão real de alcance → audiência própria | painel de conta / follows |
| **Likes/replies de terceiros** | ressonância (o reply "pegou" na conversa) | no próprio reply |
| **Impressões dos NOSSOS posts** nos dias seguintes | se a audiência nova aumenta o denominador | série em `memory/learnings.md` |

**Leitura de sucesso (hipótese a validar):** um reply Tier A bom gera **profile visits > 0 e, ao longo de
vários, novos seguidores** — e a série de impressões dos nossos posts **para de cair e começa a subir**.
Meta mínima honesta pra começar: **inverter a curva 36→…→15**. Se depois de N replies o perfil não recebe
visitas nem seguidores, a conta-alvo ou o formato do reply está errado — troca, não insiste.

> Regra de amostragem (mesmo espírito do FEEDBACK): com n minúsculo, **não** concluir de 1 reply. Acumular
> profile-visits/reply e followers/reply por várias interações antes de julgar. Registrar cada reply.

### Tracker (sugestão de arquivo)
Cada reply publicado vira uma linha em `memory/distribution-log.md` (a criar no 1º reply):
`data | conta | link do post | resumo do nosso reply | impressões | profile visits | novos seguidores | notas`

---

## 4. Estratégia pra ganhar mais visualizações (começo pequeno: 2 contas)

1. **Foco, não volume.** Começamos com **2 contas** Tier A. Melhor 2 bem escolhidas e 1 reply certeiro/dia
   do que 10 contas e ruído. Escala só depois de ver sinal.
2. **Presença, não invasão.** ~1 reply de qualidade por conta, quando **há gancho real** — não em todo post.
   Estar presente de forma consistente e útil > estar em todo lugar.
3. **Timing.** Entrar **cedo** num post que está subindo (primeiros minutos/hora) coloca nossa leitura no
   topo dos replies, onde é vista. Reply tardio em post morto não alcança.
4. **O perfil faz a conversão.** Antes de escalar replies, garantir que **bio + post fixado** deixem claro
   em 1 segundo o que a VantageNode entrega (leitura onchain, terminal). O reply traz a visita; o perfil
   decide o follow. _(Ação paralela: revisar bio/pinned — fora do escopo deste arquivo, mas pré-requisito.)_
5. **Consistência analítica.** Toda interação reforça a mesma identidade: dado + leitura, sem hype. É isso
   que faz alguém pensar "essa conta sempre traz um número que importa" e seguir.
6. **Medir e podar.** A cada ~2 semanas, olhar o tracker: a conta-alvo que não gera visita/follow sai; a que
   gera, ganha mais atenção. Distribuição é experimento, não fé.

---

## 5. Sugestão: 2 TIPOS de conta pra começar

_(Arquétipos, não @handles — a escolha final dos perfis reais é do Mr. G/Gui. A ideia é cobrir dois
ângulos complementares de audiência sem tocar em concorrente de ferramenta onchain.)_

### Tipo A — Educador/analista BTC de alcance médio-alto (conteúdo, não sinal)
- **Perfil:** conta que **ensina/explica** Bitcoin e ciclos pra um público que quer entender (não que quer
  call de trade). Threads didáticas, gráficos, história de ciclo.
- **Por que:** a audiência é exatamente **"quem salvaria um dado bem lido"**. Nosso reply onchain
  (MVRV/SOPR/NUPL com leitura) é o complemento natural de um post educativo — soma, não compete.
- **Gancho típico:** o autor explica "custo-base"/"realized price"/"holders" → a gente entra com o número
  atual e a leitura de regime.
- **Não é concorrente:** vende conteúdo/educação/atenção, **não** uma ferramenta de métricas onchain.

### Tipo B — Comentarista macro/mercado com viés de dado (não-maximalista de hype)
- **Perfil:** conta que comenta **mercado/macro** (liquidez, ciclo, risco) de forma analítica, com audiência
  que respeita número e contexto — não a galera de "pump".
- **Por que:** posts de macro/incerteza têm **gancho perfeito** pra uma leitura onchain que aterrissa o
  abstrato num dado concreto (ex.: "o estresse de realização está cedendo — SOPR cruzou o breakeven").
- **Gancho típico:** o autor fala de risco/indecisão de mercado → a gente traduz em onchain com hedge.
- **Não é concorrente:** comenta/opina, **não** vende dashboard/métricas.

> **Complementaridade:** o Tipo A nos põe na frente de quem **quer aprender** (tende a seguir uma fonte
> consistente de dado); o Tipo B nos põe na frente de quem **já opera com tese** (tende a salvar/citar um
> dado que sustente o argumento). Dois funis diferentes pro mesmo perfil.

### Próximo passo (com o Gui)
1. Gui/Mr. G escolhe **1 conta real de cada tipo** (2 no total), passando os @handles — o Claude Code
   **não** escolhe perfis reais sozinho (risco de errar pessoa/enquadrar concorrente).
2. Confirmar que **nenhuma das duas** vende ferramenta onchain concorrente (teste da seção 1).
3. A partir daí, quando uma delas postar algo com gancho, o Claude **rascunha** um reply pelos critérios da
   seção 2 → **gate do Gui** → Mr. G publica → tracker → +48h mede.
