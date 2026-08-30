# GATES DA CARTEIRA SEMENTE
Nenhum agente aprova. Só o humano.
Versão 1.19 · 29/08/2026 — Decisões 1 a 22 e 44 a 48 aplicadas.

## GATE 1 — DIREÇÃO (antes de produzir)
Perguntas:
1. A leitura tem tensão real ou é ruído?
2. É o momento certo para mexer, ou é ansiedade?
3. A proposta respeita a tese do ciclo (acumular no desânimo, colher na alta)?
4. O horizonte foi considerado — quantos anos faltam para a entrega?
5. Vale dizer isto ao cliente, ou é barulho?

→ Aprova a direção ou pede outra.

## GATE 2 — EXECUÇÃO (depois do risco)
Checklist. Qualquer item falho VETA:
1. **Coerência numérica** — todo número bate com a fonte (tooltip/terminal), não com a memória.
2. **Número derivado calculado, não digitado** — média, percentual, projeção e posição normalizada
   vêm do instrumento que calcula. Se documento e instrumento divergem, o documento está errado.
3. **Risco de chamada de preço** — nenhuma promessa de retorno, nenhuma previsão. *Falha aqui veta sempre.*
4. **Uma ideia só** — o segundo insight vira outro ciclo.
5. **Hierarquia de leitura** — o estado citado é o da Linha d'Água; o Índice Semente aparece como
   intensidade, nunca como classificador de estado nem como gatilho de decisão.
6. **Modulação dentro do teto** — o aporte proposto fica entre 0% e 100%, não invade o patamar de
   um estado vizinho, e com Abrigo ativo não sobe acima do que o Abrigo travou.
7. **Reforço de fundo** — se houver, as sete travas foram conferidas uma a uma, o contador do
   ciclo veio de registro GRAVADO, e ele chegou como decisão SEPARADA do aporte do mês. Misturar
   os dois fluxos veta; contar acionamentos de memória veta.
8. **Confiança por janela** — séries curtas entraram amortecidas; a confiança aparece ao lado do
   valor.
9. **Tela renderizada e olhada** — nenhuma tela é dada por pronta sem ser aberta e lida. *Rodar o
   teste não substitui abrir a página:* três erros deste pacote passaram por toda a suíte e só
   apareceram na tela — a data no comando de conferência, o rótulo da trava 3 dizendo 3 com o
   sistema bloqueando a 4, e o charset ausente nas quatro telas. **Todo rótulo com número foi
   gerado da constante** (invariante 12), e **a tela declara `<meta charset="utf-8">`** antes do
   primeiro acento. Decisão 44. **E o que entrou no commit é conferido, não suposto** — `git show
   --stat` depois de cada gravação, porque um `cd` errado já deixou arquivo de fora duas vezes, e as
   duas custaram correção. *Olhar o que ficou vale para a tela e vale para o commit.*
10. **Teste de conferência novo foi visto reprovando** — quebrou-se de propósito o que ele deveria
   pegar, ele acusou com a linha e o valor esperado, e o que foi quebrado ficou registrado em
   `provas.mjs`. Teste que entra sem essa passagem **veta**: passar por vazio é pior que não
   existir. Decisão 45. **A asserção liga, não procura** — nunca "este número existe no
   documento", sempre "este número está ligado a esta regra, nesta linha" (Decisão 46). E a prova
   confere a **mensagem** da falha, não só que falhou. **A mutação mira ponto de uso único** — ou muta
   todos os gêmeos de uma vez — **e a prova nomeia a asserção que acusou** (Decisão 47). Mira
   ambígua ou asserção trocada **veta a prova**, não o teste. **E a asserção nasce da intenção, nunca
   da saída** (Decisão 48): confere o que a frase precisa dizer, não o texto que ela por acaso teve.
   E o padrão da prova **tem de casar com um teste**: padrão órfão sai com zero e prova por vazio.
11. **Medida citada como razão de decisão tem asserção** — todo número que aparece na justificativa
   de uma decisão registrada ganha teste que quebra se ele mudar, e a mensagem **nomeia a decisão
   que precisa ser refeita**. Medida sem asserção **veta**: a razão escrita sobrevive à medida que
   a sustentava, e ninguém percebe. Decisão 52 D.
