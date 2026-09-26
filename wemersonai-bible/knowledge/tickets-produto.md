# Tickets pro time de produto (bugs / UX reportados no atendimento)

> Lista viva dos problemas de plataforma/app levantados pelos clientes no dia a dia, pra passar pro
> time de produto. Atualizar conforme aparecem novos. Última atualização: 09/09/2026.

## 1. Campo "Caixa"/valor aceita ponto sem validar → grava 100x (SEVERIDADE ALTA)
- **Onde:** aba Carteira/Portfólio, card "Caixa · Quanto você tem disponível" (e demais campos de valor).
- **Campo:** `<input type="text" inputmode="decimal">`, sem `pattern`/`maxlength`/máscara, placeholder `0,00`, parser pt-BR.
- **Bug:** digitar `390.06` (ponto) grava **US$ 39.006,00** (o ponto vira separador de milhar). Erro
  silencioso de 100x, sem aviso/validação. Valor inflado contamina resultado/aderência e chega a
  disparar "conquista" falsa (ex.: "maior patrimônio +2840%").
- **Agravante:** `inputmode="decimal"` mostra o separador do idioma do teclado; teclado em inglês nunca
  exibe a vírgula, então o cliente não consegue digitar certo e cai na autocorreção (ponto).
- **Fix sugerido:** normalizar `.` → `,` quando houver 2 casas após o separador; exibir o valor
  formatado em tempo real no campo antes de salvar; validar/alertar salto de ordem de grandeza.
- **Reportado por:** Daniel (07/09/2026). Confirmado no app logado.

## 2. Horário da publicação em fuso diferente de Brasília (SEVERIDADE BAIXA/MÉDIA)
- **Onde:** carimbo de horário das publicações/decisões no feed.
- **Bug:** o horário exibido parece estar em fuso diferente do horário de Brasília.
- **Fix sugerido:** exibir sempre em America/Sao_Paulo (horário de Brasília), ou deixar o fuso explícito.
- **Impacto:** não afeta a decisão em si (conteúdo/momento valem igual pra todos), só a exibição.
- **Reportado por:** Alexandre (09/09/2026).
- **Detalhe (11/09 — DC):** o horário aparece **ADIANTADO/no futuro** — post do encerramento do AERO marcava
  operação às 15h40 quando ainda eram 15h35 (mesmo no reforço do XRP da manhã). Ou seja, o carimbo está à
  frente do horário real de Brasília, dando impressão de "operação no futuro". Confirma que é fuso deslocado
  pra frente. O conteúdo/preço da decisão está correto; só a marcação de hora está errada.

## 2b. Ferramenta de Portfólio — sem histórico de registros / auditoria (SEVERIDADE ALTA)
- **Bug/lacuna:** o cliente **não consegue ver o histórico dos registros** de compra/venda que fez no
  portfólio, então não tem como conferir nem corrigir com segurança. O "Corrigir a Posição na Mão" não
  basta, porque não mostra o que foi registrado antes.
- **Sintomas relatados:** caixa no portfólio menor que o real; venda de DOT possivelmente registrada em
  **duplicidade ou errada**; fluxo confuso de **Registrar → Salvar** (apareceu mensagem de que não tinha
  clicado em Registrar, sem clareza se salvou 1x ou 2x).
- **Impacto:** sem histórico auditável, a ferramenta perde a confiança do cliente (reportado por cliente
  Vitalício). Some-se ao item 1 (campo de valor grava 100x) — os dois minam a mesma ferramenta.
- **Fix sugerido:** exibir um **histórico/extrato dos registros** (data, ativo, operação, valor) editável;
  clarear o fluxo Registrar/Salvar e evitar duplicidade; permitir reconciliação com as Decisões publicadas.
- **Sugestão de cliente (Robinson, 10/09):** incluir no portfólio o campo de **data de entrada e de saída**
  por ativo (parte do mesmo histórico/extrato pedido acima).
- **Orientação de atendimento enquanto não sai o fix:** o portfólio é só espelho (o dinheiro real está na
  corretora do cliente); orientar a corrigir na mão pra bater com a corretora, usando as Decisões como
  referência da posição correta.
