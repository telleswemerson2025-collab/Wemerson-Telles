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
- **Orientação de atendimento enquanto não sai o fix:** o portfólio é só espelho (o dinheiro real está na
  corretora do cliente); orientar a corrigir na mão pra bater com a corretora, usando as Decisões como
  referência da posição correta.
- **Reportado por:** Mateus Izoton (#28/#46, 2 cobranças) e cliente Vitalício "Correção de registro" (10/09).

## 3. Notificação do app não dispara (RECORRENTE — SEVERIDADE MÉDIA/ALTA)
- **Bug:** clientes relatam **não receber a notificação de decisão** no app (um relatou "3ª vez"), só
  recebendo pelo e-mail. Impacto direto: cliente não sai/entra no momento da decisão e associa a
  "perda de dinheiro" (ex.: encerramento do DOT).
- **Contexto:** hoje o som/notificação é controlado pelo celular e não há seletor na plataforma; pode
  ter piorado com a migração. O e-mail funciona como 2º canal, mas o cliente espera o push confiável.
- **Fix sugerido:** garantir entrega confiável do push (revisar serviço de notificação/permissões),
  e deixar claro no app como ativar. Enquanto isso, reforçar que a decisão fica sempre no feed/Decisões.
- **Reportado por:** Bernardo (09/09, não chegou notificação) e VISADAL JR (09/09, "3ª vez", insatisfeito).
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

## Notas
- O "print não anexado" na varredura do Chrome é limitação da extensão de captura, não da plataforma.
- Sensível (link mágico, token, senha) NÃO entra aqui nem em nenhum arquivo da base.