9. **Camada 5 rotulada** — se está fora, a leitura diz que está fora, e nunca a apresenta valendo
   50. Se está dentro, vem com a etiqueta de julgamento completa: que carrega julgamento humano, a
   data do degrau mais antigo em vigor, e quantos ativos estão sem degrau. Faltando qualquer uma
   das três, veta. Degrau com mais de 180 dias é ausência, nunca valor em vigor. Se o degrau de BTC
   ou de ETH estiver vencido, a camada sai SUSPENSA e nomeada, com a data — camada calculada sem um
   deles veta.
10. **Peso e caixa** — o peso resultante respeita o limite; o caixa não fica abaixo do mínimo.
11. **Abrigo** — se faltam 3 anos ou menos, a exposição respeita a glidepath. *E no último ano a
    banda afunila de 3 a zero (D51 A): tolerância que sobrevive à entrega é folga sobre a promessa
    central, não tolerância.*
12. **Fatia tática** — se houver, opera só com ganho realizado, nunca com o principal, e no máximo 5–10%.
13. **Voz** — sem hype, sem emoji, Teste da Amiga passa, sem `=` e `≠`.
14. **Rótulo de dado** — nada ilustrativo apresentado como real. Projeção traz a data, o estado, o
    índice, a fase E o mês de entrada que a geraram; simulação com partida trocada à mão sai
    marcada como hipotética.
15. **Número de capa** — material comercial abre pelo PISO conservador, com a leitura do dia em
    segunda linha e rotulada. Abrir pela leitura do dia veta.
16. **Tabela de deriva** — presente, atualizada e completa desde a v1.3, com as quinze células e o
    dono do piso. Tabela ausente, apagada ou resumida veta. Deriva acima de +15% em qualquer célula
    para a revisão inteira e sobe para o Gui; célula retida não entra em material de venda.
    Base sempre na v1.3; linha desdobrada herda a referência da original. *Desde a peça 4 as duas
    coisas têm tela: o `simulador.html` calcula o piso, a identidade dele e as quinze células, com a
    referência v1.3 **rodada pelo mesmo motor** — conferir contra a tela, não contra a memória.*
17. **Salto entre versões** — o movimento de uma versão para a seguinte foi medido, em qualquer
    direção. **Capa acima de 5% ou célula acima de 10% vem ao Gate 2 antes de entrar em material de
    venda**, com a razão escrita. Convive com o item 16 e não o substitui: aquele pega o afastamento
    lento da v1.3, este pega o degrau de uma rodada — e eles **não pegam as mesmas células**. Salto
    para baixo aciona igual: capa que cai de patamar também muda o que foi prometido. Célula que a
    versão anterior não registrou sai como **não calculável**, nunca como zero. Decisão 54.
18. **Sem default silencioso** — se faltou leitura de origem, o material diz que faltou. Nunca
    preencher lacuna com suposição. Universo elegível congelado sai rotulado com a data.
19. **Tetos sobre a parte exposta** — os 60%, os 8%, o piso de 2% e o teto de 8 ativos foram
    medidos sobre a parte exposta e sobre a carteira. As duas vendas determinísticas do sistema — o
    degrau 3 e a consolidação abaixo do piso — chegam aqui como decisão própria, com data, ativo e
    percentual antes e depois. Venda executada sem passar por este Gate veta.

→ "Aprovado DD/MM" do Gui. Executar/publicar é irreversível.

## RODADA DE TESTE SUGERIDA
Rodar os dois gates sobre a leitura de 29/08/2026
(estado **Mercado saudável** pela Linha d'Água · Índice Semente **50,75**, faixa Equilíbrio):
- Gate 1: a tensão do LTH a 1,08% da máxima com preço 37,4% abaixo do topo tem substância?
- Gate 2: se virar proposta de aporte (40% × 1,00 × 0,99699 = 39,9% para +3 anos), ela passa
  nos 14 itens? O Reforço de Fundo NÃO se aplica hoje — o estado é Mercado saudável e o Índice
  está em 50,75, então as travas 1 e 2 bloqueiam. Item 7 do Gate 2 passa por ausência.
  Atenção especial ao item 5 — a nota de divergência ("estado saudável, intensidade em
  equilíbrio") tem que aparecer como nota, não como se o Índice tivesse rebaixado o estado.