- **Reportado por:** Mateus Izoton (#28/#46, 2 cobranças) e cliente Vitalício "Correção de registro" (10/09).
- **Mais casos (11/09) — cálculo do preço médio errado:** Jonny (digita XRP US$1,44 → preço médio vira
  US$1.444,00; ponto e vírgula dão o mesmo erro) e Franciedson (preço médio não valida 1,41 nem 1.41). Ou
  seja, o campo de preço no registro de compra está multiplicando/parseando errado (mesma raiz do item 1).
- 🔥 **VIROU MASSIVO no post "Reforço em XRP" (11/09):** além dos acima, Ricardo de Andrade Arruda ("preço
  médio multiplicado por 10"), Sandro Rodrigues Costa ("não considera as casas decimais do XRP") e Samuel
  ("não consigo separar por . nem por ,"). É o mesmo bug do separador decimal / cálculo do preço médio,
  atingindo muitos clientes ao registrar o reforço do XRP (preço com 2 casas). **Prioridade ALTA** — está
  minando a confiança na ferramenta em escala. Provável causa: parser trata o separador como milhar (x100/
  x1000) e/ou não aceita o decimal, dependendo do idioma do teclado.

## 3. Notificação do app não dispara (RECORRENTE — SEVERIDADE MÉDIA/ALTA)
- **Bug:** clientes relatam **não receber a notificação de decisão** no app (um relatou "3ª vez"), só
  recebendo pelo e-mail. Impacto direto: cliente não sai/entra no momento da decisão e associa a
  "perda de dinheiro" (ex.: encerramento do DOT).
- **Contexto:** hoje o som/notificação é controlado pelo celular e não há seletor na plataforma; pode
  ter piorado com a migração. O e-mail funciona como 2º canal, mas o cliente espera o push confiável.
- **Fix sugerido:** garantir entrega confiável do push (revisar serviço de notificação/permissões),
  e deixar claro no app como ativar. Enquanto isso, reforçar que a decisão fica sempre no feed/Decisões.
- **Reportado por:** Bernardo (09/09, não chegou notificação) e VISADAL JR (09/09, "3ª vez", insatisfeito).
- **Latência (novo, 10/09 — Atamai):** quando o push chega, chega **muito atrasado** — caso medido: e-mail
  às 9:05 e o aviso do app só às **9:40** (~35 min). Pra carteira que depende de tempo, inviabiliza. Cliente
  pede **reativar o app antigo** pras notificações (dizia ser mais eficiente). Push do app novo (via Chrome/
  PWA) está lento; priorizar a entrega em tempo real. Enquanto isso, o e-mail tem chegado ANTES do push.
- **iOS 27 (novo, 15/09 — Thiago Mata):** após atualizar pro **iOS 27**, o push **parou de chegar**. Provável
  causa: a atualização grande do sistema **reseta as permissões de notificação** do app (comum em PWA no iOS).
  Workaround ao cliente: reinstalar o app + reativar notificações com som nos Ajustes do iOS + fazer o teste
  (mesmo procedimento oficial). Acompanhar se vira padrão em clientes de iPhone que atualizarem pro iOS 27.
- **Workaround oficial (orientação do Gui pro time, 09/09):** pedir pro cliente **desinstalar e reinstalar
  o app**, seguindo o **manual de ativação das notificações**. (Enquanto o fix definitivo não sai.)

## 4. Migração de domínio — efeitos colaterais no acesso (ACOMPANHAR durante a troca)
Itens ligados à troca de domínio em curso, que devem sumir quando a migração terminar:
- **Site "reconectando pra sempre" / não abre:** endereço antigo preso em loop de reconexão.
  Workaround ao cliente: aba anônima, outro navegador, dados móveis, ou entrar pelo link mágico direto.
- **Vídeos dos cursos com "entrar em contato com o responsável":** possível quebra de player por
  restrição de domínio (player liberado só no endereço antigo). Reportado por Paulo (08/09).
- **Aulas/Academy sumiram do app antigo:** conteúdo sendo migrado pro ambiente novo; deve voltar.
  Reportado por Eric (08/09).
- ✅ **CAUSA CONFIRMADA PELO GUI (15/09, 12:40):** o **servidor dos vídeos do APP ANTIGO está com problema** —
  por isso o curso/aulas não abrem por lá. **Por ora SEM prazo de retorno.**
- ⚠️ **DISTINÇÃO IMPORTANTE (esclarecido pelo Wemerson, 20/09) — NÃO confundir dois conteúdos diferentes:**
  - **VÍDEOS DE GERENCIAMENTO = DISPONÍVEIS.** Saem **no feed, toda segunda-feira**, junto com o acompanhamento da
    carteira. Estão no ar normalmente. Pode orientar o cliente a ver no feed, às segundas. **NÃO** entram na regra
    do "sem previsão".
  - **CURSOS / AULAS / TREINAMENTO = EM TRANSIÇÃO, SEM PREVISÃO.** É SÓ este conteúdo (o curso, "treinamento em
    análise", Academy) que **não tem data pra ir pro app novo** (recomendação do Gui). O do app antigo está fora
    pelo problema de servidor. **NÃO mandar o cliente procurar as AULAS/CURSO no app novo** — não estão lá. Ser
    honesto: sem prazo definido, a gente avisa quando voltar. Nunca prometer data.
- **Busca na loja acha só o "app antigo" (GuiTelles):** cliente não encontra o app certo. Orientação
  atual: usar a plataforma nova pelo navegador + botão "Instalar" (PWA), não o app da loja. Reportado
  por Fernando (08/09).
- **Fix/ação:** confirmar que, ao concluir a migração, players de vídeo, aulas e links estão liberados
  no domínio novo; e alinhar a comunicação de qual é o app/caminho oficial de acesso.
- **Domínio sinalizado como phishing (CAUSA RAIZ — prioridade):** vários fornecedores de segurança
  (VIPRE, alphaMountain, BrightCloud, FortiGuard) sinalizaram o domínio. Ação correta: **reportar o
  falso-positivo/pedir reclassificação a cada fornecedor** (já há tickets abertos com eles na caixa) e
  garantir SPF/DKIM/DMARC do domínio novo. ⚠️ E **parar de escrever e-mails com cara de phishing** —
  nunca pedir pro cliente "sair da rede" ou "liberar/desligar o antivírus" (isso reforça o flag e treina
  o cliente pro golpe). Ver onboarding-boas-vindas.md (frases removidas em 10/09).

## 6. App/site QUEBRA ao navegar; só volta reiniciando o celular (SEVERIDADE ALTA — ACOMPANHAR)
- **Relato (David Ramiris, 19–20/09):** consegue acessar, mas ao **navegar pelo app ou pelo site a tela quebra**
  e trava; só volta a funcionar **reiniciando o celular** e entrando de novo. Recorrente pra ele.
- **Provável causa:** instabilidade da migração/PWA (relacionado ao item 4 — loop de reconexão/domínio). Pode ser
  cache antigo, sessão presa, ou o app novo (PWA) travando em navegação.
- **Workaround ao cliente:** reinstalar o app do zero (limpar dados do site/cache antes), testar em aba anônima ou
  outro navegador, e entrar pelo link mágico direto. Se persistir, escalar pro time técnico com modelo do aparelho,
  navegador/versão e print da tela de erro.
- **Ação:** coletar device + navegador + print e passar pro time. Acompanhar se vira padrão em mais clientes.
- **CONFIRMADO (20/09, print do David):** a tela que aparece é o **loop "Reconectando"** ("Estamos restabelecendo a
  conexão... a página volta sozinha", botão "Tentar agora") — é o **mesmo loop de reconexão do item 4**, disparando
  na **navegação entre abas** no Xiaomi. No Samsung do mesmo cliente NÃO acontece. Ou seja: item 6 = manifestação
  do loop de reconexão (item 4) em aparelho/navegador específico. Workaround que resolve: usar outro aparelho
  (Samsung funcionou), limpar cache/atualizar Chrome/reinstalar no aparelho afetado.

## 5. Instalar o app novo (PWA) é pouco intuitivo pro usuário novo (SEVERIDADE MÉDIA — UX)
- **Relato (Chagas Franci, 19/09):** o cliente procurou o botão "Instalar" DENTRO do app e não achou; na verdade
  a instalação usa o **botão de compartilhar do próprio celular/navegador** (fluxo PWA), o que não é óbvio. Ele
  só conseguiu depois de entender isso. Pedido dele: **deixar mais claro/intuitivo pra novos usuários** como
  baixar e adicionar o app à tela de início.
- **Fix sugerido:** na página do manual/instalação, instrução visual explícita por sistema (iOS: botão
  Compartilhar → "Adicionar à Tela de Início"; Android: menu → "Instalar app"), já que não é um botão dentro do app.
- **Ação de atendimento:** ao orientar instalação, explicar que o "Instalar" é pelo navegador/compartilhar, não
  dentro do app, pra evitar essa confusão.

## 8. "Mostrar a valorização SEM os aportes" — COMO RESPONDER (orientação do Wemerson, 23/09)
Alguns clientes pedem pra ver a performance isolada dos aportes (Leonardo Fortunato). **Resposta oficial:** não
faz sentido separar, porque **os aportes são o que construiu a carteira**. Ela começou praticamente do zero, com
US$200; sem os aportes não haveria patrimônio nenhum (seria zero). Aporte e valorização andam juntos, um não
existe sem o outro, então não é "ruído" a ser removido.
- **Pra o cliente ver quanto de fato rendeu (o lucro):** conta simples → **valor atual da carteira − total
  aportado**. O total aportado do modelo, até aqui, é de **cerca de US$23 mil**. A diferença é o lucro/valorização.
- Não prometer um gráfico/recurso de "valorização isolada" — a orientação é ensinar essa conta. (O campo "Retorno"
  também reflete a valorização das posições abertas, mas a conta acima é o jeito direto de ver o ganho real.)

## 7. Sugestão: mostrar o STOP de cada ativo na aba Carteira/posição (MELHORIA — UX)
- **Sugestão (Tiago Figueira da Cruz, 20/09):** na visão de posição/gráfico da aba Carteira, exibir se o ativo
  **tem stop programado e qual o valor**. O cliente acha a informação útil pra acompanhar direto ali.
- **Valor:** hoje o stop só aparece no post da decisão no feed; ter no card da posição centraliza a info e evita
  o cliente ter que caçar no histórico. Boa pra reduzir dúvidas recorrentes de "qual o stop do ativo X".
- **Encaminhar pro time de produto.** ⚠️ **Pedido reforçado (Flavio Machado, 23/09):** mesma solicitação, uma
  **coluna com os pontos de stop na tabela da página "Carteira"**, porque às vezes é difícil achar no feed a
  publicação com os stops. Já são 2+ clientes pedindo, aumenta a prioridade.

## Notas
- O "print não anexado" na varredura do Chrome é limitação da extensão de captura, não da plataforma.
- Sensível (link mágico, token, senha) NÃO entra aqui nem em nenhum arquivo da base.
