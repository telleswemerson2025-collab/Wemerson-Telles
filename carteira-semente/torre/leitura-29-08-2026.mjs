// As catorze leituras reais de 28 e 29/08/2026, transcritas do documento
// `07-leituras-29-08-2026.md`. Mínimas e máximas no range ALL do terminal.
// Fonte primária do pacote: não se altera sem retificação registrada.
//
// D35 A: cada número carrega o estado de conferência. Na abertura são 14 valores
// CONFIRMADOS por tooltip (o documento 07 diz "um por um") e 28 extremos
// PROVISÓRIOS — no zoom ALL o cursor salta ~7 dias e não encosta no dia do topo.
// O estado fica no dado, não em nota de rodapé.
//
// dataMin e dataMax são as datas dos extremos, também do documento 07. Sem elas o
// comando de conferência da D35 B não sabe para que dia estreitar a janela.
export const VARREDURA_29_08_2026 = Object.freeze({
  'Preço do BTC': {
    valor: 77839.19, min: 0.29, max: 124353.95, data: '2026-08-28',
    dataMin: '2011-01-03', dataMax: '2025-10-06',
    confirmado: { valor: '2026-08-29', min: null, max: null },
    // Tentativa registrada para que ninguém repita: a tooltip NÃO confirma este
    // mínimo, e não por falta de zoom. O terminal arredonda BTC PRICE para dólar
    // inteiro, então 03/01/2011 lê "$0" — e 02, 04, 05 e 06/01 leem "$0" também.
    // Empate sem desempate possível no gráfico.
    tentativas: [{
      campo: 'min', em: '2026-08-29', resultado: 'não confirmado',
      metodo: 'tooltip, modo SMA, zoom no máximo que a barra de range permite (janela 01–13/jan/2011)',
      lido: 'JAN 3, 2011 · BTC PRICE $0 — cifrão, zero. O eixo da janela imprime só "$1" e "$0".',
      vizinhos: { '2011-01-02': '$0', '2011-01-03': '$0', '2011-01-04': '$0', '2011-01-05': '$0', '2011-01-06': '$0' },
      cruzamento: 'MVRV Ratio na mesma tooltip: 02/01 = 3.370 · 03/01 = 3.294 · 04/01 = 3.226',
      oQueSeSustenta: 'só o item 3: na visão ALL o ponto mais baixo da série está nos primeiros dias de jan/2011, ' +
                      'e o fundo seguinte (nov/2011) já está na casa de US$ 2. Medido contra o eixo log (~71 px por década) ' +
                      'dá ≈ US$ 0,29–0,30 — mas isso é medição de eixo, não leitura de tooltip.',
      porQueNaoFecha: 'o terminal arredonda o preço para inteiro; abaixo de US$ 1 a tooltip perde a informação inteira',
      caminhoQueFecharia: 'a fonte do dado, o número cru por trás da série — não o gráfico',
      telaRestaurada: 'range ALL, página no topo, sidebar reaberta; nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'Realized Price':     { valor: 53057.77, min: 0.088,   max: 56449.62,  data: '2026-08-28' , dataMin: '2011-01-01', dataMax: '2025-11-26', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Realized Price STH': { valor: 69977.18, min: 0.19,    max: 114018.67, data: '2026-08-28' , dataMin: '2011-01-01', dataMax: '2025-10-09', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Realized Price LTH': { valor: 49449.51, min: 0.003,   max: 49991.21,  data: '2026-08-28' , dataMin: '2011-01-01', dataMax: '2026-07-26', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'MVRV Ratio': {
    valor: 1.465, min: 0.384, max: 7.854, data: '2026-08-28',
    dataMin: '2011-10-19', dataMax: '2011-06-04',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: '2026-08-29' },
    conferencias: [{
      campo: 'min', em: '2026-08-29',
      metodo: 'tooltip do terminal, modo SMA, janela estreitada de 01/10/2011 a dez/2011 até o passo do cursor virar 1 dia',
      lido: '0.384 — zero, ponto, três, oito, quatro (o terminal usa ponto decimal, não vírgula)',
      casasNaTooltip: 3, // dos próprios dígitos lidos: 0.384
      // Vizinhos e varredura do ALL: provam que é o FUNDO, não só que o número
      // daquele dia está certo. O comando pedia só a segunda coisa.
      vizinhos: { '2011-10-18': 0.418, '2011-10-19': 0.384, '2011-10-20': 0.411 },
      ehMinimoDaSerie: 'nenhum ponto da série no ALL fica abaixo; os fundos de 2015, 2018 e 2022 param acima',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 2 — implica Realized Price ~5,21 e MVRV abaixo de 1, que é capitulação profunda',
      telaRestaurada: 'range de volta em ALL, página no topo, sidebar reaberta; nada salvo, alterado, publicado ou apagado',
    }, {
      campo: 'max', em: '2026-08-29',
      metodo: 'tooltip do terminal, modo SMA, janela estreitada de 13/04/2011 a 07/2011 até ~12,6 px por dia',
      lido: '7.854 — sete, ponto, oito, cinco, quatro',
      casasNaTooltip: 3, // 7.854
      vizinhos: { '2011-06-03': 6.510, '2011-06-04': 7.854, '2011-06-05': 6.718 },
      // Havia um segundo pico ao lado, conferido para não confundir os dois.
      segundoPico: { '2011-06-07': 7.404, '2011-06-08': 7.809, '2011-06-09': 6.772 },
      ehMaximoDaSerie: 'topos rivais medidos na mesma janela estreitada: 09/04/2013 = 5.846 e 17/11/2013 = 6.237; ' +
                       '2017, 2021 e 2024 ficam visivelmente abaixo desses dois. Folga de ~26% até o segundo maior.',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 16 — implica Realized Price ~2,04. Em 08/06, MVRV 7.809 com BTC US$ 28 ' +
                  'implica ~3,59: o custo da rede subiu 76% em quatro dias, no mesmo passo do preço, e por isso a razão não inflou.',
      // ⚠️ A folga até o segundo pico é de 0,58%. A DATA do máximo depende dessa
      // margem — outra suavização poderia virá-la de 04/06 para 08/06. Por isso o
      // modo SMA fica registrado: sem ele a conferência não é reprodutível.
      margemAteOSegundoPico: '0,58% (7.854 contra 7.809 em 08/06/2011)',
      bateComDoc07: 'o documento 07 registra uma conferência avulsa de 05/jun/2011 = 6,718; esta leitura independente dá o mesmo número',
      telaRestaurada: 'range ALL, página no topo, sidebar reaberta; nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'SOPR': {
    valor: 1.0112, min: 0.6068, max: 2.8740, data: '2026-08-28',
    dataMin: '2011-11-09', dataMax: '2011-04-29',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: '2026-08-29' },
    conferencias: [{
      campo: 'min', em: '2026-08-29',
      metodo: 'Spent Output Profit Ratio (SOPR) · SOPR simples, não LTH/STH; tooltip, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '0.6068 — zero, ponto, seis, zero, seis, oito',
      casasNaTooltip: 4, // 0.6068
      vizinhos: { '2011-11-08': 0.9609, '2011-11-09': 0.6068, '2011-11-10': 0.9743 },
      // TOPOLOGIA NOVA: nem vale (MVRV · min) nem platô (Liveliness · max). É uma
      // barra isolada cravada entre dois dias em ~0,96–0,97. É a forma que um erro
      // de dado tem — e também a que um dia de capitulação tem, porque o SOPR é
      // razão diária e um dia de pânico dá uma barra só. Fica nomeada.
      topologia: 'pico isolado de um dia',
      quedaDosVizinhos: 0.3541, // 0,9609 → 0,6068: 37% em um dia, e volta no seguinte
      ehMinimoDaSerie: 'varrido em dois blocos, porque a série tem dois regimes. ' +
        '2011–2012: os rivais mais próximos são 16/11/2011 = 0.6237 e 19/10/2011 = 0.6369, ambos acima. ' +
        '2013 → hoje: abrindo só esse trecho o eixo se reescala e o piso vira 0,7 — em treze anos o SOPR nunca chegou perto.',
      // ⚠️ MÉTODO MAIS FRACO, e o Gui nomeou como tal: o piso do regime pós-2013
      // (~0,75–0,76) foi lido no EIXO, não na tooltip. Fica separado do que foi lido
      // dígito a dígito, porque não tem a mesma força.
      leiturasDeEixo: {
        pisoPos2013: '~0,75–0,76',
        fecho: 'na visão ALL o rótulo mais baixo do eixo direito é 0.6, o que só faz sentido com o mínimo logo acima dele',
        naturezaDoMetodo: 'leitura de eixo, não de tooltip',
      },
      // BTC PRICE $3 nos três dias: a mesma redondagem para dólar inteiro que
      // derrubou a conferência do Preço do BTC · min. Nesta escala o cruzamento não
      // cruza nada, e isso é consistência, não achado novo.
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 3 nos três dias — o terminal arredonda para dólar inteiro, então nesta escala o cruzamento não separa nada',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }, {
      campo: 'max', em: '2026-08-29',
      metodo: 'SOPR simples, tooltip do terminal, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '2.8740 — dois, ponto, oito, sete, quatro, zero',
      casasNaTooltip: 4,
      // O portao passou, mas por 0,0001: o STH le 1.0111 contra 1.0112 do simples.
      // Uma casa de exibicao. O valor corrente e senha FRACA onde ha homonimo.
      portaoDeIdentidade: {
        breadcrumb: 'Spent Output Profit Ratio (SOPR) / SOPR',
        ultimoPonto: { data: '2026-08-28', valor: 1.0112, btc: 77839 },
        homonimosNoMesmoDia: { LTH: 1.0134, STH: 1.0111 },
        margemAteOMaisProximo: 0.0001,
        licao: 'o valor corrente separou do STH por uma casa de exibição — quem separa de verdade é o breadcrumb',
      },
      vizinhos: { '2011-04-28': 1.4169, '2011-04-29': 2.8740, '2011-04-30': 1.8046 },
      topologia: 'pico isolado de um dia — vale mais que o dobro do vizinho de trás',
      semEmpate: 'os dígitos separam com folga enorme',
      // ⚠️ A VARREDURA POR BANDA FALHOU AQUI, e o Gui trocou de método.
      varreduraQueFalhou: {
        metodo: 'banda de altura sobre a série inteira',
        porQue: 'no ALL o gráfico comprime ~5.700 dias em ~1.100 px, então um dia ocupa ~0,19 px e ' +
                'um pico de barra única some no recorte — daria falso negativo',
      },
      ehMaximoDaSerie: 'eixo auto-escalado, em dois blocos que se encostam sem buraco. ' +
                       'jan/2011 → 11/01/2012: topo do eixo 3.1, e a barra mais alta da janela é a de 29/04/2011. ' +
                       '11/01/2012 → hoje: topo do eixo 1.6 — em quatorze anos e meio as barras mais altas param em 1,2–1,5. ' +
                       'O único trecho cujo eixo precisa subir até a casa dos 2,8 é o de abril/2011.',
      metodoDeVarredura: 'eixo auto-escalado por blocos — não depende de a barra ser visível',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 2 — de novo sem poder de separação nesta escala',
      incertezaDaExibicao: { faixa: [2.87395, 2.87405], efeitoNoIndice: 0.00036 },
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'Supply in Profit': {
    valor: 67.4, min: 35.6, max: 100.0, data: '2026-08-28',
    dataMin: '2015-08-24', dataMax: '2011-02-04',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: null },
    conferencias: [{
      campo: 'min', em: '2026-08-29',
      metodo: 'tooltip do terminal, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '35.6% — três, cinco, ponto, seis, com sinal de porcento',
      casasNaTooltip: 1, // quarta resolução diferente encontrada: 4, 3, 2 e agora 1
      // O menu tem DOIS "Supply in Profit": um em BTC (13,5M BTC) e um percentual.
      // O Gui escolheu o percentual e avisou. A escolha se PROVA pelo dado, e por
      // três vias independentes — nenhuma delas dependia de escolher certo.
      serieEscolhida: {
        entre: ['Supply in Profit em BTC (≈13,5M BTC)', 'Supply in Profit em percentual'],
        escolhida: 'percentual',
        provasNoDado: [
          'o valor corrente registrado é 67,4 — percentual, não 13,5M',
          'o máximo registrado é 100,0, que é o teto de um percentual e impossível numa série em BTC',
          'o mínimo lido, 35,6%, é da mesma ordem dos outros dois',
        ],
      },
      vizinhos: { '2015-08-23': 38.8, '2015-08-24': 35.6, '2015-08-25': 40.0 },
      topologia: 'mergulho de um dia — a Segunda-feira Negra dos mercados globais, 24/08/2015',
      semEmpate: 'folga de mais de 3 pontos percentuais para cada lado; os dígitos separam sozinhos',
      // Método novo de varredura: recortar a BANDA de altura e varrer os quinze anos
      // de uma vez, em vez de percorrer trecho a trecho.
      ehMinimoDaSerie: 'recortada a banda do gráfico abaixo de ~36% e varridos os quinze anos de uma vez: ' +
                       'aparece uma única marca em toda a série, a de agosto de 2015. ' +
                       'Concorrentes por trecho: dez/2014–out/2015 tem segundo mais baixo em ~39,7%; 2018–2019 para em 40–41%.',
      metodoDeVarredura: 'banda de altura sobre a série inteira, e não trecho a trecho',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 219 em 24/08; US$ 228 em 23/08 e US$ 214 em 25/08',
      incertezaDaExibicao: { faixa: [35.55, 35.65], efeitoNoIndice: 0.00387 },
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'Liveliness': {
    valor: 0.6345, min: 0.1785, max: 0.6410, data: '2026-08-28',
    dataMin: '2011-01-09', dataMax: '2025-12-20',
    confirmado: { valor: '2026-08-29', min: null, max: '2026-08-29' },
    conferencias: [{
      campo: 'max', em: '2026-08-29',
      metodo: 'Cointime Statistics · Liveliness, tooltip do terminal, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '0.6410 — zero, ponto, seis, quatro, um, zero',
      vizinhos: { '2025-12-19': 0.6409, '2025-12-20': 0.6410, '2025-12-21': 0.6409 },
      // ⚠️ O EMPATE. 12/12/2025 exibe o MESMO 0.6410 na tooltip. Não é empate de
      // valor, é empate de EXIBIÇÃO: o terminal mostra quatro casas e as duas datas
      // caem no mesmo passo de arredondamento. A tooltip não decide, e nenhuma
      // insistência nela decidiria — o número que ela mostra é o mesmo nas duas.
      empateNaExibicao: {
        candidato: '2025-12-12', lido: 0.6410, precoNoDia: 91629,
        resolvidoPor: 'janela 23/11/2025 → 26/01/2026, onde 1 px vale ~0,000003 de Liveliness; 20/12 fica ~13 px acima de 12/12',
        implicacao: '12/12 é ~0,64096 arredondado para cima na tela; 20/12 é o ponto mais alto de fato',
        // Método diferente dos anteriores: não é leitura de dígito, é separação
        // geométrica. Fica nomeado para não passar por leitura de tooltip.
        naturezaDoMetodo: 'separação por pixel, não leitura de dígito',
      },
      ehMaximoDaSerie: 'na janela esticada nenhum ponto fica acima de 20/12; fora dela a folga é grande — ' +
                       'o platô de 2017–2024 não passa de ~0,61–0,63, o pico de 13/01/2026 lê 0.6404 e o valor atual (ago/2026) é 0,6345. ' +
                       'Na visão ALL os únicos pixels na altura de 0,641 estão em dez/2025.',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 88.181 em 20/12; US$ 87.394 em 19/12 e US$ 88.260 em 21/12. ' +
                  'Em 12/12, US$ 91.629 — preço 3,9% MAIOR com Liveliness igual, o que separa as duas datas por comportamento e não só por altura.',
      // O que o empate custa na régua, medido e não estimado: a máxima só é conhecida
      // até ±0,00005, e essa incerteza move o Índice em ±0,00105 ponto.
      incertezaDaExibicao: { faixa: [0.64095, 0.64105], efeitoNoIndice: 0.00105 },
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }, {
      // D57: SEGUNDA conferência do mesmo campo, 31/08/2026. A primeira fica onde
      // está — registro não se sobrescreve. Esta acrescenta duas coisas que a
      // primeira não tinha: uma segunda fonte na mesma tela, e o tamanho real do platô.
      campo: 'max', em: '2026-08-31',
      metodo: 'tooltip em zoom estreito, com passo do cursor em 1 dia, mais varredura por faixa de 22/11/2025 a 06/02/2026',
      lido: '0.6410 — dígito a dígito',
      // ⚠️ REFORÇO INDEPENDENTE, e é o que fecha o campo: o próprio terminal carimba
      // o topo da janela. Duas fontes na MESMA tela concordando — a tooltip, que é
      // leitura do operador, e o Window High, que é cálculo do terminal.
      segundaFonte: {
        onde: 'carimbo Window High do terminal, range ALL',
        diz: 'Window High 0.6410 · DEC 20, 2025',
        porQueVale: 'não é a mesma leitura duas vezes: a tooltip é o operador lendo um dia, ' +
                    'o Window High é o terminal declarando o topo da janela inteira',
      },
      // ⚠️ O PLATÔ É MAIOR DO QUE A PRIMEIRA CONFERÊNCIA VIU: são SEIS dias no mesmo
      // dígito exibido, não dois. E o segundo colocado está em 0,6409 — um dígito de
      // folga na última casa.
      plato: {
        dias: 6, valorExibido: 0.6410, segundoColocado: 0.6409,
        leitura: 'dezembro de 2025 inteiro colado em 0,641',
      },
      // D57 B, medido e não estimado: qual dos seis dias leva o crédito NÃO muda a
      // régua. Trocando dataMax por cada um dos seis, o Índice sai idêntico nos seis.
      // O contraste dá a medida do que importa: trocar o VALOR de 0,6410 para 0,6409
      // move o Índice em 0,0021 ponto. A data vale zero; o último dígito vale 0,0021.
      efeitoDaDataNaRegua: { indiceIdenticoNosSeisDias: true, efeitoDeUmDigitoNoValor: 0.0021 },
    }],
  },
  'DXY': {
    valor: 99.16, min: 72.93, max: 114.11, data: '2026-08-29',
    dataMin: '2011-04-29', dataMax: '2022-09-27',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: '2026-08-29' },
    // ⚠️ ANOMALIA DE MENU, não de dado: no menu do terminal o DXY aparece com o
    // valor atual em "—" enquanto o histórico carrega normal. Nenhuma das outras
    // treze séries faz isso. Não move o índice — a confiança do DXY já está no teto
    // (série de 2011, e o fator da D7 satura em 5 anos), então mesmo série parada
    // não mudaria a conta. Mas o VALOR do DXY é alavanca grande: 10% nele move o
    // índice 1,09 ponto. Fica registrado para o Gui decidir se reabre a conferência
    // do valor — reabrir confirmação é decisão, não implementação.
    anomaliaDeMenu: {
      observadaEm: '2026-08-29',
      o_que: 'valor atual exibido como "—" no menu; o histórico do gráfico carrega normal',
      // EXPLICADA pela conferencia do DXY · min: 29/08/2026 e SABADO, e o DXY e serie
      // de pregao. Nao ha cotacao de sabado para o menu mostrar; o historico carrega
      // porque historico existe. Nao e falha do terminal nem do dado.
      explicacao: '29/08/2026 é sábado e o DXY é série de pregão — não há cotação do dia para o menu exibir',
      explicadaEm: '2026-08-29, na conferência do DXY · min',
      efeitoNoIndice: 0, motivoDoEfeitoZero: 'confiança do DXY já saturada em 1 (D7)',
      alavancaDoValor: 1.0945, // pontos de índice por 10% de erro no valor
    },
    conferencias: [{
      campo: 'max', em: '2026-08-29',
      metodo: 'Macro · DXY — Dollar Index, tooltip do terminal, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '114.11 — um, um, quatro, ponto, um, um',
      // A tooltip do DXY mostra DUAS casas, não quatro como a do Liveliness. A
      // resolução de exibição é por série, não do terminal.
      casasNaTooltip: 2,
      vizinhos: { '2022-09-26': 114.10, '2022-09-27': 114.11, '2022-09-28': 112.60 },
      // O caso OPOSTO ao do Liveliness: 26/09 fica um centésimo abaixo, mas os
      // dígitos diferem (114.10 ≠ 114.11) e a tooltip decide sozinha.
      quaseEmpate: {
        vizinho: '2022-09-26', lido: 114.10, distancia: 0.01,
        resolvidoPor: 'dígito — a tooltip separa sozinha, sem zoom',
        naturezaDoMetodo: 'leitura de dígito',
        contrasteCom: 'Liveliness · max, onde 12/12 e 20/12 exibiam o MESMO número e só o pixel separou',
      },
      ehMaximoDaSerie: 'varrida a faixa de altura ~107+ na série inteira: de 2011 a 2018 nenhum ponto entra nela, ' +
                       'e o topo do período fica abaixo de 104; de 2019 em diante o único pico na altura de 114 é o de set/2022. ' +
                       'O segundo maior de toda a série é o repique do início de 2025, em torno de 110,5 — quase 4 pontos abaixo.',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 19.634 em 27/09; US$ 19.045 em 26/09 e US$ 19.144 em 28/09',
      // Duas casas de exibição: a máxima só é conhecida até ±0,005.
      incertezaDaExibicao: { faixa: [114.105, 114.115], efeitoNoIndice: 0.00035 },
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }, {
      campo: 'min', em: '2026-08-29',
      metodo: 'Macro · DXY — Dollar Index, tooltip do terminal, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '72.93 — sete, dois, ponto, nove, três',
      casasNaTooltip: 2,
      vizinhos: { '2011-04-28': 73.12, '2011-04-29': 72.93, '2011-04-30': 72.93, '2011-05-01': 72.93, '2011-05-02': 72.95 },
      // EMPATE DE CALENDARIO, nao de exibicao. Tres dias exibem 72.93 e continuam no
      // mesmo pixel com o eixo a ~0,009/px: nenhum zoom os separa, porque nao ha o
      // que separar. 29/04/2011 foi SEXTA; 30/04 e 01/05 sao fim de semana e o
      // terminal repete o fechamento. Na segunda o indice ja anda (72.95).
      empateDeCalendario: {
        diasIguais: ['2011-04-29', '2011-04-30', '2011-05-01'],
        diaDeFormacao: '2011-04-29', diaDaSemana: 'sexta-feira',
        porQueOPixelNaoResolve: 'não é arredondamento — é o mesmo valor carregado adiante; a ~0,009/px os três ficam no mesmo pixel',
        primeiroPregaoSeguinte: { '2011-05-02': 72.95 },
        naturezaDoMetodo: 'calendário — o único que não olha a tela',
      },
      ehMinimoDaSerie: 'varrida a faixa de altura ~73 na série inteira: a linha só entra nela entre janeiro e meados de 2011. ' +
                       'De 2012 em diante nenhum ponto chega perto — o fundo de 2014 fica em ~79, o de 2018 em ~88. ' +
                       'Dentro de 2011 os rivais mais próximos ficam em 73,6–73,8 (fundos de fev/mar e de agosto).',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 2 — de novo a redondagem para dólar inteiro, que nesta escala não cruza nada',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'Fed Funds Rate': {
    valor: 3.63, min: 0.05, max: 5.33, data: '2026-08-29',
    dataMin: '2020-04-01', dataMax: '2023-08-01',
    confirmado: { valor: '2026-08-29', min: null, max: '2026-08-29' },
    // O portao de identidade (unidade + valor corrente) passou: titulo "Fed Funds
    // Rate (%)" e ultimo ponto 3.63. E de quebra entregou um fato que o dado nao
    // tinha: a data do ultimo ponto e 24/08/2026, nao 29/08. Cinco dias, nao um.
    divergenciaDeData: {
      registrado: '2026-08-29', naTela: '2026-08-24', diferencaEmDias: 5,
      comoApareceu: 'o portão de identidade da D35 B pediu o valor corrente, e o Gui reportou a data dele junto',
      efeitoNoIndice: 0, motivo: 'confiança da série saturada em 1 — pela D36 C a data não entra na conta',
    },
    conferencias: [{
      campo: 'max', em: '2026-08-29',
      metodo: 'Macro · Fed Funds Rate (%), tooltip do terminal, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '5.33 — cinco, ponto, três, três',
      casasNaTooltip: 2,
      portaoDeIdentidade: 'unidade em % no próprio título; último ponto 24/08/2026 = 3.63, que bate com o valor registrado',
      vizinhos: { '2023-07-31': 5.12, '2023-08-01': 5.33, '2023-08-02': 5.33 },
      // TERCEIRA ESPECIE DE EMPATE, depois da exibicao (Liveliness) e do fim de
      // semana (DXY): o dado nao muda mesmo. 396 dias com o valor identico.
      platoDeValor: {
        inicio: '2023-08-01', fim: '2024-08-31', diasNoPatamar: 396,
        degrauDeEntrada: { '2023-07-31': 5.12, '2023-08-01': 5.33 }, // 21 pontos-base
        primeiraLeituraDepois: { '2024-08-30': 5.33, '2024-09-02': 5.13 },
        porQueNemDigitoNemPixelDecidem: 'a linha é horizontal sem um pixel de variação — não há o que separar, o dado é o mesmo',
        oQueADataSignifica: 'primeira ocorrência do patamar, o degrau — não um ponto único',
        naturezaDoMetodo: 'patamar — a data é o degrau de entrada, e as duas pontas se registram juntas',
      },
      ehMaximoDaSerie: 'recortada a faixa do gráfico acima de 5,33 e varridos os quinze anos: nenhum traço entra nela. ' +
                       'O ciclo de 2018–19 topou em ~2,4 e todo o período 2011–2015 ficou rente a zero.',
      metodoDeVarredura: 'banda de altura sobre a série inteira',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 29.019 em 01/08; US$ 29.330 em 31/07 e US$ 29.397 em 02/08',
      incertezaDaExibicao: { faixa: [5.325, 5.335], efeitoNoIndice: 0.00292 },
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'US M2':              { valor: 23.218,   min: 8.845,   max: 23.218,    data: '2026-08-29' , dataMin: '2011-01-01', dataMax: '2026-07-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Curva 10Y-2Y': {
    valor: 0.38, min: -0.93, max: 2.81, data: '2026-08-29',
    dataMin: '2023-07-01', dataMax: '2011-02-01',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: '2026-08-29' },
    // Mesma divergencia do Fed Funds, e agora sabida: o ultimo ponto desenhado e
    // 24/08/2026, nao 29/08. Custo zero — confianca saturada (D36 C).
    divergenciaDeData: {
      registrado: '2026-08-29', naTela: '2026-08-24', diferencaEmDias: 5,
      comoApareceu: 'o portão de identidade pediu o valor corrente, e o Gui reportou a data junto',
      efeitoNoIndice: 0,
    },
    unidadeLida: {
      em: '2026-08-29', unidade: 'pontos percentuais',
      // ⚠️ LUGAR NOVO. O titulo NAO traz a unidade, diferente de "Fed Funds Rate (%)"
      // e "Funding Rate — APR (%)". Ela esta na secao "Sobre esta metrica", abaixo do
      // grafico: "spread entre o Treasury de 10 anos e o de 2 anos (em pontos percentuais)".
      onde: 'seção "Sobre esta métrica", abaixo do gráfico — o título desta série não traz unidade',
      breadcrumbCompleto: 'Studio / Macro / Yield Curve 10Y-2Y',
      cabecalho: 'BITCOIN · MACRO',
    },
    conferencias: [{
      campo: 'max', em: '2026-08-29',
      metodo: 'Studio / Macro / Yield Curve 10Y-2Y, tooltip, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '2.81 — dois, ponto, oito, um',
      casasNaTooltip: 2,
      vizinhos: { '2011-01-31': 2.78, '2011-02-01': 2.81, '2011-02-02': 2.81 },
      // ⚠️ A SERIE E MENSAL, e eu a tinha marcada como de PREGAO. O Gui provou
      // conferindo as duas pontas: 28/02/2011 ainda le 2.81 e 01/03 cai para 2.71.
      // Fevereiro inteiro carrega o mesmo valor. Nao e arredondamento nem pixel.
      serieEhMensal: {
        provaDoGui: '28/02/2011 ainda lê 2,81; 01/03/2011 cai para 2,71 — os 28 dias de fev/2011 carregam o mesmo valor',
        desenho: 'mensal desenhada como escada diária',
        euTinhaMarcadoComo: 'pregão',
        oQueIssoQuebrava: 'o comando ia avisar que 01/07/2023 (o mínimo) é sábado e o valor vinha da sexta — explicação errada: ' +
                          'para série mensal o dia 1 é referência de MÊS, e o fim de semana não tem nada a ver',
        sinalQueEuTinhaESemUsar: 'as DUAS pontas caem no dia 1 do mês (01/07/2023 e 01/02/2011)',
      },
      platoDeValor: {
        inicio: '2011-02-01', fim: '2011-02-28', diasNoPatamar: 28,
        degrauDeEntrada: { '2011-01-31': 2.78, '2011-02-01': 2.81 },
        primeiraLeituraDepois: { '2011-02-28': 2.81, '2011-03-01': 2.71 },
        oQueADataSignifica: 'mês de referência fev/2011; 01/02 é o primeiro dia, não um ponto único',
        naturezaDoMetodo: 'patamar mensal — o mês é a unidade, e as duas pontas se registram juntas',
      },
      ehMaximoDaSerie: 'dois blocos curtos que se encostam, rivais conferidos na tooltip — sem eixo nem pixel no ALL. ' +
                       '11/01/2011 → 11/01/2012: o degrau mais alto do ano é fev/2011 (2,81); janeiro fica em 2,78 e de março em diante a escada só desce. ' +
                       '11/01/2012 → hoje: o topo é dez/2013 = 2,56 (BTC US$ 865), e o eixo dessa janela nem passa de 2,5.',
      metodoDeVarredura: 'eixo auto-escalado por blocos, com os rivais conferidos na tooltip',
      folgaAteOSegundo: '0,25 pp (2,81 contra 2,56 em dez/2013)',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 1 nos três dias — dólar inteiro de novo, sem poder de separação',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }, {
      campo: 'min', em: '2026-08-29',
      metodo: 'Studio / Macro / Yield Curve 10Y-2Y, tooltip, janela estreitada até o passo do cursor virar 1 dia',
      lido: '-0.93 — menos, zero, ponto, nove, três',
      casasNaTooltip: 2,
      vizinhos: { '2023-06-30': -0.89, '2023-07-01': -0.93, '2023-07-02': -0.93 },
      // As QUATRO pontas do patamar, que o comando passou a pedir depois do Fed Funds.
      // Primeira conferencia em que ele pediu a coisa certa e voltou completa.
      platoDeValor: {
        inicio: '2023-07-01', fim: '2023-07-31', diasNoPatamar: 31,
        degrauDeEntrada: { '2023-06-30': -0.89, '2023-07-01': -0.93 },
        primeiraLeituraDepois: { '2023-07-31': -0.93, '2023-08-01': -0.73 },
        conferidoNoMeio: { '2023-07-09': -0.93, '2023-07-30': -0.93 },
        oQueADataSignifica: 'mês de referência jul/2023; 01/07 é o primeiro dia do patamar, não um ponto único',
        naturezaDoMetodo: 'patamar mensal — as quatro pontas registradas juntas',
      },
      // O dia 1 cai num sábado, e desta vez isso é IRRELEVANTE: série mensal, o dia 1
      // é referência de mês. Foi exatamente o aviso errado que a marcação antiga dava.
      oSabadoNaoImporta: '01/07/2023 é sábado, mas a série é mensal — o dia 1 é referência de mês, não fechamento carregado da sexta',
      ehMinimoDaSerie: 'dois blocos curtos que se encostam, rivais na tooltip, sem eixo nem pixel no ALL. ' +
                       '2011 → jan/2022: o eixo da janela nem chega a zero — o piso do período é +0,05 (set/2019), a curva não fica negativa no trecho. ' +
                       'jan/2022 → hoje: o degrau mais fundo de toda a inversão é o de jul/2023 (-0,93); os patamares vizinhos param em -0,76 e -0,70.',
      metodoDeVarredura: 'eixo auto-escalado por blocos, com os rivais conferidos na tooltip',
      folgaAteOSegundo: '0,17 pp (-0,93 contra -0,76)',
      // Achado estrutural: TODO o território negativo desta régua é um episódio só.
      territorioNegativo: 'a curva só fica negativa a partir de 2022 — em onze anos de série o piso foi +0,05',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 30.519 em 01/07; US$ 30.558 em 30/06 e US$ 30.542 em 02/07',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'ETF Net Inflow': {
    valor: 242.3, min: -1138.9, max: 1373.8, data: '2026-08-27',
    dataMin: '2025-02-25', dataMax: '2024-11-07',
    // D42 A: o VALOR do dia foi lido ("$242M" bate com 242,3). Os dois extremos ficam
    // em POSTO CONFIRMADO: data e posto provados na tela, valor não legível porque a
    // notação compacta colapsa a magnitude. D42 D: é o teto alcançável nesta tela.
    confirmado: { valor: '2026-08-29', min: null, max: null },
    postoConfirmado: { valor: null, min: '2026-08-29', max: '2026-08-29' },
    // ⚠️ CORRECAO DE UNIDADE: eu tinha inferido "US$ mi". A tela diz USD, exibido em
    // milhoes/bilhoes por sufixo. Compativel na escala, errado como rotulo.
    unidadeLida: {
      em: '2026-08-29', unidade: 'USD',
      textoDaTela: 'Fluxo líquido diário, em USD, dos ETFs spot de Bitcoin nos EUA',
      onde: 'seção "Sobre esta métrica" — o título não traz unidade',
      exibicao: 'sufixo M/B: $500M, $1B, $2B',
      euTinhaInferido: 'US$ mi',
      breadcrumbCompleto: 'Studio / ETF & Institutional / ETF Net Inflow',
      cabecalho: 'BITCOIN · ETF & INSTITUTIONAL',
      // Confirma o calendario que eu tinha marcado — desta vez a inferencia bateu.
      calendarioNaTela: 'janela operacional segue o calendário NYSE — sem barras em fins de semana e feriados',
    },
    conferencias: [{
      campo: 'max', em: '2026-08-29',
      metodo: 'Studio / ETF & Institutional / ETF Net Inflow, tooltip, janela jan–dez/2024 a ~4,5 px por dia útil, sem suavização',
      lido: '$1B — cifrão, um, B',
      // ⚠️ NOTACAO COMPACTA. Nao e "casas decimais": acima de mil milhoes a tooltip
      // colapsa para UM digito. 1.373,8 vira "$1B". Abaixo de 1B da o inteiro em
      // milhoes ($242M, $622M). O modelo de casas decimais nao representa isso.
      // D42 C, o registro completo de um posto confirmado.
      postoConfirmado: {
        estado: 'posto confirmado', em: '2026-08-29',
        valorDeRegistro: 1373.8, unidadeDoRegistro: 'USD mi',
        rotuloExibido: '$1B',
        regra: 'acima de mil milhões colapsa para um dígito; abaixo dá o inteiro em milhões',
        oQueEsconde: 'uma FAIXA, não uma casa: tudo de 1.000 a 1.499 exibe "$1B"',
        custoDaFaixaNoIndice: 0.44,
        data: '2024-11-07', posto: 'o mais alto entre os quatro dias que exibem "$1B"',
        segundoColocado: { data: '2024-11-11', valor: null, nota: 'exibe o mesmo rótulo; 36 px abaixo' },
        metodoDeSeparacao: 'altura de barra — a tooltip não decide entre os quatro',
        oQueFaltaParaConfirmado: 'o valor exato, que não sai desta tela (D42 D)',
      },
      vizinhos: { '2024-11-06': 622, '2024-11-07': '$1B', '2024-11-08': 293 },
      // Os vizinhos imediatos separam por digito. O problema esta longe deles.
      empateDeRotulo: {
        diasComOMesmoRotulo: ['2024-03-12', '2024-11-07', '2024-11-11', '2024-11-21'],
        aTooltipNaoDecide: 'os quatro leem "$1B"',
        resolvidoPor: 'altura de barra na mesma janela (jan–dez/2024, ~4,5 px por dia útil, sem suavização)',
        alturas: { '2024-11-07': 109, '2024-11-11': 145, '2024-03-12': 167, '2024-11-21': 180 },
        separacao: '58 px entre 07/11 e 12/03 — da ordem de US$ 300 milhões nessa escala',
        naturezaDoMetodo: 'separação por pixel entre rivais que exibem o mesmo rótulo',
        // O Gui disse o que isso significa, e e o ponto: sem o pixel esta conferencia
        // nao teria como distinguir 07/11 de 12/03.
        semEleNaoDava: 'sem a separação por pixel a conferência não distinguiria 07/11 de 12/03',
      },
      ehMaximoDaSerie: 'rivais do mesmo rótulo medidos por altura na janela de 2024; ' +
                       'para 2025–2026, bloco próprio: o eixo topa em $1B e nenhuma barra o alcança — o maior do período fica em ~$940M.',
      metodoDeVarredura: 'separação por pixel entre rivais de mesmo rótulo, mais bloco próprio para 2025–2026',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 75.499 em 07/11; US$ 74.399 em 06/11 e US$ 76.271 em 08/11',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }, {
      campo: 'min', em: '2026-08-29',
      metodo: 'Studio / ETF & Institutional / ETF Net Inflow, tooltip, blocos curtos com rivais um a um',
      lido: '$-1B — cifrão, sinal de menos, um, B',
      // D42 C, o registro completo de um posto confirmado.
      postoConfirmado: {
        estado: 'posto confirmado', em: '2026-08-29',
        valorDeRegistro: -1138.9, unidadeDoRegistro: 'USD mi',
        rotuloExibido: '$-1B', formaExata: 'cifrão, depois o sinal',
        data: '2025-02-25', posto: 'único dia da série na faixa de bilhão negativo',
        segundoColocado: { data: '2025-11-20', valor: -903 },
        folga: 'US$ 236 milhões',
        metodoDeSeparacao: 'tooltip — sem pixel, sem recorte de faixa',
        oQueFaltaParaConfirmado: 'o valor exato, que não sai desta tela (D42 D)',
      },
      vizinhos: { '2025-02-24': -539, '2025-02-25': '$-1B', '2025-02-26': -755 },
      // ⚠️ O EMPATE PREVISTO NAO ACONTECEU, e a diferenca ensina algo sobre o formato.
      empateDeRotulo: {
        diasComOMesmoRotulo: ['2025-02-25'],
        aTooltipDecideSozinha: 'só um dia da série inteira chega ao patamar de bilhão negativo',
        contrasteComOMaximo: 'no máximo havia QUATRO dias lendo "$1B" e foi preciso separar por altura de barra; aqui a tooltip basta',
        naturezaDoMetodo: 'leitura de dígito — sem pixel',
        // A licao: o risco da notacao compacta nao e so do FORMATO, e do formato
        // vezes quantos dias caem na faixa. Ela colide onde a serie tem companhia.
        oQueIssoEnsina: 'a ambiguidade da notação compacta depende do dado, não só do formato: ' +
                        'ela colide onde a série tem vários dias na mesma faixa de magnitude. ' +
                        'Entradas acima de US$ 1 bi aconteceram quatro vezes; saídas abaixo de -US$ 1 bi, uma só.',
      },
      ehMinimoDaSerie: 'recortada a faixa abaixo de ~-$950M e varridos os dois anos e meio: uma única barra em toda a série. ' +
                       'Confirmado por blocos curtos com rivais um a um — jan–dez/2024: o eixo do bloco para em -$500M e a pior saída do ano é 19/12/2024 = -$672M; ' +
                       'dez/2024 → hoje: os seguintes são 20/11/2025 = -$903M e 13/11/2025 = -$867M.',
      metodoDeVarredura: 'banda de altura mais blocos curtos com rivais na tooltip',
      folgaAteOSegundo: '~US$ 236 milhões (-1.138,9 contra -903 em 20/11/2025) — fora da faixa que colapsaria',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 89.071 em 25/02; US$ 94.703 em 24/02 e US$ 86.999 em 26/02',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
  'Funding Rate': {
    valor: 1.84, min: -139.23, max: 186.86, data: '2026-08-29',
    dataMin: '2020-03-13', dataMax: '2020-02-12',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: '2026-08-29' },
    // A lacuna de unidade fechou: o terminal chama a serie de "Funding Rate — APR (%)",
    // categoria FUTUROS. E funding ANUALIZADO em % ao ano, nao a taxa por periodo de 8h.
    // Confirma a escala linear: APR de funding cruza o zero (negativo = short paga long),
    // e log de negativo nao produz numero — mesma razao da D39 no netflow.
    unidadeLida: {
      em: '2026-08-29', unidade: 'APR (%)', categoria: 'FUTUROS',
      onde: 'título da página e menu — dentro da tooltip o rótulo vem truncado ("Funding Rate — A…")',
      breadcrumbCompleto: 'Studio / Futuros / Funding Rate — APR (%)',
    },
    conferencias: [{
      campo: 'max', em: '2026-08-29',
      metodo: 'FUTUROS · Funding Rate — APR (%), tooltip do terminal, modo SMA, janela em passo de 1 dia',
      lido: '186.9 — um, oito, seis, ponto, nove',
      casasNaTooltip: 1,
      // ⚠️ O REGISTRO TEM MAIS PRECISAO QUE A TELA. 186,86 tem duas casas; a tooltip
      // da uma. Os dois sao compativeis (186,86 arredonda para 186,9), mas o numero
      // anotado NAO pode ter saido desta tooltip. O Gui nao corrigiu nada: anotou o
      // que esta. Segundo caso, depois do Preco do BTC.
      precisaoExcedente: {
        registrado: 186.86, naTela: 186.9, casasRegistradas: 2, casasNaTooltip: 1,
        compativel: true,
        oQueSignifica: 'o número registrado não veio desta tooltip — e o documento 07 diz que os valores foram lidos "um por um" por ela',
        naoCorrigido: 'anotado o que está na tela; trocar o registrado é retificação, não implementação',
      },
      vizinhos: { '2020-02-11': 58.0, '2020-02-12': 186.9, '2020-02-13': 90.7 },
      topologia: 'barra isolada — mais que o triplo do vizinho de trás e o dobro do da frente',
      // A margem mais apertada de todas as conferências até agora.
      concorrentes: { '2021-01-06': 177.6, '2021-02-09': 174.8, '2021-02-22': 104.6 },
      folgaAteOSegundo: '9,3 pontos de APR, ou ~4,98%',
      ehMaximoDaSerie: 'concorrentes medidos um a um com janela em passo de 1 dia, não por faixa: ' +
                       '06/01/2021 = 177.6 (segundo), 09/02/2021 = 174.8 (terceiro), 22/02/2021 = 104.6. ' +
                       'Aberta também a janela 10/03/2020 → hoje, excluindo fev/2020: a barra mais alta dela é a de 06/01/2021. ' +
                       'De 2022 em diante os picos param na casa dos 50–60.',
      metodoDeVarredura: 'concorrentes um a um em passo de 1 dia — a folga de 5% não permitiria banda nem pixel',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 10.342 em 12/02; US$ 9.997 em 11/02 e US$ 10.265 em 13/02',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }, {
      campo: 'min', em: '2026-08-29',
      metodo: 'Studio / Futuros / Funding Rate — APR (%), tooltip, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '-139.2 — menos, um, três, nove, ponto, dois',
      casasNaTooltip: 1,
      precisaoExcedente: {
        registrado: -139.23, naTela: -139.2, casasRegistradas: 2, casasNaTooltip: 1,
        compativel: true,
        // Proposta do Gui, adotada: guardar as DUAS formas, senão a próxima conferência
        // lê divergência onde há só resolução de tela.
        guardarAsDuasFormas: 'valor de registro -139,23 · o que a tela mostra -139,2',
      },
      vizinhos: { '2020-03-12': 2.0, '2020-03-13': -139.2, '2020-03-14': -48.1 },
      topologia: 'barra isolada — a Quinta-feira Negra da COVID. No dia anterior o funding ainda era positivo (2,0)',
      // ⚠️ O FALSO NEGATIVO AQUI E PIOR QUE NO SOPR: a barra nao some, ela MENTE.
      // No ALL o grafico agrega ~2 dias por pixel e o modo SMA suaviza dentro do
      // balde — a leitura de eixo dava ~-53, contra -139,2 real. Fator 2,63.
      varreduraQueFalhou: {
        metodo: 'eixo ou pixel no ALL inteiro',
        leituraFalsa: -53, valorReal: -139.2, fator: 2.63,
        porQue: 'no ALL o gráfico agrega ~2 dias por pixel e o modo SMA suaviza dentro do balde — a barra aparece com menos da metade da profundidade',
        custoSeTivesseSidoUsado: 1.39, // pontos de Índice
        piorQueSumir: 'no SOPR a barra sumia e a falha era visível; aqui ela aparece e o número parece plausível',
      },
      ehMinimoDaSerie: 'eixo auto-escalado em dois blocos que se encostam. ' +
                       'início → abr/2020: o eixo desce até -150 e a barra mais funda é a de 13/03/2020; a segunda do período fica em ~-56. ' +
                       'abr/2020 → hoje: o eixo para em -100 — se houvesse qualquer dia em -139 nesses seis anos, teria de esticar até -150. ' +
                       'Segundo fundo de toda a série, conferido em passo de 1 dia: 10/11/2022 = -93.1 (BTC US$ 17.025), a semana da FTX.',
      metodoDeVarredura: 'eixo auto-escalado por blocos, com o segundo colocado conferido na tooltip',
      folgaAteOSegundo: '46,1 pontos de APR, ou 33,1%',
      cruzamento: 'BTC PRICE na mesma tooltip: US$ 5.367 em 13/03; US$ 6.530 em 12/03 e US$ 5.425 em 14/03',
      telaRestaurada: 'range ALL, MVRV Ratio de volta como indicador aberto, busca com "MVRV Ratio", página no topo, sidebar reaberta; ' +
                      'nada publicado, alterado ou apagado, nenhum print salvo',
    }],
  },
});
