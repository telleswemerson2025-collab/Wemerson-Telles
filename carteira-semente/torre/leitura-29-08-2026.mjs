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
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: null },
    conferencias: [{
      campo: 'min', em: '2026-08-29',
      metodo: 'Spent Output Profit Ratio (SOPR) · SOPR simples, não LTH/STH; tooltip, modo SMA, janela estreitada até o passo do cursor virar 1 dia',
      lido: '0.6068 — zero, ponto, seis, zero, seis, oito',
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
    }],
  },
  'Supply in Profit':   { valor: 67.4,     min: 35.6,    max: 100.0,     data: '2026-08-28' , dataMin: '2015-08-24', dataMax: '2011-02-04', confirmado: { valor: '2026-08-29', min: null, max: null } },
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
    }],
  },
  'DXY': {
    valor: 99.16, min: 72.93, max: 114.11, data: '2026-08-29',
    dataMin: '2011-04-29', dataMax: '2022-09-27',
    confirmado: { valor: '2026-08-29', min: null, max: '2026-08-29' },
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
    }],
  },
  'Fed Funds Rate':     { valor: 3.63,     min: 0.05,    max: 5.33,      data: '2026-08-29' , dataMin: '2020-04-01', dataMax: '2023-08-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'US M2':              { valor: 23.218,   min: 8.845,   max: 23.218,    data: '2026-08-29' , dataMin: '2011-01-01', dataMax: '2026-07-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Curva 10Y-2Y':       { valor: 0.38,     min: -0.93,   max: 2.81,      data: '2026-08-29' , dataMin: '2023-07-01', dataMax: '2011-02-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'ETF Net Inflow':     { valor: 242.3,    min: -1138.9, max: 1373.8,    data: '2026-08-27' , dataMin: '2025-02-25', dataMax: '2024-11-07', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Funding Rate':       { valor: 1.84,     min: -139.23, max: 186.86,    data: '2026-08-29' , dataMin: '2020-03-13', dataMax: '2020-02-12', confirmado: { valor: '2026-08-29', min: null, max: null } },
});
