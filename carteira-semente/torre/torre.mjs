// TORRE DE CONTROLE — peça 2 da implementação da Carteira Semente.
//
// SÓ LÊ. Não decide, não aloca, não classifica estação, não guarda estado próprio:
// o que precisa durar sai daqui como evento para o registro da peça 1.
//
// Invariante que governa o arquivo inteiro: SEM DEFAULT SILENCIOSO (invariante 3).
// Indicador que não voltou é nomeado como ausente. Nunca se estima, nunca se
// repete o valor de ontem, nunca se preenche buraco com a média do resto.

import { TIPOS } from '../registro/registro.mjs';

// ── AS QUINZE SÉRIES, SEMPRE AS MESMAS E NESTA ORDEM (invariante 7) ───────
// Eram catorze até a Decisão 37 C, que acrescentou o Exchange Netflow à camada 4.
// A invariante 7 proíbe indicador que entra e sai por conveniência — não proíbe
// mudança por decisão registrada, e é exatamente por isso que ela exigiu uma.
// escala: 'log' para série multiplicativa, 'lin' para aditiva (D03).
// inicioSerie alimenta o fator de confiança da D7.
export const SERIES = Object.freeze([
  { n: 'Preço do BTC',        camada: 1, escala: 'log', inicioSerie: '2011-01-01', papel: 'linha-dagua' },
  { n: 'Realized Price',      camada: 1, escala: 'log', inicioSerie: '2011-01-01', papel: 'linha-dagua' },
  { n: 'Realized Price STH',  camada: 1, escala: 'log', inicioSerie: '2011-01-01', papel: 'linha-dagua' },
  { n: 'Realized Price LTH',  camada: 1, escala: 'log', inicioSerie: '2011-01-01', papel: 'linha-dagua' },
  { n: 'MVRV Ratio',          camada: 1, escala: 'log', inicioSerie: '2011-01-01', papel: 'regua' },
  { n: 'SOPR',                camada: 2, escala: 'log', inicioSerie: '2011-01-01' },
  { n: 'Supply in Profit',    camada: 2, escala: 'lin', inicioSerie: '2011-01-01' },
  { n: 'Liveliness',          camada: 2, escala: 'lin', inicioSerie: '2011-01-01' },
  { n: 'DXY',                 camada: 3, escala: 'lin', inicioSerie: '2011-01-01', invertido: true },
  { n: 'Fed Funds Rate',      camada: 3, escala: 'lin', inicioSerie: '2011-01-01', invertido: true },
  { n: 'US M2',               camada: 3, escala: 'lin', inicioSerie: '2011-01-01' },
  { n: 'Curva 10Y-2Y',        camada: 3, escala: 'lin', inicioSerie: '2011-01-01' },
  { n: 'ETF Net Inflow',      camada: 4, escala: 'lin', inicioSerie: '2024-01-11' },
  { n: 'Funding Rate',        camada: 4, escala: 'lin', inicioSerie: '2020-01-01' },
  // A escala é LINEAR e não pode ser outra: netflow é entrada menos saída, cruza o
  // zero, e log de zero ou de negativo não produz número errado — não produz número
  // nenhum. A D38 D chamou a série de logarítmica; a D39 corrigiu para linear.
  // Os extremos e o início da série são PROVISÓRIOS até a leitura no terminal.
  { n: 'Exchange Netflow',    camada: 4, escala: 'lin', inicioSerie: '2011-01-01', extremosProvisorios: true },
]);

// D37 A: alínea (a) do Filtro de Horizonte, com número.
// Duas exchanges porque volume concentrado numa só não é liquidez, é dependência.
// Medido SEPARADAMENTE porque somar esconde exatamente isso.
export const LIMIAR_LIQUIDEZ = 100_000_000;   // âncora estrutural (D37 B)
export const EXCHANGES_MINIMAS = 2;           // âncora estrutural (D37 B)
export const JANELA_LIQUIDEZ_DIAS = 30;

