// TORRE DE CONTROLE — peça 2 da implementação da Carteira Semente.
//
// SÓ LÊ. Não decide, não aloca, não classifica estação, não guarda estado próprio:
// o que precisa durar sai daqui como evento para o registro da peça 1.
//
// Invariante que governa o arquivo inteiro: SEM DEFAULT SILENCIOSO (invariante 3).
// Indicador que não voltou é nomeado como ausente. Nunca se estima, nunca se
// repete o valor de ontem, nunca se preenche buraco com a média do resto.

import { TIPOS } from '../registro/registro.mjs';

// ── AS CATORZE SÉRIES, SEMPRE AS MESMAS E NESTA ORDEM (invariante 7) ───────
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
]);

export const PESOS = Object.freeze({ 1: 0.34, 2: 0.26, 3: 0.16, 4: 0.12, 5: 0.12 });

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
      camada: c, posicao: camadas.get(c).posicao,
      pesoNominal: PESOS[c], pesoAplicado: PESOS[c] / somaPesos,
      itens: camadas.get(c).itens,
      ausentes: camadas.get(c).ausentes ?? [],
    })),
    camadasForaDaConta: [1, 2, 3, 4, 5].filter((c) => !camadas.has(c))
      .map((c) => {
        if (c === 5) return { camada: 5, motivo: camada5?.motivo ?? 'sem carteira ativa' };
        const daCamada = SERIES.filter((s) => s.camada === c && s.papel === undefined);
        const faltando = daCamada.filter((s) => !lidos.has(s.n)).map((s) => s.n);
        const frac = daCamada.length ? faltando.length / daCamada.length : 1;
        return {
          camada: c, ausentes: faltando,
          motivo: c === 1
            ? 'faltou preço, Realized Price ou a régua do MVRV'
            : `ausentes pesam ${(frac * 100).toFixed(0)}% da camada, acima do terço da trava`,
        };
      }),
    confiancas: [...lidos.values()].filter((x) => x.confianca < 1)
      .map((x) => ({ indicador: x.n, confianca: x.confianca, bruto: x.bruto, ajustado: x.posicao })),
    ausencias,
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
export function filtroDeHorizonte(ativo, j = {}, { limiarLiquidez } = {}) {
  const reprovas = [], pendentesAutomaticas = [], pendentesDeJulgamento = [];

  // (a) e (b) são objetivas: a Torre aplica sozinha (D36 A).
  if (typeof limiarLiquidez !== 'number') pendentesAutomaticas.push('(a) liquidez — limiar não definido no sistema');
  else if (typeof j.liquidez !== 'number') pendentesAutomaticas.push('(a) liquidez — medida não veio na varredura');
  else if (j.liquidez < limiarLiquidez) reprovas.push(`(a) liquidez ${j.liquidez} abaixo do limiar ${limiarLiquidez}`);

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

  if (reprovas.length) return { veredito: 'reprovado', motivo: reprovas.join(' · ') };
  if (pendentesAutomaticas.length || pendentesDeJulgamento.length) {
    const partes = [];
    if (pendentesDeJulgamento.length) partes.push(`julgamento do Gui: ${pendentesDeJulgamento.join(' · ')}`);
    if (pendentesAutomaticas.length) partes.push(`dado ou limiar faltando: ${pendentesAutomaticas.join(' · ')}`);
    return { veredito: 'pendente', motivo: partes.join(' | '), pendentesDeJulgamento, pendentesAutomaticas };
  }
  return { veredito: 'aprovado', motivo: 'passa nas quatro alíneas do Filtro de Horizonte' };
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
