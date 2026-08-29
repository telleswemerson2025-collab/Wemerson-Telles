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
  'Preço do BTC':       { valor: 77839.19, min: 0.29,    max: 124353.95, data: '2026-08-28' , dataMin: '2011-01-03', dataMax: '2025-10-06', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Realized Price':     { valor: 53057.77, min: 0.088,   max: 56449.62,  data: '2026-08-28' , dataMin: '2011-01-01', dataMax: '2025-11-26', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Realized Price STH': { valor: 69977.18, min: 0.19,    max: 114018.67, data: '2026-08-28' , dataMin: '2011-01-01', dataMax: '2025-10-09', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'Realized Price LTH': { valor: 49449.51, min: 0.003,   max: 49991.21,  data: '2026-08-28' , dataMin: '2011-01-01', dataMax: '2026-07-26', confirmado: { valor: '2026-08-29', min: null, max: null } },
  'MVRV Ratio': {
    valor: 1.465, min: 0.384, max: 7.854, data: '2026-08-28',
    dataMin: '2011-10-19', dataMax: '2011-06-04',
    confirmado: { valor: '2026-08-29', min: '2026-08-29', max: null },
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