// D38 A: a lista é NOMEADA, não descrita. Quem monta a varredura não escolhe: lê.
// D38 C: é âncora estrutural, e âncora de PAR com o limiar — afrouxar a lista sem
// tocar no número tem o mesmo efeito de baixar o número.
export const EXCHANGES_PRIMEIRA_LINHA = Object.freeze([
  'Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'Bitget',
]);
const naLista = (nome) => EXCHANGES_PRIMEIRA_LINHA.some((e) => e.toLowerCase() === String(nome).toLowerCase());

export const PESOS = Object.freeze({ 1: 0.34, 2: 0.26, 3: 0.16, 4: 0.12, 5: 0.12 });

// D40: os nomes canônicos das camadas, como estão nos cinco documentos.
// Renomeação de camada é decisão registrada própria, nunca efeito colateral do
// texto de outra decisão. Nome que aparece diferente numa decisão é erro de
// redação até prova em contrário — e o peso é que manda, por ser inequívoco.
export const CAMADAS = Object.freeze({
  1: 'Estado do preço', 2: 'Comportamento', 3: 'Macro', 4: 'Fluxo', 5: 'Carteira',
});

// D36 B: dentro da camada vale a mesma mecânica de um nível acima — renormaliza
// sobre o que voltou, e sai inteira se o que falta pesar mais de um terço. Duas
// regras diferentes para o mesmo problema em dois níveis seria incoerência.
export const TRAVA_AUSENCIA_NA_CAMADA = 1 / 3;

// D03, redefinidas pela D02: faixas de INTENSIDADE, que não disparam nada.
export const FAIXAS = Object.freeze([
  { ate: 20, nome: 'Fundo' }, { ate: 40, nome: 'Comprimido' }, { ate: 60, nome: 'Equilíbrio' },
  { ate: 80, nome: 'Esticado' }, { ate: 101, nome: 'Extremo' },
]);

export const ESTADOS = Object.freeze({
  CAPITULACAO: 'Capitulação profunda', PREJUIZO: 'Prejuízo do mercado',
  ESTRESSE: 'Estresse de curto prazo', SAUDAVEL: 'Mercado saudável',
});

