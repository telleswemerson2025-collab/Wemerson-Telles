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

## 3. Notificação do app não dispara (RECORRENTE — SEVERIDADE MÉDIA/ALTA)
- **Bug:** clientes relatam **não receber a notificação de decisão** no app (um relatou "3ª vez"), só
  recebendo pelo e-mail. Impacto direto: cliente não sai/entra no momento da decisão e associa a
  "perda de dinheiro" (ex.: encerramento do DOT).
- **Contexto:** hoje o som/notificação é controlado pelo celular e não há seletor na plataforma; pode
  ter piorado com a migração. O e-mail funciona como 2º canal, mas o cliente espera o push confiável.
- **Fix sugerido:** garantir entrega confiável do push (revisar serviço de notificação/permissões),
  e deixar claro no app como ativar. Enquanto isso, reforçar que a decisão fica sempre no feed/Decisões.
- **Reportado por:** Bernardo (09/09, não chegou notificação) e VISADAL JR (09/09, "3ª vez", insatisfeito).

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

## Notas
- O "print não anexado" na varredura do Chrome é limitação da extensão de captura, não da plataforma.
- Sensível (link mágico, token, senha) NÃO entra aqui nem em nenhum arquivo da base.
