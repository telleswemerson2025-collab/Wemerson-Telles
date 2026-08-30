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
  'SOPR':               { valor: 1.0112,   min: 0.6068,  max: 2.8740,    data: '2026-08-28' , dataMin: '2011-11-09', dataMax: '2011-04-29', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Supply in Profit':   { valor: 67.4,     min: 35.6,    max: 100.0,     data: '2026-08-28' , dataMin: '2015-08-24', dataMax: '2011-02-04', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Liveliness':         { valor: 0.6345,   min: 0.1785,  max: 0.6410,    data: '2026-08-28' , dataMin: '2011-01-09', dataMax: '2025-12-20', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'DXY':                { valor: 99.16,    min: 72.93,   max: 114.11,    data: '2026-08-29' , dataMin: '2011-04-29', dataMax: '2022-09-27', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Fed Funds Rate':     { valor: 3.63,     min: 0.05,    max: 5.33,      data: '2026-08-29' , dataMin: '2020-04-01', dataMax: '2023-08-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'US M2':              { valor: 23.218,   min: 8.845,   max: 23.218,    data: '2026-08-29' , dataMin: '2011-01-01', dataMax: '2026-07-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Curva 10Y-2Y':       { valor: 0.38,     min: -0.93,   max: 2.81,      data: '2026-08-29' , dataMin: '2023-07-01', dataMax: '2011-02-01', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'ETF Net Inflow':     { valor: 242.3,    min: -1138.9, max: 1373.8,    data: '2026-08-27' , dataMin: '2025-02-25', dataMax: '2024-11-07', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Funding Rate':       { valor: 1.84,     min: -139.23, max: 186.86,    data: '2026-08-29' , dataMin: '2020-03-13', dataMax: '2020-02-12', confirmado: { valor: '2026-08-29', min: null, max: null } },
});