const DIA_MS = 86400000;
const anosEntre = (de, ate) => (Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / (DIA_MS * 365.25);
const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Normaliza contra a própria faixa histórica: log para multiplicativa, linear para aditiva. */
export function normalizar(valor, min, max, escala, invertido = false) {
  const p = escala === 'log'
    ? (Math.log(valor) - Math.log(min)) / (Math.log(max) - Math.log(min))
    : (valor - min) / (max - min);
  const limitado = Math.max(0, Math.min(1, p)) * 100;
  return invertido ? 100 - limitado : limitado;
}

/** D7: série curta é amortecida em direção ao neutro, não descartada. */
export const confianca = (inicioSerie, hoje) => Math.min(anosEntre(inicioSerie, hoje) / 5, 1);
export const amortecer = (bruto, conf) => 50 + (bruto - 50) * conf;

/** D04: autoridade única sobre o estado. Regra objetiva, nada a sobrepõe. */
export function classificarLinhaDagua({ preco, realizedPrice, sth, lth }) {
  if (preco < lth) return ESTADOS.CAPITULACAO;
  if (preco < realizedPrice) return ESTADOS.PREJUIZO;
  if (preco < sth) return ESTADOS.ESTRESSE;
  return ESTADOS.SAUDAVEL;
}

export const faixaDoIndice = (v) => FAIXAS.find((f) => v < f.ate).nome;

/**
 * Varredura do dia. `varredura` traz, por indicador: {valor, min, max, data}.
 * Ausência = indicador que não veio, ou veio sem valor. É nomeado, nunca estimado.
 */
// ── ESTADO DE CONFERÊNCIA DOS EXTREMOS (D35) ──────────────────────────────
// O estado fica NO DADO, não em nota de rodapé: cada número carrega confirmado
// por tooltip, com a data da conferência, ou provisório. Erro de escala e erro de
// extremo são a mesma classe — os dois mexem na régua, não no número — e a régua é
// o único lugar onde erro pequeno vira erro grande.

/** Séries cujos extremos nasceram provisórios por não terem sido lidos ainda. */
export const seriesComExtremosProvisorios = () => SERIES.filter((s) => s.extremosProvisorios).map((s) => s.n);

/**
 * D35 D: primeiro as séries logarítmicas, depois as lineares, e dentro de cada
 * grupo por peso de camada. A régua log é a que amplifica erro de extremo.
 */
export function filaDeConferencia(varredura) {
  const pendentes = [];
  for (const s of SERIES) {
    const v = varredura?.[s.n];
    if (!v) continue;
    for (const campo of ['valor', 'min', 'max']) {
      if (!v.confirmado?.[campo]) pendentes.push({ serie: s.n, campo, escala: s.escala, camada: s.camada, peso: PESOS[s.camada] });
    }
  }
  const ordemCampo = { min: 0, max: 1, valor: 2 };
  for (const p of pendentes) p.inerte = inerte(p.serie, p.campo);
  return pendentes.sort((a, b) =>
    (a.escala === b.escala ? 0 : a.escala === 'log' ? -1 : 1) ||
    b.peso - a.peso ||
    a.serie.localeCompare(b.serie) ||
    ordemCampo[a.campo] - ordemCampo[b.campo]);
}

/**
 * Séries cujos extremos NÃO entram em conta nenhuma, em nenhum estado de mercado.
 * A camada 1 normaliza preço ÷ Realized Price contra a faixa do MVRV, não contra a
 * faixa delas; e a Linha d'Água compara preços entre si, sem normalizar. Logo os
 * extremos das quatro séries de preço são inertes por construção — conferi-los não
 * muda o índice em nada, e um erro de dez vezes neles também não.
 */
export const EXTREMOS_INERTES = Object.freeze(
  ['Preço do BTC', 'Realized Price', 'Realized Price STH', 'Realized Price LTH']);
const inerte = (serie, campo) => campo !== 'valor' && EXTREMOS_INERTES.includes(serie);

/**
 * Mede o efeito real de um erro em cada extremo, perturbando e recalculando. É a
 * única forma honesta de priorizar: peso de camada e escala são proxies, isto é a
 * coisa. Cuidado ao ler — o efeito de hoje depende da leitura de hoje. Um extremo
 * pode dar zero por o valor estar encostado no outro extremo, e voltar a pesar
 * amanhã. Só os inertes por construção são zero para sempre.
 */
export function efeitoDosExtremos(varredura, hoje, erro = 0.10) {
  const base = varrer({ varredura, hoje }).indice;
  const fora = [];
  for (const s of SERIES) {
    if (!varredura?.[s.n]) continue;
    for (const campo of ['min', 'max']) {
      const alterada = { ...varredura, [s.n]: { ...varredura[s.n], [campo]: varredura[s.n][campo] * (1 + erro) } };
      const efeito = Math.abs(varrer({ varredura: alterada, hoje }).indice - base);
      fora.push({
        serie: s.n, campo, efeito,
        inerte: inerte(s.n, campo) ? 'por construção' : (efeito < 1e-9 ? 'só na leitura de hoje' : null),
        confirmado: Boolean(varredura[s.n].confirmado?.[campo]),
      });
    }
  }
  return fora.sort((a, b) => b.efeito - a.efeito);
}

/** D35 C: quantos extremos são provisórios e em quais séries. Não bloqueia a leitura. */
export function estadoDosExtremos(varredura) {
  const fila = filaDeConferencia(varredura);
  const porSerie = new Map();
  for (const p of fila) porSerie.set(p.serie, [...(porSerie.get(p.serie) ?? []), p.campo]);
  let confirmados = 0, total = 0;
  for (const s of SERIES) {
    const v = varredura?.[s.n]; if (!v) continue;
    for (const campo of ['valor', 'min', 'max']) { total++; if (v.confirmado?.[campo]) confirmados++; }
  }
  const inertesPendentes = fila.filter((f) => inerte(f.serie, f.campo)).length;
  return {
    total, confirmados, provisorios: total - confirmados,
    series: [...porSerie].map(([serie, campos]) => ({ serie, campos })),
    proximo: fila[0] ?? null,
    // Dos provisórios, quantos não mudam o índice nem se estiverem dez vezes errados.
    inertesPendentes,
    provisoriosQueImportam: (total - confirmados) - inertesPendentes,
  };
}

/**
 * D35 B: comando pro Chrome, UM extremo por vez, somente leitura. O salto de sete
 * dias do cursor é efeito do zoom ALL, não do terminal — estreitar a janela em
 * torno da data até o passo virar um dia, ler a tooltip, voltar ao ALL.
 */
export function comandoDeConferencia({ serie, campo }, varredura) {
  const v = varredura?.[serie];
  if (!v) return null;
  const alvo = v[campo];
  // A data do extremo NÃO cai para a data da leitura: mandar estreitar a janela no
  // dia errado é o default silencioso mais caro possível numa conferência.
  const data = campo === 'valor' ? v.data : v[`data${campo[0].toUpperCase()}${campo.slice(1)}`];
  if (!data) return { erro: `sem a data do ${campo} de ${serie} — não dá para dizer onde estreitar a janela` };
  const ehExtremo = campo !== 'valor';
  return [
    `Conferir no terminal VantageNode, somente leitura: ${serie} · ${campo}.`,
    `Valor a bater: ${alvo} na data ${data}.`,
    '',
    'Passos: abrir a série · estreitar a janela em torno da data até o passo do cursor virar um dia ·',
    'ler a tooltip · anotar o valor dígito a dígito · voltar ao range ALL.',
    ...(ehExtremo ? [
      '',
      // A conferência de 19/10/2011 mostrou que o comando pedia pouco: ler a tooltip',
      // prova que o NÚMERO daquele dia está certo, não que aquele dia é o extremo.
      'Três coisas, não uma:',
      `  1. o valor de ${data}, dígito a dígito;`,
      '  2. os dois dias vizinhos, para provar que este é o ponto e não um qualquer;',
      `  3. na visão ALL, que nenhum outro ponto da série fica ${campo === 'min' ? 'abaixo' : 'acima'} dele.`,
      'Sem as três, o que se confirma é o número do dia — não que o dia seja o extremo.',
      'Se houver outro indicador na mesma tooltip, anotar também: serve de cruzamento.',
    ] : []),
    '',
    'Nunca publica, nunca altera, nunca apaga. Restaura o estado da tela. A sidebar nunca aparece.',
  ].join('\n');
}

export function varrer({ varredura, hoje, camada5 = null, anterior = null }) {
  const ausencias = [];
  const lidos = new Map();

  for (const s of SERIES) {
    const v = varredura?.[s.n];
    if (!v || typeof v.valor !== 'number' || !Number.isFinite(v.valor)) {
      ausencias.push({ indicador: s.n, camada: s.camada, motivo: v === undefined ? 'não voltou da varredura' : 'voltou zerado ou com traço' });
      continue;
    }
    const bruto = normalizar(v.valor, v.min, v.max, s.escala, s.invertido);
    // D36 C: a janela de confiança vai do início da série até a ÚLTIMA DATA do
    // próprio indicador, não até hoje. Medir até hoje contaria como histórico um
    // período em que o indicador não atualizou — série parada ganharia confiança
    // por ficar parada, que é o contrário do que a confiança quer dizer.
    const conf = confianca(s.inicioSerie, v.data ?? hoje);
    lidos.set(s.n, {
      ...s, valor: v.valor, data: v.data, bruto,
      confianca: conf, posicao: amortecer(bruto, conf),
    });
  }

  // ── LINHA D'ÁGUA ─────────────────────────────────────────────────────────
  const p = (n) => lidos.get(n)?.valor;
  const temLinhaDagua = ['Preço do BTC', 'Realized Price', 'Realized Price STH', 'Realized Price LTH'].every((n) => lidos.has(n));
  const estado = temLinhaDagua
    ? classificarLinhaDagua({ preco: p('Preço do BTC'), realizedPrice: p('Realized Price'), sth: p('Realized Price STH'), lth: p('Realized Price LTH') })
    : null;

  // ── CAMADAS ──────────────────────────────────────────────────────────────
  // Camada 1 (D01): preço ÷ Realized Price, normalizado em log pela faixa do MVRV.
  // O MVRV é a RÉGUA da camada 1 e não entra na média da camada 2.
  const camadas = new Map();
  const regua = lidos.get('MVRV Ratio');
  if (lidos.has('Preço do BTC') && lidos.has('Realized Price') && regua) {
    const razao = p('Preço do BTC') / p('Realized Price');
    const bruto = normalizar(razao, varredura['MVRV Ratio'].min, varredura['MVRV Ratio'].max, 'log');
    camadas.set(1, { posicao: bruto, itens: [`preço ÷ Realized Price = ${razao.toFixed(5)}`] });
  }

  // Camadas 2, 3 e 4: média das posições já amortecidas.
  // Camada incompleta SAI INTEIRA. Tirar a média só do que voltou substituiria o
  // que falta pela média do resto, que é o default silencioso da invariante 3.
  for (const camada of [2, 3, 4]) {
    const daCamada = SERIES.filter((s) => s.camada === camada && s.papel === undefined);
    const presentes = daCamada.map((s) => lidos.get(s.n)).filter(Boolean);
    const faltando = daCamada.filter((s) => !lidos.has(s.n)).map((s) => s.n);
    const pesoAusente = faltando.length / daCamada.length;
    if (presentes.length > 0 && pesoAusente <= TRAVA_AUSENCIA_NA_CAMADA) {
      camadas.set(camada, {
        // D37 D: pesos internos iguais entre os indicadores da camada, até haver
        // razão registrada para não serem. Peso inventado é pior que peso igual.
        posicao: media(presentes.map((x) => x.posicao)),  // renormaliza sobre o que voltou
        itens: presentes.map((x) => `${x.n} ${x.posicao.toFixed(1)}`),
        ausentes: faltando,
        pesoAusente,
      });
    }
  }

  if (camada5?.disponivel) camadas.set(5, { posicao: camada5.posicao, itens: camada5.itens ?? [] });

  // ── ÍNDICE, COM PESOS RENORMALIZADOS SOBRE AS CAMADAS QUE VOLTARAM ───────
  const ativas = [...camadas.keys()].sort();
  if (ativas.length === 0) {
    return { disponivel: false, motivo: 'nenhuma camada voltou inteira', ausencias, estado, hoje };
  }
  const somaPesos = ativas.reduce((s, c) => s + PESOS[c], 0);
  const indice = ativas.reduce((s, c) => s + camadas.get(c).posicao * PESOS[c], 0) / somaPesos;
  const faixa = faixaDoIndice(indice);

  // ── O QUE MUDOU DESDE A ÚLTIMA LEITURA ───────────────────────────────────
  const mudou = compararComAnterior({ indice, faixa, estado }, anterior);

  return {
    disponivel: true, hoje, indice, faixa, estado,
    camadas: ativas.map((c) => ({
      camada: c, nome: CAMADAS[c], posicao: camadas.get(c).posicao,
      pesoNominal: PESOS[c], pesoAplicado: PESOS[c] / somaPesos,
      itens: camadas.get(c).itens,
      ausentes: camadas.get(c).ausentes ?? [],
    })),
    camadasForaDaConta: [1, 2, 3, 4, 5].filter((c) => !camadas.has(c))
      .map((c) => {
        if (c === 5) return { camada: 5, nome: CAMADAS[5], motivo: camada5?.motivo ?? 'sem carteira ativa' };
        const daCamada = SERIES.filter((s) => s.camada === c && s.papel === undefined);
        const faltando = daCamada.filter((s) => !lidos.has(s.n)).map((s) => s.n);
        const frac = daCamada.length ? faltando.length / daCamada.length : 1;
        return {
          camada: c, nome: CAMADAS[c], ausentes: faltando,
          motivo: c === 1
            ? 'faltou preço, Realized Price ou a régua do MVRV'
            : `ausentes pesam ${(frac * 100).toFixed(0)}% da camada, acima do terço da trava`,
        };
      }),
    confiancas: [...lidos.values()].filter((x) => x.confianca < 1)
      .map((x) => ({ indicador: x.n, confianca: x.confianca, bruto: x.bruto, ajustado: x.posicao })),
    ausencias,
    extremosProvisorios: seriesComExtremosProvisorios().filter((n) => varredura?.[n]),
    extremos: estadoDosExtremos(varredura),
    mudou,
    semRecomendacao: true, // a Torre lê regime. Não decide nada.
  };
}

function compararComAnterior(atual, anterior) {
  if (!anterior) return { primeira: true, linha: 'primeira leitura registrada' };
  const faixaMudou = anterior.faixa !== atual.faixa;
  const estadoMudou = anterior.estado !== atual.estado;
  if (!faixaMudou && !estadoMudou) {
    return { faixaMudou: false, estadoMudou: false, linha: `nada mudou de faixa nem de estado desde ${anterior.data ?? 'a leitura anterior'}` };
  }
  const partes = [];
  if (estadoMudou) partes.push(`estado: ${anterior.estado} → ${atual.estado}`);
  if (faixaMudou) partes.push(`faixa: ${anterior.faixa} → ${atual.faixa}`);
  return { faixaMudou, estadoMudou, linha: partes.join(' · '), indiceAntes: anterior.indice };
}

/** O evento de leitura que a peça 1 grava. A Torre não guarda: entrega para gravar. */
export function eventoDeLeitura(carteira, saida, varredura) {
  if (!saida.disponivel) return null;
  const indicadores = {};
  for (const s of SERIES) if (varredura?.[s.n]) indicadores[s.n] = varredura[s.n].valor;
  return { carteira, tipo: TIPOS.LEITURA, data: saida.hoje, indice: saida.indice, estado: saida.estado, indicadores };
}

// ── CAMADA 5, QUANDO HOUVER CARTEIRA ──────────────────────────────────────
// Lê do registro da peça 1. A Torre não guarda degrau nem posição: consulta.

export const TRAVA_SEM_DEGRAU = 30; // D17 C — % da parte exposta

/**
 * D21 B: degrau de BTC ou ETH vencido — ou nunca atribuído — SUSPENDE a camada 5
 * por inteiro, nomeada e datada. Não é ausência diluída.
 * D17 B: agregação por média ponderada pelo tamanho da posição na parte exposta.
 * D17 C: quem não tem degrau sai do cálculo; passando de 30%, a camada sai inteira.
 */
export function camada5({ registro, carteira, hoje, posicoes }) {
  if (!posicoes || Object.keys(posicoes).length === 0) {
    return { disponivel: false, motivo: 'sem carteira ativa' };
  }
  const suspensao = registro.suspensaoDaCamada5(carteira, hoje);
  if (suspensao.suspensa) {
    return {
      disponivel: false, suspensa: true, ativo: suspensao.ativo, desde: suspensao.desde,
      motivo: `camada 5 suspensa por tese ${suspensao.razao} em ${suspensao.ativo}` +
              (suspensao.desde ? `, desde ${suspensao.desde}` : ''),
    };
  }

  const degraus = registro.degraus(carteira, hoje);
  const semDegrau = [], comDegrau = [];
  for (const [ativo, peso] of Object.entries(posicoes)) {
    const d = degraus.get(ativo);
    (d && d.status === 'vigente' ? comDegrau : semDegrau).push({ ativo, peso, valor: d?.valor });
  }

  // A trava conta só o que não é BTC nem ETH: eles saíram da conta pela D21 B.
  const pesoSemDegrau = semDegrau.filter((x) => !['BTC', 'ETH'].includes(x.ativo))
    .reduce((s, x) => s + x.peso, 0);
  if (pesoSemDegrau > TRAVA_SEM_DEGRAU) {
    return {
      disponivel: false, motivo: `ativos sem degrau somam ${pesoSemDegrau.toFixed(1)}% da parte exposta, ` +
        `acima da trava de ${TRAVA_SEM_DEGRAU}% — a camada descreveria menos de dois terços da carteira`,
      semDegrau: semDegrau.map((x) => x.ativo),
    };
  }

  const somaPesos = comDegrau.reduce((s, x) => s + x.peso, 0);
  if (somaPesos === 0) return { disponivel: false, motivo: 'nenhum ativo com degrau vigente' };
  const posicao = comDegrau.reduce((s, x) => s + x.valor * x.peso, 0) / somaPesos;
  return {
    disponivel: true, posicao,
    itens: comDegrau.map((x) => `${x.ativo} ${x.valor} (${x.peso.toFixed(1)}%)`),
    semDegrau: semDegrau.map((x) => x.ativo),
    etiqueta: registro.etiquetaDeJulgamento(carteira, hoje),
  };
}

// ── VARREDURA DA COMPOSIÇÃO DA CRM ────────────────────────────────────────
// D16 B: segunda varredura, separada dos catorze. Ilegível congela o universo.

/**
 * Filtro de Horizonte (D15). Só a alínea (b) é mecânica — as outras três exigem
 * julgamento, e sem ele o ativo fica PENDENTE. Aprovar por omissão seria o default
 * silencioso que a invariante 3 proíbe.
 */
export function filtroDeHorizonte(ativo, j = {}, { limiarLiquidez = LIMIAR_LIQUIDEZ, exchangesMinimas = EXCHANGES_MINIMAS } = {}) {
  const reprovas = [], pendentesAutomaticas = [], pendentesDeJulgamento = [], ignoradas = [];

  // (a) e (b) são objetivas: a Torre aplica sozinha (D36 A).
  // (a) D37 A: volume médio diário de 30 dias ≥ US$ 100 mi, em pelo menos duas
  // exchanges de primeira linha, cada uma medida sozinha. Somar não vale.
  const vols = j.volumes30d;
  if (!vols || Object.keys(vols).length === 0) {
    pendentesAutomaticas.push('(a) liquidez — volumes de 30 dias não vieram na varredura');
  } else {
    const entradas = Object.entries(vols);
    const foraDaLista = entradas.filter(([e]) => !naLista(e)).map(([e]) => e);
    const qualificam = entradas.filter(([e, v]) => naLista(e) && typeof v === 'number' && v >= limiarLiquidez);
    if (qualificam.length < exchangesMinimas) {
      const detalhe = entradas.map(([e, v]) => `${e} ${(v / 1e6).toFixed(0)}mi${naLista(e) ? '' : ' (fora da lista)'}`).join(', ');
      reprovas.push(`(a) liquidez: ${qualificam.length} exchange(s) de primeira linha acima de ` +
        `US$ ${limiarLiquidez / 1e6} mi, exige ${exchangesMinimas} — ${detalhe}`);
    }
    if (foraDaLista.length) ignoradas.push(...foraDaLista);
  }

  if (['BTC', 'ETH'].includes(ativo)) {
    // (b): BTC e ETH passam por definição
  } else if (typeof j.ciclosCompletos === 'number') {
    if (j.ciclosCompletos < 1) reprovas.push('(b) não atravessou um ciclo completo');
  } else pendentesAutomaticas.push('(b) ciclos completos — dado não veio');

  // (c) e (d) vão ao Gui como julgamento, com o registro pronto para o motivo.
  for (const [chave, alinea] of [['teseSemEventoDatado', '(c) tese sem evento datado'], ['semAlavancagemOuContraparte', '(d) sem alavancagem, sintético ou contraparte concentrada']]) {
    if (typeof j[chave] !== 'boolean') pendentesDeJulgamento.push(alinea);
    else if (!j[chave]) reprovas.push(alinea);
  }

  if (reprovas.length) return { veredito: 'reprovado', motivo: reprovas.join(' · '), exchangesIgnoradas: ignoradas };
  if (pendentesAutomaticas.length || pendentesDeJulgamento.length) {
    const partes = [];
    if (pendentesDeJulgamento.length) partes.push(`julgamento do Gui: ${pendentesDeJulgamento.join(' · ')}`);
    if (pendentesAutomaticas.length) partes.push(`dado ou limiar faltando: ${pendentesAutomaticas.join(' · ')}`);
    return { veredito: 'pendente', motivo: partes.join(' | '), pendentesDeJulgamento, pendentesAutomaticas, exchangesIgnoradas: ignoradas };
  }
  return { veredito: 'aprovado', motivo: 'passa nas quatro alíneas do Filtro de Horizonte', exchangesIgnoradas: ignoradas };
}

/**
 * D36 A: a fila de julgamento pendente, com há quantos dias cada ativo está nela.
 * Ausência de julgamento nunca vira aprovação — o ativo não entra no universo
 * elegível e não recebe aporte enquanto estiver aqui.
 */
export function filaDeJulgamento(registro, carteira, hoje) {
  const DIA = 86400000;
  const desde = new Map();
  for (const c of registro.eventos({ carteira, tipo: TIPOS.CRM_COMPOSICAO })) {
    if (!c.legivel) continue;
    for (const ativo of c.ativos) if (!desde.has(ativo)) desde.set(ativo, c.data);
  }
  const fila = [];
  for (const [ativo, entrouEm] of desde) {
    const s = registro.situacaoDoAtivo(carteira, ativo);
    if (s.disponivel) continue; // já tem veredito de filtro, contagem ou invalidação
    fila.push({
      ativo, naFilaDesde: entrouEm,
      dias: Math.round((Date.parse(`${hoje}T00:00:00Z`) - Date.parse(`${entrouEm}T00:00:00Z`)) / DIA),
    });
  }
  return fila.sort((a, b) => b.dias - a.dias);
}

export function varreduraDaCRM({ registro, carteira, composicao, hoje, julgamentos = {}, limiarLiquidez }) {
  const anterior = registro.composicaoCRM(carteira);

  if (composicao === null || composicao === undefined) {
    // D16 B: ilegível congela no último estado conhecido, marcado e datado.
    const evento = { carteira, tipo: TIPOS.CRM_COMPOSICAO, data: hoje, legivel: false };
    if (!anterior.disponivel) {
      return { legivel: false, universo: null, motivo: anterior.motivo, evento };
    }
    return {
      legivel: false, congelada: true, universo: anterior.ativos,
      desatualizadaDesde: anterior.desatualizadaDesde ?? anterior.lidaEm,
      motivo: `composição ilegível; universo congelado no estado de ${anterior.desatualizadaDesde ?? anterior.lidaEm}`,
      evento,
    };
  }

  const antes = anterior.disponivel ? anterior.ativos : [];
  const incluidos = composicao.filter((a) => !antes.includes(a));
  const removidos = antes.filter((a) => !composicao.includes(a));
  const eventos = [{ carteira, tipo: TIPOS.CRM_COMPOSICAO, data: hoje, legivel: true, ativos: composicao }];

  const filtrados = incluidos.map((ativo) => {
    const r = filtroDeHorizonte(ativo, julgamentos[ativo], { limiarLiquidez });
    if (r.veredito !== 'pendente') {
      eventos.push({ carteira, tipo: TIPOS.FILTRO_HORIZONTE, data: hoje, ativo, aprovado: r.veredito === 'aprovado', motivo: r.motivo });
    }
    return { ativo, ...r };
  });

  return {
    legivel: true, congelada: false, universo: composicao,
    incluidos: filtrados, removidos,
    fila: filaDeJulgamento(registro, carteira, hoje),
    nadaMudou: incluidos.length === 0 && removidos.length === 0,
    eventos,
  };
}
