import { test } from 'node:test';
import assert from 'node:assert/strict';
import { varrer, normalizar, confianca, amortecer, classificarLinhaDagua, faixaDoIndice, eventoDeLeitura, camada5, varreduraDaCRM, filtroDeHorizonte, filaDeJulgamento, LIMIAR_LIQUIDEZ, EXCHANGES_MINIMAS, JANELA_LIQUIDEZ_DIAS, EXCHANGES_PRIMEIRA_LINHA, seriesComExtremosProvisorios, estadoDosExtremos, filaDeConferencia, valoresPendentes, especieDoExtremo, TETOS_DA_METRICA, METODOS_DE_CONFERENCIA, CALENDARIOS, semPregao, dataSuspeitaDeCarregamento, HOMONIMOS_NO_TERMINAL, SERIES_EM_PATAMAR, METODOS_DE_VARREDURA, CASAS_NA_TOOLTIP, excedeATooltip, camposQueExcedemATooltip, comandoDeConferencia, efeitoDosExtremos, EXTREMOS_INERTES, CAMADAS, PESOS, ESTADOS, SERIES } from './torre.mjs';
import { VARREDURA_29_08_2026 as V } from './leitura-29-08-2026.mjs';
import { Registro, AdaptadorMemoria, TIPOS } from '../registro/registro.mjs';

const HOJE = '2026-08-29';
const perto = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

// ══ ITEM 5 · A LEITURA REAL DE 29/08/2026 ═════════════════════════════════
test('as leituras reais devolvem 50,75 · Equilíbrio · Mercado saudável', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.equal(r.disponivel, true);
  perto(r.indice, 50.75);
  // Fixado na quarta casa: é o valor exato que a derivação independente da rodada
  // da Decisão 7 produziu. As duas implementações concordam dígito a dígito.
  assert.equal(r.indice.toFixed(4), '50.7536');
  assert.equal(Math.round(r.indice), 51, 'exibido 51');
  assert.equal(r.faixa, 'Equilíbrio');
  assert.equal(r.estado, ESTADOS.SAUDAVEL);
  // D37 C acrescentou o Exchange Netflow, que não foi coletado em 29/08/2026.
  // O âncora sobrevive porque a D36 B deixa a camada 4 renormalizar sobre os dois
  // que voltaram — 1 de 3 é exatamente um terço, e um terço cabe.
  assert.deepEqual(r.ausencias.map((a) => a.indicador), ['Exchange Netflow']);
  assert.deepEqual(r.camadas.find((c) => c.camada === 4).ausentes, ['Exchange Netflow']);
});

test('cada camada bate com o documento 03', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  const pos = (c) => r.camadas.find((x) => x.camada === c).posicao;
  perto(pos(1), 44.41);   // preço ÷ Realized Price, régua do MVRV
  perto(pos(2), 60.27);   // SOPR · Supply in Profit · Liveliness — três itens
  perto(pos(3), 50.88);
  perto(pos(4), 47.94);   // com o ETF amortecido
});

test('a camada 5 fica fora e os pesos renormalizam sobre 0,88', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.equal(r.camadas.length, 4);
  assert.deepEqual(r.camadasForaDaConta.map((c) => c.camada), [5]);
  assert.equal(r.camadasForaDaConta[0].motivo, 'sem carteira ativa');
  const aplicados = r.camadas.map((c) => c.pesoAplicado);
  perto(aplicados[0], 0.34 / 0.88); perto(aplicados[3], 0.12 / 0.88);
  perto(aplicados.reduce((a, b) => a + b, 0), 1);
});

// ══ ITEM 1 · NORMALIZAÇÃO POR FAIXA PRÓPRIA ═══════════════════════════════
test('log para série multiplicativa, linear para aditiva', () => {
  // MVRV é log: 1,465 em [0,384 ; 7,854] dá 44,4 — linear daria 14,5
  perto(normalizar(1.465, 0.384, 7.854, 'log'), 44.36, 0.01);
  perto(normalizar(1.465, 0.384, 7.854, 'lin'), 14.48, 0.01);
  // Supply in Profit é linear
  perto(normalizar(67.4, 35.6, 100.0, 'lin'), 49.38, 0.01);
});

test('DXY e Fed Funds entram invertidos', () => {
  perto(normalizar(99.16, 72.93, 114.11, 'lin'), 63.70, 0.01);
  perto(normalizar(99.16, 72.93, 114.11, 'lin', true), 36.30, 0.01);
});

test('valor fora da faixa histórica é limitado, não extrapolado', () => {
  assert.equal(normalizar(200, 0, 100, 'lin'), 100);
  assert.equal(normalizar(-50, 0, 100, 'lin'), 0);
});

test('o fator de confiança amortece só a série curta (D7)', () => {
  perto(confianca('2024-01-11', '2026-08-27'), 0.525, 0.005);  // ETF, 2,63 anos
  assert.equal(confianca('2020-01-01', HOJE), 1, 'Funding, 6,7 anos, confiança plena');
  assert.equal(confianca('2011-01-01', HOJE), 1);
  perto(amortecer(54.97, 0.525), 52.61, 0.01); // = o 52,61 do documento 03
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.deepEqual(r.confiancas.map((c) => c.indicador), ['ETF Net Inflow'], 'só o ETF é amortecido hoje');
});

// ══ ITEM 2 · RENORMALIZAÇÃO E AUSÊNCIAS NOMEADAS ══════════════════════════
test('ausência é nomeada uma a uma, com a camada', () => {
  const sem = { ...V }; delete sem['SOPR']; delete sem['DXY'];
  const r = varrer({ varredura: sem, hoje: HOJE });
  assert.deepEqual(r.ausencias.map((a) => a.indicador).sort(), ['DXY', 'Exchange Netflow', 'SOPR']);
  assert.equal(r.ausencias.find((a) => a.indicador === 'SOPR').camada, 2);
});

// ══ D36 B · AUSÊNCIA PARCIAL DENTRO DA CAMADA ═════════════════════════════
test('um ausente de três: a camada renormaliza internamente e fica', () => {
  const sem = { ...V }; delete sem['SOPR'];
  const r = varrer({ varredura: sem, hoje: HOJE });
  assert.deepEqual(r.camadas.map((c) => c.camada), [1, 2, 3, 4], 'a camada 2 continua');
  const c2 = r.camadas.find((c) => c.camada === 2);
  perto(c2.posicao, (49.38 + 98.59) / 2, 0.05, 'média só de Supply in Profit e Liveliness');
  assert.deepEqual(c2.ausentes, ['SOPR'], 'e a entrega nomeia quem faltou');
  perto(c2.pesoAplicado, 0.26 / 0.88, 0.001, 'o peso da camada não muda');
});

test('dois ausentes de três passam do terço: a camada sai inteira', () => {
  const sem = { ...V }; delete sem['SOPR']; delete sem['Liveliness'];
  const r = varrer({ varredura: sem, hoje: HOJE });
  assert.deepEqual(r.camadas.map((c) => c.camada), [1, 3, 4]);
  const fora = r.camadasForaDaConta.find((c) => c.camada === 2);
  assert.deepEqual(fora.ausentes.sort(), ['Liveliness', 'SOPR']);
  assert.match(fora.motivo, /67% da camada, acima do terço/);
  perto(r.camadas.find((c) => c.camada === 1).pesoAplicado, 0.34 / 0.62);
});

test('um de quatro cabe; dois de quatro não', () => {
  const um = { ...V }; delete um['DXY'];
  assert.ok(varrer({ varredura: um, hoje: HOJE }).camadas.some((c) => c.camada === 3), '25% cabe');
  const dois = { ...V }; delete dois['DXY']; delete dois['US M2'];
  assert.ok(!varrer({ varredura: dois, hoje: HOJE }).camadas.some((c) => c.camada === 3), '50% não cabe');
});

test('a camada 4 tem dois indicadores: qualquer ausência a derruba', () => {
  const sem = { ...V }; delete sem['ETF Net Inflow'];
  const r = varrer({ varredura: sem, hoje: HOJE });
  assert.ok(!r.camadas.some((c) => c.camada === 4), '50% de ausência passa do terço');
});

test('indicador zerado ou com traço é ausência, não zero', () => {
  const r = varrer({ varredura: { ...V, 'Liveliness': { valor: null, min: 0.1785, max: 0.6410 } }, hoje: HOJE });
  assert.equal(r.ausencias[0].indicador, 'Liveliness');
  assert.match(r.ausencias[0].motivo, /zerado ou com traço/);
});

test('sem nenhuma camada inteira, não há índice — e o motivo vem junto', () => {
  const r = varrer({ varredura: {}, hoje: HOJE });
  assert.equal(r.disponivel, false);
  assert.equal(r.ausencias.length, 15);
  assert.equal(r.estado, null, 'sem Linha dágua não há estado');
});

// ══ LINHA D'ÁGUA ══════════════════════════════════════════════════════════
test('os quatro estados, pela regra objetiva da D04', () => {
  const c = { realizedPrice: 53057, sth: 69977, lth: 49449 };
  assert.equal(classificarLinhaDagua({ ...c, preco: 40000 }), ESTADOS.CAPITULACAO);
  assert.equal(classificarLinhaDagua({ ...c, preco: 51000 }), ESTADOS.PREJUIZO);
  assert.equal(classificarLinhaDagua({ ...c, preco: 60000 }), ESTADOS.ESTRESSE);
  assert.equal(classificarLinhaDagua({ ...c, preco: 77839 }), ESTADOS.SAUDAVEL);
});

test('as faixas são de intensidade e não disparam nada', () => {
  assert.equal(faixaDoIndice(10), 'Fundo');
  assert.equal(faixaDoIndice(50.75), 'Equilíbrio');
  assert.equal(faixaDoIndice(90), 'Extremo');
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.equal(r.semRecomendacao, true);
  assert.equal(r.estacao, undefined, 'a Torre não classifica estação');
});

// ══ O QUE MUDOU DESDE A ÚLTIMA LEITURA ════════════════════════════════════
test('nada mudou de faixa nem de estado: uma linha só', () => {
  const anterior = { indice: 50.1, faixa: 'Equilíbrio', estado: ESTADOS.SAUDAVEL, data: '2026-08-28' };
  const r = varrer({ varredura: V, hoje: HOJE, anterior });
  assert.equal(r.mudou.faixaMudou, false);
  assert.equal(r.mudou.linha, 'nada mudou de faixa nem de estado desde 2026-08-28');
});

test('mudança de estado e de faixa aparecem nomeadas', () => {
  const anterior = { indice: 38, faixa: 'Comprimido', estado: ESTADOS.PREJUIZO, data: '2026-08-28' };
  const r = varrer({ varredura: V, hoje: HOJE, anterior });
  assert.match(r.mudou.linha, /Prejuízo do mercado → Mercado saudável/);
  assert.match(r.mudou.linha, /Comprimido → Equilíbrio/);
});

// ══ A TORRE NÃO GUARDA: ENTREGA PARA GRAVAR ═══════════════════════════════
test('o evento de leitura entra no registro da peça 1 e é derivável de lá', () => {
  const reg = new Registro(new AdaptadorMemoria());
  const r = varrer({ varredura: V, hoje: HOJE });
  reg.registrar(eventoDeLeitura('carteira-1', r, V));
  const gravado = reg.eventos({ carteira: 'carteira-1', tipo: TIPOS.LEITURA })[0];
  perto(gravado.indice, 50.75);
  assert.equal(gravado.estado, ESTADOS.SAUDAVEL);
  assert.equal(Object.keys(gravado.indicadores).length, 14, 'os catorze vão junto, retificáveis pela D34');
});

// ══ ITEM 3 · CAMADA 5 SUSPENSA POR INTEIRO (D21 B) ════════════════════════
const comRegistro = () => new Registro(new AdaptadorMemoria());
const CT = 'carteira-1';
const degrau = (reg, data, ativo, valor) => reg.registrar({ carteira: CT, tipo: TIPOS.DEGRAU, data, ativo, valor, motivo: 'revisão de tese' });
const POS = { BTC: 35, ETH: 25, SOL: 8, AVAX: 8, LINK: 8, DOT: 8, UNI: 8 };

test('BTC vencido suspende a camada 5 inteira, nomeada e datada', () => {
  const reg = comRegistro();
  for (const a of Object.keys(POS)) degrau(reg, '2026-01-01', a, 100);
  const c = camada5({ registro: reg, carteira: CT, hoje: '2026-07-02', posicoes: POS }); // 182 dias
  assert.equal(c.disponivel, false);
  assert.equal(c.suspensa, true);
  assert.equal(c.ativo, 'BTC');
  assert.equal(c.desde, '2026-01-01');
  assert.match(c.motivo, /suspensa por tese tese vencida em BTC, desde 2026-01-01/);
});

test('BTC sem degrau nenhum também suspende — não é ausência diluída', () => {
  const reg = comRegistro();
  for (const a of Object.keys(POS).filter((x) => x !== 'BTC')) degrau(reg, '2026-08-01', a, 100);
  const c = camada5({ registro: reg, carteira: CT, hoje: '2026-08-29', posicoes: POS });
  assert.equal(c.suspensa, true);
  assert.match(c.motivo, /nunca atribuído em BTC/);
});

test('a suspensão entra no índice como camada fora, e os pesos renormalizam', () => {
  const reg = comRegistro();
  const c5 = camada5({ registro: reg, carteira: CT, hoje: '2026-08-29', posicoes: POS });
  const r = varrer({ varredura: V, hoje: HOJE, camada5: c5 });
  perto(r.indice, 50.75, 0.01);
  assert.equal(r.camadasForaDaConta.find((c) => c.camada === 5).motivo, c5.motivo);
});

test('com todos os degraus vigentes, a camada 5 é média ponderada pela posição (D17 B)', () => {
  const reg = comRegistro();
  degrau(reg, '2026-08-01', 'BTC', 100); degrau(reg, '2026-08-01', 'ETH', 100);
  for (const a of ['SOL', 'AVAX', 'LINK', 'DOT', 'UNI']) degrau(reg, '2026-08-01', a, 33);
  const c = camada5({ registro: reg, carteira: CT, hoje: '2026-08-29', posicoes: POS });
  assert.equal(c.disponivel, true);
  perto(c.posicao, (100 * 60 + 33 * 40) / 100, 0.01, 'BTC+ETH dominam por serem 60%');
  assert.equal(c.etiqueta.disponivel, true, 'e a etiqueta de julgamento vem junto');
});

test('a trava dos 30% derruba a camada, e conta só quem não é BTC nem ETH (D17 C)', () => {
  const reg = comRegistro();
  degrau(reg, '2026-08-01', 'BTC', 100); degrau(reg, '2026-08-01', 'ETH', 100);
  degrau(reg, '2026-08-01', 'SOL', 66);           // 8% com degrau
  // AVAX, LINK, DOT, UNI sem degrau = 32% > 30%
  const c = camada5({ registro: reg, carteira: CT, hoje: '2026-08-29', posicoes: POS });
  assert.equal(c.disponivel, false);
  assert.match(c.motivo, /32,0|32\.0/);
  assert.match(c.motivo, /acima da trava de 30%/);
});

test('três ativos sem degrau (24%) ainda cabem na trava', () => {
  const reg = comRegistro();
  for (const a of ['BTC', 'ETH', 'SOL', 'AVAX']) degrau(reg, '2026-08-01', a, 100);
  const c = camada5({ registro: reg, carteira: CT, hoje: '2026-08-29', posicoes: POS });
  assert.equal(c.disponivel, true);
  assert.deepEqual(c.semDegrau.sort(), ['DOT', 'LINK', 'UNI']);
});

// ══ ITEM 4 · COMPOSIÇÃO DA CRM ILEGÍVEL CONGELA O UNIVERSO ════════════════
const APROVA = {
  volumes30d: { binance: 250e6, coinbase: 180e6 },
  ciclosCompletos: 2, teseSemEventoDatado: true, semAlavancagemOuContraparte: true,
};

test('ilegível congela o universo no último estado, marcado e datado', () => {
  const reg = comRegistro();
  reg.registrar({ carteira: CT, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-01', legivel: true, ativos: ['BTC', 'ETH', 'SOL'] });
  const v = varreduraDaCRM({ registro: reg, carteira: CT, composicao: null, hoje: '2026-08-29' });
  assert.equal(v.legivel, false);
  assert.equal(v.congelada, true);
  assert.deepEqual(v.universo, ['BTC', 'ETH', 'SOL']);
  assert.equal(v.desatualizadaDesde, '2026-08-01');
  assert.equal(v.evento.legivel, false, 'e a ilegibilidade também é gravada');
});

test('ilegível sem nenhuma leitura anterior não inventa universo', () => {
  const v = varreduraDaCRM({ registro: comRegistro(), carteira: CT, composicao: null, hoje: '2026-08-29' });
  assert.equal(v.universo, null);
});

test('incluídos e removidos, com o filtro aplicado na hora', () => {
  const reg = comRegistro();
  reg.registrar({ carteira: CT, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-01', legivel: true, ativos: ['BTC', 'ETH', 'SOL'] });
  const v = varreduraDaCRM({
    registro: reg, carteira: CT, composicao: ['BTC', 'ETH', 'AVAX'], hoje: '2026-08-29',
    julgamentos: { AVAX: APROVA },
  });
  assert.deepEqual(v.incluidos.map((i) => i.ativo), ['AVAX']);
  assert.equal(v.incluidos[0].veredito, 'aprovado');
  assert.deepEqual(v.removidos, ['SOL']);
  assert.ok(v.eventos.some((e) => e.tipo === TIPOS.FILTRO_HORIZONTE && e.ativo === 'AVAX' && e.aprovado));
});

test('nada mudou sai como nada mudou', () => {
  const reg = comRegistro();
  reg.registrar({ carteira: CT, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-01', legivel: true, ativos: ['BTC', 'ETH'] });
  const v = varreduraDaCRM({ registro: reg, carteira: CT, composicao: ['BTC', 'ETH'], hoje: '2026-08-29' });
  assert.equal(v.nadaMudou, true);
});

test('sem julgamento humano o ativo fica PENDENTE, e nenhum evento de filtro nasce', () => {
  const reg = comRegistro();
  const v = varreduraDaCRM({ registro: reg, carteira: CT, composicao: ['XYZ'], hoje: '2026-08-29' });
  assert.equal(v.incluidos[0].veredito, 'pendente');
  assert.match(v.incluidos[0].motivo, /julgamento do Gui/);
  assert.equal(v.eventos.filter((e) => e.tipo === TIPOS.FILTRO_HORIZONTE).length, 0, 'não se aprova por omissão');
});

test('BTC e ETH passam a alínea (b) por definição', () => {
  const semCiclos = { volumes30d: { binance: 250e6, coinbase: 180e6 }, teseSemEventoDatado: true, semAlavancagemOuContraparte: true };
  assert.equal(filtroDeHorizonte('BTC', semCiclos).veredito, 'aprovado');
  assert.equal(filtroDeHorizonte('XYZ', semCiclos).veredito, 'pendente');
});

// ══ D36 A · AS DUAS OBJETIVAS E AS DUAS DE JULGAMENTO ═════════════════════
test('a Torre aplica (a) e (b) sozinha, e separa (c) e (d) como julgamento', () => {
  const r = filtroDeHorizonte('XYZ', { volumes30d: { binance: 250e6, coinbase: 180e6 }, ciclosCompletos: 2 });
  assert.equal(r.veredito, 'pendente');
  assert.deepEqual(r.pendentesAutomaticas, [], '(a) e (b) foram resolvidas sozinhas');
  assert.equal(r.pendentesDeJulgamento.length, 2, 'sobram (c) e (d) para o Gui');
});

// ══ D37 A · O LIMIAR DE LIQUIDEZ, COM NÚMERO ═════════════════════════════
test('duas exchanges acima de US$ 100 mi aprovam a alínea (a)', () => {
  assert.equal(filtroDeHorizonte('XYZ', APROVA).veredito, 'aprovado');
});

test('volume concentrado numa exchange só reprova — é dependência, não liquidez', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { binance: 900e6, kraken: 20e6 } });
  assert.equal(r.veredito, 'reprovado');
  assert.match(r.motivo, /1 exchange\(s\) de primeira linha acima de US\$ 100 mi, exige 2/);
});

test('somar não vale: 60 + 60 dá 120 mi somados e reprova mesmo assim', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { binance: 60e6, coinbase: 60e6 } });
  assert.equal(r.veredito, 'reprovado', 'medido separadamente, nenhuma das duas passa');
});

test('sem os volumes, (a) fica pendente e não aprova por omissão', () => {
  const { volumes30d, ...semVolumes } = APROVA;
  const r = filtroDeHorizonte('XYZ', semVolumes);
  assert.equal(r.veredito, 'pendente');
  assert.match(r.motivo, /volumes de 30 dias não vieram/);
});

test('o limiar e o mínimo de exchanges são os da D37 A', () => {
  assert.equal(LIMIAR_LIQUIDEZ, 100_000_000);
  assert.equal(EXCHANGES_MINIMAS, 2);
  assert.equal(JANELA_LIQUIDEZ_DIAS, 30);
});

// ══ D37 C · O TERCEIRO INDICADOR DA CAMADA 4 ═════════════════════════════
const NETFLOW = { valor: 0, min: -100, max: 100, data: '2026-08-28' };
const COMPLETA = { ...V, 'Exchange Netflow': NETFLOW };

test('a camada 4 tem três indicadores e deixou de cair com uma ausência', () => {
  assert.deepEqual(SERIES.filter((s) => s.camada === 4).map((s) => s.n),
    ['ETF Net Inflow', 'Funding Rate', 'Exchange Netflow']);
  const sem = { ...COMPLETA }; delete sem['Funding Rate'];
  const c4 = varrer({ varredura: sem, hoje: HOJE }).camadas.find((c) => c.camada === 4);
  assert.ok(c4, 'com três, uma ausência pesa 33% e a camada fica');
  assert.deepEqual(c4.ausentes, ['Funding Rate']);
  perto(c4.posicao, (52.6092 + 50) / 2, 0.01, 'renormaliza sobre os dois que voltaram');
});

test('antes da D37 C, essa mesma ausência derrubaria 13,6% do índice de uma vez', () => {
  // com dois indicadores, uma ausência era 50% — acima do terço, camada fora.
  const doisSo = { ...V }; delete doisSo['Funding Rate'];
  assert.ok(!varrer({ varredura: doisSo, hoje: HOJE }).camadas.some((c) => c.camada === 4));
  // com três, a mesma falta de Funding deixa a camada de pé.
  const tres = { ...COMPLETA }; delete tres['Funding Rate'];
  assert.ok(varrer({ varredura: tres, hoje: HOJE }).camadas.some((c) => c.camada === 4));
});

test('duas ausências de três derrubam a camada 4, como nas outras', () => {
  const sem = { ...COMPLETA }; delete sem['Funding Rate']; delete sem['ETF Net Inflow'];
  assert.ok(!varrer({ varredura: sem, hoje: HOJE }).camadas.some((c) => c.camada === 4));
});

test('o netflow é aditivo e tem série longa, e não duplica os outros dois', () => {
  const nf = SERIES.find((s) => s.n === 'Exchange Netflow');
  assert.equal(nf.escala, 'lin', 'aditivo para efeito de normalização');
  assert.equal(nf.inicioSerie, '2011-01-01', 'série longa, confiança plena');
  assert.equal(nf.invertido, undefined);
});

// ══ D37 D · PESOS INTERNOS IGUAIS ════════════════════════════════════════
test('os três da camada 4 pesam igual — média simples, sem peso inventado', () => {
  const r = varrer({ varredura: COMPLETA, hoje: HOJE });
  const c4 = r.camadas.find((c) => c.camada === 4);
  perto(c4.posicao, (52.6092 + 43.2621 + 50) / 3, 0.01, 'os três entram com o mesmo peso');
  assert.deepEqual(c4.ausentes, []);
});

test('a fila de julgamento traz há quantos dias cada ativo espera', () => {
  const reg = comRegistro();
  reg.registrar({ carteira: CT, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-01', legivel: true, ativos: ['BTC', 'XYZ'] });
  reg.registrar({ carteira: CT, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'BTC', aprovado: true, motivo: 'passa' });
  const fila = filaDeJulgamento(reg, CT, '2026-08-29');
  assert.deepEqual(fila.map((f) => f.ativo), ['XYZ'], 'BTC já tem veredito e saiu da fila');
  assert.equal(fila[0].dias, 28);
  assert.equal(fila[0].naFilaDesde, '2026-08-01');
});

// ══ D36 C · CONFIANÇA ATÉ A ÚLTIMA DATA DO INDICADOR ══════════════════════
test('a janela de confiança termina na data do indicador, não em hoje', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  const etf = r.confiancas.find((c) => c.indicador === 'ETF Net Inflow');
  perto(etf.confianca, confianca('2024-01-11', '2026-08-27'), 1e-9, 'usa 27/08, a data do dado');
  assert.notEqual(etf.confianca, confianca('2024-01-11', HOJE));
});

test('série parada não ganha confiança por ficar parada', () => {
  const parada = { ...V, 'ETF Net Inflow': { ...V['ETF Net Inflow'], data: '2026-08-27' } };
  const doisAnosDepois = varrer({ varredura: parada, hoje: '2028-08-29' });
  const etf = doisAnosDepois.confiancas.find((c) => c.indicador === 'ETF Net Inflow');
  perto(etf.confianca, confianca('2024-01-11', '2026-08-27'), 1e-9,
    'dois anos sem atualizar não viram histórico');
});

test('reprovação nomeia a alínea que falhou', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, teseSemEventoDatado: false });
  assert.equal(r.veredito, 'reprovado');
  assert.match(r.motivo, /\(c\) tese sem evento datado/);
});

// ══ FIXAÇÃO DA TRANSCRIÇÃO ════════════════════════════════════════════════
// O item 5 confere a CONTA contra um número já verificado fora da Torre. Ele não
// confere as ENTRADAS. Este teste fixa a transcrição do documento 07: se alguém
// editar um valor, uma mínima ou uma máxima, ele quebra pelo nome do número.
test('as catorze entradas batem, dígito a dígito, com o documento 07', () => {
  const doc07 = {
    'Preço do BTC':       [77839.19, 0.29, 124353.95],
    'Realized Price':     [53057.77, 0.088, 56449.62],
    'Realized Price STH': [69977.18, 0.19, 114018.67],
    'Realized Price LTH': [49449.51, 0.003, 49991.21],
    'MVRV Ratio':         [1.465, 0.384, 7.854],
    'SOPR':               [1.0112, 0.6068, 2.8740],
    'Supply in Profit':   [67.4, 35.6, 100.0],
    'Liveliness':         [0.6345, 0.1785, 0.6410],
    'DXY':                [99.16, 72.93, 114.11],
    'Fed Funds Rate':     [3.63, 0.05, 5.33],
    'US M2':              [23.218, 8.845, 23.218],
    'Curva 10Y-2Y':       [0.38, -0.93, 2.81],
    'ETF Net Inflow':     [242.3, -1138.9, 1373.8],
    'Funding Rate':       [1.84, -139.23, 186.86],
  };
  assert.equal(Object.keys(doc07).length, 14);
  for (const [nome, [valor, min, max]] of Object.entries(doc07)) {
    assert.equal(V[nome].valor, valor, `${nome}: valor`);
    assert.equal(V[nome].min, min, `${nome}: mínima`);
    assert.equal(V[nome].max, max, `${nome}: máxima`);
  }
});

test('a escala de cada série é a que o documento 03 manda — e trocar uma muda a faixa', () => {
  const log = ['Preço do BTC', 'Realized Price', 'Realized Price STH', 'Realized Price LTH', 'MVRV Ratio', 'SOPR'];
  for (const s of SERIES) {
    assert.equal(s.escala, log.includes(s.n) ? 'log' : 'lin', `${s.n}: escala`);
  }
  // A régua da camada 1 com a escala trocada: 44,4 vira 14,5, e o índice sai da faixa.
  const trocado = { ...V, 'MVRV Ratio': { ...V['MVRV Ratio'] } };
  const comLinear = normalizar(1.465, 0.384, 7.854, 'lin');
  assert.ok(Math.abs(comLinear - 14.48) < 0.01);
  const indiceErrado = 50.754 - (44.41 - comLinear) * (0.34 / 0.88);
  assert.ok(indiceErrado < 40, `índice iria a ${indiceErrado.toFixed(1)} — sairia de Equilíbrio para Comprimido`);
});

test('DXY e Fed Funds são os únicos invertidos', () => {
  assert.deepEqual(SERIES.filter((s) => s.invertido).map((s) => s.n), ['DXY', 'Fed Funds Rate']);
});

// ══ D38 · A LISTA DE EXCHANGES DE PRIMEIRA LINHA ══════════════════════════
test('a lista é nomeada, com os seis nomes da D38 A', () => {
  assert.deepEqual(EXCHANGES_PRIMEIRA_LINHA, ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'Bitget']);
});

test('exchange fora da lista não conta, por maior que seja o volume', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { Binance: 250e6, ExchangeQualquer: 900e6 } });
  assert.equal(r.veredito, 'reprovado', 'só uma de primeira linha qualifica');
  assert.match(r.motivo, /ExchangeQualquer 900mi \(fora da lista\)/);
  assert.deepEqual(r.exchangesIgnoradas, ['ExchangeQualquer']);
});

test('duas da lista aprovam; a de fora só aparece relatada', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { Binance: 250e6, Kraken: 150e6, Outra: 800e6 } });
  assert.equal(r.veredito, 'aprovado');
  assert.deepEqual(r.exchangesIgnoradas, ['Outra'], 'quem monta a varredura não escolhe: lê a lista');
});

test('o nome da exchange não é sensível a maiúscula', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { binance: 250e6, okx: 150e6 } });
  assert.equal(r.veredito, 'aprovado');
});

test('a lista e o limiar são âncora de par: afrouxar um faz o efeito do outro', () => {
  // com a lista de seis, uma exchange de fora com 900mi não salva o ativo.
  const comFora = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { Binance: 250e6, Outra: 900e6 } });
  assert.equal(comFora.veredito, 'reprovado');
  // se 'Outra' entrasse na lista, o mesmo ativo passaria — sem o número 100mi mudar.
  const seEntrasse = filtroDeHorizonte('XYZ', { ...APROVA, volumes30d: { Binance: 250e6, Bybit: 900e6 } });
  assert.equal(seEntrasse.veredito, 'aprovado');
});

// ══ D38 D · OS EXTREMOS DO NETFLOW SÃO PROVISÓRIOS ════════════════════════
test('o netflow está marcado como extremos provisórios, e a entrega diz isso', () => {
  assert.deepEqual(seriesComExtremosProvisorios(), ['Exchange Netflow']);
  const r = varrer({ varredura: COMPLETA, hoje: HOJE });
  assert.deepEqual(r.extremosProvisorios, ['Exchange Netflow']);
  const semNetflow = varrer({ varredura: V, hoje: HOJE });
  assert.deepEqual(semNetflow.extremosProvisorios, [], 'não sendo lido, não há provisório em uso');
});

test('a escala do netflow é linear, e não pode ser outra', () => {
  const nf = SERIES.find((s) => s.n === 'Exchange Netflow');
  assert.equal(nf.escala, 'lin');
  // netflow é entrada menos saída: cruza o zero, e log não existe aí.
  assert.equal(Number.isNaN(Math.log(-500)), true);
  assert.equal(Math.log(0), -Infinity);
  assert.equal(Number.isNaN(normalizar(-500, -1000, 1000, 'log')), true, 'log numa série assinada dá NaN');
  assert.equal(normalizar(-500, -1000, 1000, 'lin'), 25, 'linear funciona');
});

// ══ D35 · EXTREMOS PROVISÓRIOS E RITUAL DE CONFERÊNCIA ════════════════════
// A abertura eram 14 confirmados e 28 provisórios (D35 A). O teste não fixa esse
// instante — ele fixa o que não pode mudar e mede o progresso contra a abertura,
// senão cada conferência quebraria a suíte e a fila viraria inimiga do trabalho.
const ABERTURA = Object.freeze({ total: 42, confirmados: 14, provisorios: 28 });

test('a conta fecha sempre: confirmados mais provisórios dão o total', () => {
  const e = estadoDosExtremos(V);
  assert.equal(e.total, 42, '14 séries × valor, min e max');
  assert.equal(e.confirmados + e.provisorios, e.total);
  assert.equal(e.series.reduce((n, s) => n + s.campos.length, 0), e.provisorios,
    'a lista por série tem exatamente os provisórios');
});

test('a conferência só anda para a frente: nunca menos que a abertura', () => {
  const e = estadoDosExtremos(V);
  assert.ok(e.confirmados >= ABERTURA.confirmados,
    `${e.confirmados} confirmados, contra ${ABERTURA.confirmados} na abertura`);
  assert.ok(e.provisorios <= ABERTURA.provisorios);
});

test('o mínimo do MVRV foi conferido por tooltip em 29/08/2026', () => {
  const m = V['MVRV Ratio'];
  assert.equal(m.confirmado.min, '2026-08-29');
  const c = m.conferencias.find((x) => x.campo === 'min');
  assert.match(c.metodo, /passo do cursor virar 1 dia/);
  // O que faz dela conferência de EXTREMO, e não só de valor:
  assert.deepEqual(c.vizinhos, { '2011-10-18': 0.418, '2011-10-19': 0.384, '2011-10-20': 0.411 });
  assert.ok(c.vizinhos['2011-10-19'] < c.vizinhos['2011-10-18']);
  assert.ok(c.vizinhos['2011-10-19'] < c.vizinhos['2011-10-20']);
  assert.match(c.ehMinimoDaSerie, /nenhum ponto da série no ALL fica abaixo/);
  assert.match(c.telaRestaurada, /nada salvo, alterado, publicado ou apagado/);
});

test('o netflow nasce provisório inteiro — valor e extremos', () => {
  const comNf = { ...V, 'Exchange Netflow': NETFLOW };
  const e = estadoDosExtremos(comNf);
  assert.equal(e.total, 45);
  assert.equal(e.provisorios, estadoDosExtremos(V).provisorios + 3, 'os três do netflow entram provisórios');
});

// ══ D41 · A FILA É ORDENADA PELO EFEITO MEDIDO ════════════════════════════
test('D41 A: a fila desce por efeito medido, não por escala nem por peso de camada', () => {
  const fila = filaDeConferencia(V, HOJE);
  const uteis = fila.filter((f) => f.inerte !== 'por construção');
  for (let i = 1; i < uteis.length; i++) {
    assert.ok(uteis[i - 1].efeito >= uteis[i].efeito,
      `${uteis[i - 1].serie}·${uteis[i - 1].campo} deveria pesar ao menos tanto quanto ${uteis[i].serie}·${uteis[i].campo}`);
  }
  // E a ordem antiga não sobrevive. A demonstração corre sobre TODOS os extremos, que
  // não encolhem — a fila encolhe a cada conferência e levaria o teste junto.
  const efeitos = efeitoDosExtremos(V, HOJE);
  const pos = (n, c) => efeitos.findIndex((e) => e.serie === n && e.campo === c);
  const escalaDe = (n) => SERIES.find((s) => s.n === n).escala;
  assert.equal(escalaDe(efeitos[0].serie), 'lin', 'o de maior efeito é linear, não logarítmico');
  assert.ok(efeitos.findIndex((e) => escalaDe(e.serie) === 'log') > 0, 'log não vem primeiro por ser log');
  // e a heurística de camada também não: camada 3 (16%) antes de camada 2 (26%).
  assert.ok(pos('US M2', 'max') < pos('SOPR', 'max'),
    'US M2 é camada 3 e mede mais que o SOPR, camada 2');
});

test('D41 A: a cabeça da fila é sempre o maior efeito ainda por conferir', () => {
  const fila = filaDeConferencia(V, HOJE);
  const uteis = fila.filter((f) => f.inerte !== 'por construção');
  const maior = Math.max(...uteis.map((f) => f.efeito));
  assert.equal(uteis[0].efeito, maior);
  assert.equal(fila[0], uteis[0], 'e nenhum inerte estrutural passa na frente');
});

test('D41 A: na abertura da D41 a cabeça era o máximo do Liveliness, com 1,1820', () => {
  // Fica como registro do que a D41 mediu, e independe de quem já foi conferido:
  // efeitoDosExtremos mede todos, confirmados inclusive.
  const efeitos = efeitoDosExtremos(V, HOJE);
  assert.equal(efeitos[0].serie, 'Liveliness');
  assert.equal(efeitos[0].campo, 'max');
  assert.equal(efeitos[0].efeito.toFixed(4), '1.1820');
  assert.ok(efeitos[0].efeito > efeitos[1].efeito * 1.5, 'quase o dobro do segundo');
});

test('D41 B: os oito inertes por construção ficam no fim, e não saem da fila', () => {
  const fila = filaDeConferencia(V, HOJE);
  const inertes = fila.filter((f) => f.inerte === 'por construção');
  assert.equal(inertes.length, 8, 'as quatro séries de preço, min e max');
  assert.equal(fila.slice(-8).filter((f) => f.inerte === 'por construção').length, 8,
    'ocupam exatamente o rabo da fila');
  // Não saem: se a camada 1 mudar de régua um dia, eles voltam a contar.
  for (const s of EXTREMOS_INERTES) {
    for (const campo of ['min', 'max']) {
      assert.ok(fila.some((f) => f.serie === s && f.campo === campo), `${s} · ${campo} continua na fila`);
    }
  }
});

test('D41 C: efeito zero só na leitura de hoje NÃO rebaixa para o fim', () => {
  const fila = filaDeConferencia(V, HOJE);
  const m2 = fila.find((f) => f.serie === 'US M2' && f.campo === 'min');
  assert.equal(m2.efeito, 0, 'o valor corrente encosta na máxima, então o mínimo se cancela hoje');
  assert.equal(m2.inerte, 'só na leitura de hoje');
  const primeiroInerteEstrutural = fila.findIndex((f) => f.inerte === 'por construção');
  assert.ok(fila.indexOf(m2) < primeiroInerteEstrutural,
    'zero de hoje fica acima dos inertes por construção — só a inércia estrutural rebaixa');
});

test('D41 D: valor não entra na fila de extremos — não tem efeito de régua', () => {
  const fila = filaDeConferencia(V, HOJE);
  assert.ok(!fila.some((f) => f.campo === 'valor'), 'a fila é só de min e max');
  const conferido = { ...V, 'SOPR': { ...V['SOPR'], confirmado: { valor: null, min: null, max: null } } };
  assert.ok(valoresPendentes(conferido).some((x) => x.serie === 'SOPR'),
    'os valores por conferir se listam à parte');
  assert.equal(valoresPendentes(V).length, 0, 'os catorze valores da leitura de hoje já foram conferidos');
});

test('D41 E: a fila é recalculada a cada leitura, porque o efeito anda com o valor', () => {
  const dobrado = (x) => ({ ...V, 'Supply in Profit': { ...V['Supply in Profit'], valor: x } });
  const efeito = (varredura) => filaDeConferencia(varredura, HOJE)
    .find((f) => f.serie === 'Supply in Profit' && f.campo === 'max').efeito;
  assert.notEqual(efeito(V), efeito(dobrado(40)), 'mudou o valor corrente, mudou o efeito do extremo');
  // E a ordem da fila é consequência: mexer no valor pode trocar a cabeça.
  const fila = filaDeConferencia(dobrado(99.9), HOJE);
  assert.ok(fila.length > 0);
});

test('a leitura publicada informa quantos são provisórios, sem bloquear', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.equal(r.disponivel, true, 'não bloqueia');
  assert.equal(r.indice.toFixed(4), '50.7536', 'e o índice não muda');
  assert.equal(r.extremos.provisorios, estadoDosExtremos(V).provisorios);
  assert.ok(r.extremos.series.length > 0, 'e diz em quais séries');
});

test('o comando de conferência é de um extremo por vez e só de leitura', () => {
  const fila = filaDeConferencia(V, HOJE);
  const cmd = comandoDeConferencia(fila[0], V);
  assert.match(cmd, /somente leitura/);
  assert.match(cmd, /Nunca publica, nunca altera, nunca apaga/);
  assert.match(cmd, /sidebar nunca aparece/);
  assert.match(cmd, /estreitar a janela em torno da data até o passo do cursor virar um dia/);
  assert.match(cmd, new RegExp(fila[0].serie.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal((cmd.match(/Conferir no terminal/g) ?? []).length, 1, 'um extremo por vez');
});

test('confirmar um extremo tira ele da fila e some no contador', () => {
  const antes = estadoDosExtremos(V).provisorios;
  const alvo = filaDeConferencia(V, HOJE)[0];
  const conferido = { ...V, [alvo.serie]: { ...V[alvo.serie],
    confirmado: { ...V[alvo.serie].confirmado, [alvo.campo]: '2026-08-30' } } };
  assert.equal(estadoDosExtremos(conferido).provisorios, antes - 1);
  assert.ok(!filaDeConferencia(conferido, HOJE)
    .some((f) => f.serie === alvo.serie && f.campo === alvo.campo));
  // e o mínimo do MVRV, já conferido, não está mais na fila
  assert.ok(!filaDeConferencia(V, HOJE).some((f) => f.serie === 'MVRV Ratio' && f.campo === 'min'));
});

test('o comando aponta a data do EXTREMO, não a data da leitura', () => {
  const cmd = comandoDeConferencia({ serie: 'MVRV Ratio', campo: 'min' }, V);
  assert.match(cmd, /0\.384 na data 2011-10-19/, 'o mínimo do MVRV é de outubro de 2011');
  assert.ok(!cmd.includes('2026-08-28'), 'não pode mandar estreitar no dia da leitura');
  const doMax = comandoDeConferencia({ serie: 'MVRV Ratio', campo: 'max' }, V);
  assert.match(doMax, /7\.854 na data 2011-06-04/);
});

test('sem a data do extremo, o comando recusa em vez de chutar o dia', () => {
  const semData = { 'X': { valor: 1, min: 0, max: 2, data: '2026-08-29' } };
  const r = comandoDeConferencia({ serie: 'X', campo: 'min' }, semData);
  assert.match(r.erro, /sem a data do min/);
});

// ══ D40 · VOCABULÁRIO DAS CAMADAS ═════════════════════════════════════════
test('os nomes das camadas são os canônicos dos cinco documentos', () => {
  assert.deepEqual(CAMADAS, {
    1: 'Estado do preço', 2: 'Comportamento', 3: 'Macro', 4: 'Fluxo', 5: 'Carteira',
  });
});

test('a entrega nomeia cada camada, dentro e fora da conta', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.deepEqual(r.camadas.map((c) => c.nome),
    ['Estado do preço', 'Comportamento', 'Macro', 'Fluxo']);
  assert.equal(r.camadasForaDaConta.find((c) => c.camada === 5).nome, 'Carteira');
});

test('nome e peso andam juntos: quem renomear sem decisão quebra este teste', () => {
  // A D35 D chamou a camada 1 de "Ciclo" e a 2 de "Valuation". Os pesos batiam.
  // A regra da D40: o peso manda, o nome diferente é erro de redação.
  assert.equal(CAMADAS[1], 'Estado do preço'); assert.equal(PESOS[1], 0.34);
  assert.equal(CAMADAS[2], 'Comportamento');   assert.equal(PESOS[2], 0.26);
  assert.notEqual(CAMADAS[1], 'Ciclo');
  assert.notEqual(CAMADAS[2], 'Valuation');
});

test('o comando de extremo pede as três coisas, não só a tooltip', () => {
  const cmd = comandoDeConferencia({ serie: 'MVRV Ratio', campo: 'max' }, V);
  assert.match(cmd, /os dois dias vizinhos/);
  assert.match(cmd, /nenhum outro ponto da série fica acima dele/);
  assert.match(cmd, /o que se confirma é o número do dia — não que o dia seja o extremo/);
  const doMin = comandoDeConferencia({ serie: 'SOPR', campo: 'min' }, V);
  assert.match(doMin, /fica abaixo dele/, 'a direção acompanha o campo');
});

test('o comando de valor não pede vizinhos — valor do dia não é extremo', () => {
  const cmd = comandoDeConferencia({ serie: 'MVRV Ratio', campo: 'valor' }, V);
  assert.ok(!cmd.includes('dias vizinhos'));
});

test('a máxima do MVRV foi conferida, com o segundo pico descartado', () => {
  const c = V['MVRV Ratio'].conferencias.find((x) => x.campo === 'max');
  assert.equal(V['MVRV Ratio'].confirmado.max, '2026-08-29');
  assert.equal(c.vizinhos['2011-06-04'], 7.854);
  assert.ok(c.vizinhos['2011-06-04'] > c.vizinhos['2011-06-03']);
  assert.ok(c.vizinhos['2011-06-04'] > c.vizinhos['2011-06-05']);
  // o segundo pico chega perto e fica abaixo — foi conferido para não confundir
  assert.ok(c.segundoPico['2011-06-08'] < c.vizinhos['2011-06-04']);
  assert.match(c.margemAteOSegundoPico, /0,58%/);
  assert.match(c.metodo, /modo SMA/, 'o modo fica registrado: sem ele não é reprodutível');
});

test('a leitura de 05/06/2011 bate com a conferência avulsa do documento 07', () => {
  const c = V['MVRV Ratio'].conferencias.find((x) => x.campo === 'max');
  assert.equal(c.vizinhos['2011-06-05'], 6.718, 'o doc 07 registra 05/jun/2011 = 6,718');
  assert.match(c.bateComDoc07, /mesmo número/);
});

test('o MVRV é o único com valor, mínima e máxima conferidos', () => {
  const m = V['MVRV Ratio'].confirmado;
  assert.ok(m.valor && m.min && m.max, 'os três campos com data');
  assert.ok(!filaDeConferencia(V, HOJE).some((f) => f.serie === 'MVRV Ratio'), 'saiu inteiro da fila');
});

// ══ EXTREMOS INERTES POR CONSTRUÇÃO ═══════════════════════════════════════
test('os extremos das quatro séries de preço não entram em conta nenhuma', () => {
  assert.deepEqual(EXTREMOS_INERTES,
    ['Preço do BTC', 'Realized Price', 'Realized Price STH', 'Realized Price LTH']);
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  for (const serie of EXTREMOS_INERTES) {
    for (const campo of ['min', 'max']) {
      const dezVezes = { ...V, [serie]: { ...V[serie], [campo]: V[serie][campo] * 10 } };
      assert.equal(varrer({ varredura: dezVezes, hoje: HOJE }).indice, base,
        `${serie} · ${campo} dez vezes errado não pode mudar o índice`);
    }
  }
});

test('a camada 1 usa a faixa do MVRV, e é por isso que as de preço são inertes', () => {
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const mvrvMexido = { ...V, 'MVRV Ratio': { ...V['MVRV Ratio'], min: V['MVRV Ratio'].min * 1.1 } };
  assert.notEqual(varrer({ varredura: mvrvMexido, hoje: HOJE }).indice, base, 'a régua move o índice');
});

test('inerte por construção e inerte só hoje são coisas diferentes', () => {
  const efeitos = efeitoDosExtremos(V, HOJE);
  const preco = efeitos.find((e) => e.serie === 'Preço do BTC' && e.campo === 'min');
  assert.equal(preco.inerte, 'por construção');
  // O US M2 está encostado na própria máxima, então o mínimo se cancela — hoje.
  const m2 = efeitos.find((e) => e.serie === 'US M2' && e.campo === 'min');
  assert.equal(m2.efeito, 0);
  assert.equal(m2.inerte, 'só na leitura de hoje');
  assert.equal(V['US M2'].valor, V['US M2'].max, 'e a razão está no dado');
});

test('a contagem separa o que falta conferir do que falta e importa', () => {
  const e = estadoDosExtremos(V);
  assert.equal(e.inertesPendentes, 8, 'as quatro de preço, min e max');
  assert.equal(e.provisoriosQueImportam, e.provisorios - 8);
});

test('a tentativa falha no mínimo do preço fica registrada, para ninguém repetir', () => {
  const t = V['Preço do BTC'].tentativas.find((x) => x.campo === 'min');
  assert.equal(t.resultado, 'não confirmado');
  assert.equal(V['Preço do BTC'].confirmado.min, null, 'e o estado segue provisório');
  assert.match(t.porQueNaoFecha, /arredonda o preço para inteiro/);
  assert.match(t.caminhoQueFecharia, /fonte do dado/);
  // cinco dias de janeiro/2011 leem o mesmo "$0": empate sem desempate no gráfico
  assert.equal(new Set(Object.values(t.vizinhos)).size, 1);
});

// ══ A CONFERÊNCIA DO LIVELINESS · MAX ═════════════════════════════════════
test('o máximo do Liveliness foi conferido, e o empate de exibição ficou registrado', () => {
  const c = V['Liveliness'].conferencias.find((x) => x.campo === 'max');
  assert.equal(V['Liveliness'].confirmado.max, '2026-08-29');
  assert.deepEqual(c.vizinhos, { '2025-12-19': 0.6409, '2025-12-20': 0.6410, '2025-12-21': 0.6409 });
  // Os vizinhos diferem por 0,0001 — o menor passo que a tela representa.
  assert.equal(c.vizinhos['2025-12-20'] - c.vizinhos['2025-12-19'] < 0.00011, true);
  assert.equal(c.empateNaExibicao.candidato, '2025-12-12');
  assert.equal(c.empateNaExibicao.lido, 0.6410, 'a outra data exibe o MESMO número');
  assert.match(c.empateNaExibicao.naturezaDoMetodo, /separação por pixel, não leitura de dígito/);
});

test('o empate de exibição custa 0,001 ponto no índice, e isso está medido', () => {
  const c = V['Liveliness'].conferencias.find((x) => x.campo === 'max');
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const [piso, teto] = c.empateNaExibicao ? c.incertezaDaExibicao.faixa : [];
  for (const m of [piso, teto]) {
    const alt = { ...V, 'Liveliness': { ...V['Liveliness'], max: m } };
    const d = Math.abs(varrer({ varredura: alt, hoje: HOJE }).indice - base);
    assert.ok(d <= 0.0011, `a incerteza de exibição move o índice em ${d.toFixed(6)}, não mais`);
  }
  // Mesmo se 12/12 fosse o topo de fato, o índice mal se mexe.
  const seFosse1212 = { ...V, 'Liveliness': { ...V['Liveliness'], max: 0.64096 } };
  assert.ok(Math.abs(varrer({ varredura: seFosse1212, hoje: HOJE }).indice - base) < 0.001);
});

test('o Liveliness saiu da fila e a conta andou', () => {
  const fila = filaDeConferencia(V, HOJE);
  assert.ok(!fila.some((f) => f.serie === 'Liveliness' && f.campo === 'max'));
  assert.equal(fila[0].serie, 'Supply in Profit', 'a nova cabeça');
  assert.equal(fila[0].campo, 'max');
});

// ══ ESPÉCIES DE EXTREMO ═══════════════════════════════════════════════════
test('nem todo extremo é leitura empírica de um dia', () => {
  assert.equal(especieDoExtremo('Supply in Profit', 'max', V), 'teto da métrica');
  assert.equal(TETOS_DA_METRICA['Supply in Profit'].max, 100);
  assert.equal(especieDoExtremo('US M2', 'max', V), 'extremo móvel');
  assert.equal(V['US M2'].valor, V['US M2'].max, 'o valor corrente É a máxima');
  assert.equal(especieDoExtremo('DXY', 'max', V), 'empírico');
  assert.equal(especieDoExtremo('MVRV Ratio', 'min', V), 'empírico');
});

test('o comando não manda provar a data de um teto de métrica', () => {
  const cmd = comandoDeConferencia({ serie: 'Supply in Profit', campo: 'max' }, V);
  assert.match(cmd, /TETO DA MÉTRICA/);
  assert.match(cmd, /Não peça para provar que esta é a data/);
  assert.ok(!cmd.includes('os dois dias vizinhos'), 'pedir vizinhos aqui seria pedir o impossível');
});

test('o comando avisa que extremo móvel se reconfere a cada leitura', () => {
  const cmd = comandoDeConferencia({ serie: 'US M2', campo: 'max' }, V);
  assert.match(cmd, /MÓVEL/);
  assert.match(cmd, /Reconferir a cada leitura nova do indicador, não uma vez só/);
  assert.ok(!cmd.includes('os dois dias vizinhos'), 'um dos lados é o fim da série');
});

test('o comando empírico aprendeu a avisar do empate de exibição', () => {
  const cmd = comandoDeConferencia({ serie: 'DXY', campo: 'max' }, V);
  assert.match(cmd, /Três coisas, não uma/, 'segue empírico');
  assert.match(cmd, /exibir o MESMO número, a tooltip não decide/);
  assert.match(cmd, /separação foi por pixel, não por dígito/);
});

// ══ A CONFERÊNCIA DO DXY · MAX ════════════════════════════════════════════
test('o máximo do DXY foi conferido, e o quase-empate se resolveu no dígito', () => {
  const c = V['DXY'].conferencias.find((x) => x.campo === 'max');
  assert.equal(V['DXY'].confirmado.max, '2026-08-29');
  assert.deepEqual(c.vizinhos, { '2022-09-26': 114.10, '2022-09-27': 114.11, '2022-09-28': 112.60 });
  assert.equal(c.quaseEmpate.distancia, 0.01, 'um centésimo abaixo');
  assert.match(c.quaseEmpate.naturezaDoMetodo, /leitura de dígito/);
  // O caso oposto ao do Liveliness, e é por isso que o método fica nomeado nos dois.
  const liv = V['Liveliness'].conferencias.find((x) => x.campo === 'max');
  assert.match(liv.empateNaExibicao.naturezaDoMetodo, /separação por pixel/);
  assert.notEqual(c.quaseEmpate.naturezaDoMetodo, liv.empateNaExibicao.naturezaDoMetodo);
});

test('a resolução da tooltip é por série, não do terminal', () => {
  assert.equal(V['DXY'].conferencias.find((x) => x.campo === 'max').casasNaTooltip, 2);
  // O Liveliness mostrou quatro: dois vizinhos separados por 0,0001.
  const liv = V['Liveliness'].conferencias.find((x) => x.campo === 'max');
  assert.equal(liv.vizinhos['2025-12-20'] - liv.vizinhos['2025-12-19'] < 0.00011, true);
});

test('o arredondamento da tooltip nunca é o elo fraco: menos de 0,01 ponto', () => {
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  // Meia casa de exibição de cada extremo já conferido, na resolução da própria série.
  const meiaCasa = [
    ['MVRV Ratio', 'min', 0.0005], ['MVRV Ratio', 'max', 0.0005],
    ['Liveliness', 'max', 0.00005], ['DXY', 'max', 0.005],
  ];
  for (const [serie, campo, d] of meiaCasa) {
    const alt = { ...V, [serie]: { ...V[serie], [campo]: V[serie][campo] + d } };
    const efeito = Math.abs(varrer({ varredura: alt, hoje: HOJE }).indice - base);
    assert.ok(efeito < 0.01, `${serie} · ${campo}: ${efeito.toFixed(6)} ponto`);
  }
  // E o maior deles é o MVRV · min, não o de mais casas: régua log amplifica embaixo.
  const efeitoDe = (serie, campo, d) => {
    const alt = { ...V, [serie]: { ...V[serie], [campo]: V[serie][campo] + d } };
    return Math.abs(varrer({ varredura: alt, hoje: HOJE }).indice - base);
  };
  assert.ok(efeitoDe('MVRV Ratio', 'min', 0.0005) > efeitoDe('Liveliness', 'max', 0.00005));
});

test('a anomalia de menu do DXY está registrada, e não move o índice', () => {
  const a = V['DXY'].anomaliaDeMenu;
  assert.match(a.o_que, /"—" no menu/);
  // Série parada não mudaria a conta: a confiança do DXY já está no teto.
  assert.equal(confianca(SERIES.find((s) => s.n === 'DXY').inicioSerie, HOJE), 1);
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  for (const data of ['2026-06-30', '2025-12-31']) {
    const alt = { ...V, 'DXY': { ...V['DXY'], data } };
    assert.equal(varrer({ varredura: alt, hoje: HOJE }).indice, base, 'a data do DXY não move o índice');
  }
  // Mas o VALOR move, e muito: é a razão de a anomalia ficar registrada.
  const dezPorCento = { ...V, 'DXY': { ...V['DXY'], valor: V['DXY'].valor * 1.1 } };
  const alavanca = Math.abs(varrer({ varredura: dezPorCento, hoje: HOJE }).indice - base);
  assert.ok(alavanca > 1, `10% no valor do DXY move ${alavanca.toFixed(4)} ponto`);
  assert.equal(alavanca.toFixed(4), String(a.alavancaDoValor));
});

test('o DXY saiu inteiro da fila — valor, mínima e máxima', () => {
  const fila = filaDeConferencia(V, HOJE);
  assert.ok(!fila.some((f) => f.serie === 'DXY'), 'as duas pontas conferidas em 29/08');
  assert.equal(V['DXY'].conferencias.length, 2);
});

// ══ A CONFERÊNCIA DO SOPR · MIN ═══════════════════════════════════════════
test('o mínimo do SOPR é um pico isolado de um dia, e a forma ficou nomeada', () => {
  const c = V['SOPR'].conferencias.find((x) => x.campo === 'min');
  assert.equal(V['SOPR'].confirmado.min, '2026-08-29');
  assert.deepEqual(c.vizinhos, { '2011-11-08': 0.9609, '2011-11-09': 0.6068, '2011-11-10': 0.9743 });
  assert.equal(c.topologia, 'pico isolado de um dia');
  // Cai 37% num dia e volta no seguinte: nem vale nem platô.
  assert.equal((c.vizinhos['2011-11-08'] - c.vizinhos['2011-11-09']).toFixed(4), '0.3541');
  assert.ok(c.vizinhos['2011-11-10'] > c.vizinhos['2011-11-08'], 'volta acima de onde estava');
});

test('os três métodos de conferência estão nomeados e não se misturam', () => {
  assert.deepEqual(METODOS_DE_CONFERENCIA, ['dígito', 'pixel', 'eixo', 'calendário']);
  const sopr = V['SOPR'].conferencias.find((x) => x.campo === 'min');
  const liv = V['Liveliness'].conferencias.find((x) => x.campo === 'max');
  const dxy = V['DXY'].conferencias.find((x) => x.campo === 'max');
  assert.match(sopr.leiturasDeEixo.naturezaDoMetodo, /leitura de eixo, não de tooltip/);
  assert.match(liv.empateNaExibicao.naturezaDoMetodo, /separação por pixel/);
  assert.match(dxy.quaseEmpate.naturezaDoMetodo, /leitura de dígito/);
  // O que sustenta o extremo do SOPR é dígito; o eixo só deu o piso do outro regime.
  assert.match(sopr.lido, /0\.6068/);
});

test('o cruzamento de preço não cruza nada em 2011, e isso é consistente', () => {
  const c = V['SOPR'].conferencias.find((x) => x.campo === 'min');
  assert.match(c.cruzamento, /US\$ 3 nos três dias/);
  // Mesma redondagem para dólar inteiro que derrubou a conferência do preço.
  const t = V['Preço do BTC'].tentativas.find((x) => x.campo === 'min');
  assert.equal(t.resultado, 'não confirmado');
});

// ══ AS RÉGUAS VÊM DE UM REGIME QUE ACABOU ═════════════════════════════════
test('treze dos vinte e oito extremos são anteriores a 2013', () => {
  let velhos = 0, total = 0;
  for (const s of SERIES) {
    const v = V[s.n]; if (!v) continue;
    for (const campo of ['dataMin', 'dataMax']) {
      if (!v[campo]) continue;
      total++;
      if (v[campo] < '2013-01-01') velhos++;
    }
  }
  assert.equal(total, 28);
  assert.equal(velhos, 13);
  // E as duas réguas que mais pesam têm as DUAS pontas em 2011.
  assert.ok(V['MVRV Ratio'].dataMin < '2012-01-01' && V['MVRV Ratio'].dataMax < '2012-01-01',
    'a régua da camada 1 é inteira de 2011');
  assert.ok(V['SOPR'].dataMin < '2012-01-01' && V['SOPR'].dataMax < '2012-01-01');
});

test('trocar as pontas velhas move ~1 ponto cada, e elas não apontam para o mesmo lado', () => {
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const com = (v) => varrer({ varredura: v, hoje: HOJE }).indice;
  // Piso do SOPR no regime pós-2013 (~0,75, lido no eixo): empurra para BAIXO.
  const soprNovo = { ...V, 'SOPR': { ...V['SOPR'], min: 0.75 } };
  assert.equal((com(soprNovo) - base).toFixed(2), '-1.04');
  // Teto do MVRV no topo pós-2013 (6.237, que o Gui conferiu): empurra para CIMA.
  const mvrvNovo = { ...V, 'MVRV Ratio': { ...V['MVRV Ratio'], max: 6.237 } };
  assert.equal((com(mvrvNovo) - base).toFixed(2), '1.42');
  // Juntos quase se cancelam — reportar só um deles exageraria o caso.
  const ambos = { ...V, 'SOPR': { ...V['SOPR'], min: 0.75 }, 'MVRV Ratio': { ...V['MVRV Ratio'], max: 6.237 } };
  assert.equal((com(ambos) - base).toFixed(2), '0.38');
  // E o que a leitura ENTREGA não muda: a faixa é a mesma nos três casos.
  const faixa = varrer({ varredura: V, hoje: HOJE }).faixa;
  for (const v of [soprNovo, mvrvNovo, ambos]) {
    assert.equal(varrer({ varredura: v, hoje: HOJE }).faixa, faixa);
  }
});

// ══ A CONFERÊNCIA DO DXY · MIN — O EMPATE DE CALENDÁRIO ═══════════════════
test('o mínimo do DXY bate, e três dias exibem o mesmo número por fim de semana', () => {
  const c = V['DXY'].conferencias.find((x) => x.campo === 'min');
  assert.equal(V['DXY'].confirmado.min, '2026-08-29');
  assert.deepEqual(c.empateDeCalendario.diasIguais, ['2011-04-29', '2011-04-30', '2011-05-01']);
  assert.equal(c.empateDeCalendario.diaDeFormacao, '2011-04-29');
  // O calendário sustenta a afirmação, e ele é verificável sem terminal nenhum.
  assert.equal(semPregao('2011-04-29'), false, 'sexta-feira');
  assert.equal(semPregao('2011-04-30'), true, 'sábado');
  assert.equal(semPregao('2011-05-01'), true, 'domingo');
  assert.equal(semPregao('2011-05-02'), false, 'segunda, e o índice já anda: 72.95');
  assert.equal(c.empateDeCalendario.primeiroPregaoSeguinte['2011-05-02'], 72.95);
});

test('o pixel não resolveria este empate, e a razão é outra', () => {
  const dxy = V['DXY'].conferencias.find((x) => x.campo === 'min');
  const liv = V['Liveliness'].conferencias.find((x) => x.campo === 'max');
  // Liveliness: números DIFERENTES que a tela arredonda igual — o zoom separa.
  assert.match(liv.empateNaExibicao.resolvidoPor, /1 px vale ~0,000003/);
  // DXY: o MESMO número carregado adiante — não há o que separar.
  assert.match(dxy.empateDeCalendario.porQueOPixelNaoResolve, /não é arredondamento/);
  assert.equal(dxy.empateDeCalendario.naturezaDoMetodo, 'calendário — o único que não olha a tela');
});

test('o calendário é por série: sábado é dia de dado numa série 24/7', () => {
  assert.deepEqual(CALENDARIOS, ['24/7', 'pregão', 'mensal']);
  // A máxima do Liveliness é um sábado, e é legítima — a série é onchain.
  assert.equal(semPregao(V['Liveliness'].dataMax), true, '20/12/2025 é sábado');
  assert.equal(SERIES.find((s) => s.n === 'Liveliness').calendario, '24/7');
  assert.equal(dataSuspeitaDeCarregamento('Liveliness', V['Liveliness'].dataMax), false);
  // O mínimo do DXY também cai em dia útil; quem carrega são os dois dias seguintes.
  assert.equal(dataSuspeitaDeCarregamento('DXY', V['DXY'].dataMin), false);
});

test('o comando avisa do carregamento ANTES, em vez de a pessoa descobrir na tela', () => {
  // A Curva 10Y-2Y tem o mínimo datado em 01/07/2023, que é um SÁBADO.
  assert.equal(semPregao('2023-07-01'), true);
  assert.equal(dataSuspeitaDeCarregamento('Curva 10Y-2Y', '2023-07-01'), true);
  const cmd = comandoDeConferencia({ serie: 'Curva 10Y-2Y', campo: 'min' }, V);
  assert.match(cmd, /série de PREGÃO e 2023-07-01 caiu num fim de semana/);
  assert.match(cmd, /nenhum zoom os separa/);
  // E numa série 24/7 o aviso não aparece.
  assert.ok(!comandoDeConferencia({ serie: 'SOPR', campo: 'max' }, V).includes('série de PREGÃO'));
});

// ══ A DATA DE SÁBADO NAS SÉRIES DE PREGÃO ═════════════════════════════════
test('a leitura foi feita num sábado, e quatro séries de pregão levaram a data do dia', () => {
  assert.equal(semPregao(HOJE), true, '29/08/2026 é sábado');
  const comDataDeSabado = SERIES.filter((s) => V[s.n] && s.calendario !== '24/7' && semPregao(V[s.n].data));
  assert.deepEqual(comDataDeSabado.map((s) => s.n).sort(),
    ['Curva 10Y-2Y', 'DXY', 'Fed Funds Rate', 'US M2']);
  // É a mesma causa do "—" no menu do DXY, e agora ela está escrita no dado.
  assert.match(V['DXY'].anomaliaDeMenu.explicacao, /sábado e o DXY é série de pregão/);
});

test('corrigir essas datas não move o índice — todas têm confiança saturada', () => {
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const corrigida = { ...V };
  for (const n of ['DXY', 'Fed Funds Rate', 'Curva 10Y-2Y']) corrigida[n] = { ...V[n], data: '2026-08-28' };
  corrigida['US M2'] = { ...V['US M2'], data: '2026-07-01' };
  assert.equal(varrer({ varredura: corrigida, hoje: HOJE }).indice, base);
  for (const n of ['DXY', 'Fed Funds Rate', 'Curva 10Y-2Y', 'US M2']) {
    assert.equal(confianca(SERIES.find((s) => s.n === n).inicioSerie, V[n].data), 1);
  }
  // O ETF é a única com confiança abaixo de 1, e é a única onde a data teria dente.
  const etf = SERIES.find((s) => s.n === 'ETF Net Inflow');
  assert.ok(confianca(etf.inicioSerie, V['ETF Net Inflow'].data) < 1);
  assert.equal(semPregao(V['ETF Net Inflow'].data), false, 'e a data dela é um dia útil de verdade');
  const doisDias = { ...V, 'ETF Net Inflow': { ...V['ETF Net Inflow'], data: '2026-08-29' } };
  assert.ok(Math.abs(varrer({ varredura: doisDias, hoje: HOJE }).indice - base) > 0,
    'nela, dois dias de data errada moveriam o índice — pouco, mas moveriam');
});

// ══ A CONFERÊNCIA DO SUPPLY IN PROFIT · MIN — IDENTIDADE DA SÉRIE ═════════
test('o mínimo do Supply in Profit bate, sem empate e por folga larga', () => {
  const c = V['Supply in Profit'].conferencias.find((x) => x.campo === 'min');
  assert.equal(V['Supply in Profit'].confirmado.min, '2026-08-29');
  assert.deepEqual(c.vizinhos, { '2015-08-23': 38.8, '2015-08-24': 35.6, '2015-08-25': 40.0 });
  assert.ok(c.vizinhos['2015-08-23'] - c.vizinhos['2015-08-24'] > 3, 'mais de 3 p.p. de folga');
  assert.ok(c.vizinhos['2015-08-25'] - c.vizinhos['2015-08-24'] > 3);
  assert.equal(c.casasNaTooltip, 1, 'quarta resolução diferente: 4, 3, 2 e 1');
});

test('o terminal tem duas séries com este nome, e o dado prova qual é a nossa', () => {
  const c = V['Supply in Profit'].conferencias.find((x) => x.campo === 'min');
  assert.equal(c.serieEscolhida.escolhida, 'percentual');
  assert.equal(c.serieEscolhida.entre.length, 2);
  // As três provas são verificáveis no próprio dado, sem depender da escolha.
  const sp = V['Supply in Profit'];
  assert.equal(sp.max, 100, 'teto de percentual — impossível numa série em BTC');
  assert.ok(sp.valor > 0 && sp.valor < 100, `${sp.valor} é percentual, não 13,5M BTC`);
  assert.ok(sp.min > 0 && sp.min < 100);
  // E é o mesmo 100 que já estava em TETOS_DA_METRICA: as duas coisas se sustentam.
  assert.equal(TETOS_DA_METRICA['Supply in Profit'].max, sp.max);
});

test('os homônimos do terminal são os que uma conferência reportou, não adivinhados', () => {
  assert.deepEqual(Object.keys(HOMONIMOS_NO_TERMINAL).sort(),
    ['Realized Price', 'SOPR', 'Supply in Profit']);
  assert.match(HOMONIMOS_NO_TERMINAL['Supply in Profit'], /PERCENTUAL/);
  assert.match(HOMONIMOS_NO_TERMINAL['SOPR'], /SIMPLES/);
});

test('o comando checa a identidade da série antes de mandar ler', () => {
  const cmd = comandoDeConferencia({ serie: 'Supply in Profit', campo: 'min' }, V);
  assert.match(cmd, /Antes de ler, conferir que a série é a certa/);
  assert.match(cmd, /um em BTC .* e um em percentual/);
  assert.match(cmd, /a unidade tem de ser %, e o valor de hoje tem de bater com 67\.4/);
  assert.match(cmd, /parar e reportar, não ajustar a leitura/);
  // O passo de identidade vem ANTES dos passos de leitura: depois já é tarde.
  assert.ok(cmd.indexOf('a série é a certa') < cmd.indexOf('Passos: abrir a série'));
});

test('série sem unidade registrada recebe aviso, em vez de silêncio', () => {
  // O Funding Rate era o caso; a unidade dele foi lida em 29/08. Sobra o Exchange
  // Netflow, que ainda não entrou na varredura — e o mecanismo continua de pé.
  assert.equal(SERIES.find((s) => s.n === 'Exchange Netflow').unidade, null);
  const comNf = { ...V, 'Exchange Netflow': { ...NETFLOW, dataMin: '2020-03-12', dataMax: '2024-03-05' } };
  const cmd = comandoDeConferencia({ serie: 'Exchange Netflow', campo: 'max' }, comNf);
  assert.match(cmd, /A unidade de Exchange Netflow não está registrada/);
  assert.match(cmd, /Ler a unidade na tela e reportar junto/);
  // As catorze com unidade não recebem o aviso.
  assert.ok(!comandoDeConferencia({ serie: 'US M2', campo: 'max' }, V)
    .includes('não está registrada em lugar nenhum'));
});

test('a resolução da tooltip já apareceu em quatro tamanhos, e nenhum é o elo fraco', () => {
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const meiaCasa = [
    ['MVRV Ratio', 'min', 0.0005], ['Liveliness', 'max', 0.00005],
    ['DXY', 'max', 0.005], ['DXY', 'min', 0.005],
    ['SOPR', 'min', 0.00005], ['Supply in Profit', 'min', 0.05],
  ];
  for (const [serie, campo, d] of meiaCasa) {
    const alt = { ...V, [serie]: { ...V[serie], [campo]: V[serie][campo] + d } };
    const efeito = Math.abs(varrer({ varredura: alt, hoje: HOJE }).indice - base);
    assert.ok(efeito < 0.01, `${serie} · ${campo}: ${efeito.toFixed(6)} ponto`);
  }
  const casas = new Set(Object.values(V).flatMap((v) =>
    (v.conferencias ?? []).map((c) => c.casasNaTooltip).filter(Boolean)));
  assert.deepEqual([...casas].sort(), [1, 2, 3, 4], 'quatro resoluções diferentes, uma por série');
});

// ══ FED FUNDS · MAX — A TERCEIRA ESPÉCIE DE EMPATE ════════════════════════
test('o máximo do Fed Funds é um patamar de 396 dias, não um ponto', () => {
  const c = V['Fed Funds Rate'].conferencias.find((x) => x.campo === 'max');
  assert.equal(V['Fed Funds Rate'].confirmado.max, '2026-08-29');
  assert.equal(c.platoDeValor.diasNoPatamar, 396);
  assert.equal(c.platoDeValor.inicio, '2023-08-01');
  assert.equal(c.platoDeValor.fim, '2024-08-31');
  // O degrau de entrada separa; a saída do patamar também. O meio não separa nada.
  assert.equal(c.vizinhos['2023-07-31'], 5.12, 'o dia anterior é 21 pontos-base abaixo');
  assert.equal(c.vizinhos['2023-08-02'], c.vizinhos['2023-08-01'], 'o dia seguinte é idêntico');
  assert.equal(c.platoDeValor.primeiraLeituraDepois['2024-09-02'], 5.13);
  assert.match(c.platoDeValor.oQueADataSignifica, /primeira ocorrência do patamar/);
});

test('as três espécies de empate são distintas, e nenhuma se resolve como a outra', () => {
  const liv = V['Liveliness'].conferencias.find((x) => x.campo === 'max').empateNaExibicao;
  const dxy = V['DXY'].conferencias.find((x) => x.campo === 'min').empateDeCalendario;
  const ffr = V['Fed Funds Rate'].conferencias.find((x) => x.campo === 'max').platoDeValor;
  assert.match(liv.naturezaDoMetodo, /pixel/);      // números diferentes, tela igual
  assert.match(dxy.naturezaDoMetodo, /calendário/); // mesmo número, dia sem pregão
  assert.match(ffr.naturezaDoMetodo, /patamar/);    // mesmo número, o dado não muda
  assert.equal(new Set([liv.naturezaDoMetodo, dxy.naturezaDoMetodo, ffr.naturezaDoMetodo]).size, 3);
  assert.match(ffr.porQueNemDigitoNemPixelDecidem, /não há o que separar/);
});

test('o comando avisa do patamar antes, e só nas séries que andam em patamar', () => {
  assert.deepEqual(Object.keys(SERIES_EM_PATAMAR).sort(), ['Fed Funds Rate', 'US M2']);
  const cmd = comandoDeConferencia({ serie: 'US M2', campo: 'max' }, V);
  assert.match(cmd, /anda em PATAMAR/);
  assert.match(cmd, /a data é a PRIMEIRA ocorrência dele — o degrau/);
  assert.match(cmd, /o último dia em que ele ainda vale/);
  // Série 24/7 de razão não recebe o aviso.
  assert.ok(!comandoDeConferencia({ serie: 'SOPR', campo: 'max' }, V).includes('anda em PATAMAR'));
});

// ══ O PORTÃO DE IDENTIDADE PRODUZIU UM FATO NOVO ══════════════════════════
test('o portão de identidade entregou a data real do último ponto', () => {
  const d = V['Fed Funds Rate'].divergenciaDeData;
  assert.equal(d.registrado, '2026-08-29');
  assert.equal(d.naTela, '2026-08-24');
  assert.equal(d.diferencaEmDias, 5, 'cinco dias, não um — a leitura de sábado não explicava tudo');
  assert.equal(semPregao('2026-08-24'), false, 'e 24/08/2026 é segunda-feira');
  // O valor bateu, que é o que o portão checa: a série aberta era a certa.
  assert.equal(V['Fed Funds Rate'].valor, 3.63);
  // E o custo segue zero, pelo mesmo motivo das outras: confiança saturada.
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const corrigida = { ...V, 'Fed Funds Rate': { ...V['Fed Funds Rate'], data: '2026-08-24' } };
  assert.equal(varrer({ varredura: corrigida, hoje: HOJE }).indice, base);
  assert.equal(d.efeitoNoIndice, 0);
});

// ══ SOPR · MAX — O PORTÃO PASSOU POR UMA CASA DECIMAL ═════════════════════
test('o máximo do SOPR bate, e o SOPR sai inteiro da fila', () => {
  const c = V['SOPR'].conferencias.find((x) => x.campo === 'max');
  assert.equal(V['SOPR'].confirmado.max, '2026-08-29');
  assert.ok(!filaDeConferencia(V, HOJE).some((f) => f.serie === 'SOPR'));
  assert.deepEqual(c.vizinhos, { '2011-04-28': 1.4169, '2011-04-29': 2.8740, '2011-04-30': 1.8046 });
  assert.ok(c.vizinhos['2011-04-29'] > c.vizinhos['2011-04-28'] * 2, 'vale mais que o dobro do vizinho');
});

test('o valor corrente é senha fraca onde há homônimo: 0,0001 de margem', () => {
  const p = V['SOPR'].conferencias.find((x) => x.campo === 'max').portaoDeIdentidade;
  assert.equal(p.ultimoPonto.valor, V['SOPR'].valor, 'o portão bateu com o registrado');
  assert.equal(p.margemAteOMaisProximo, 0.0001);
  // Uma casa de exibição, na resolução do próprio indicador.
  assert.equal(V['SOPR'].conferencias.find((x) => x.campo === 'min').casasNaTooltip, 4);
  assert.equal((p.ultimoPonto.valor - p.homonimosNoMesmoDia.STH).toFixed(4), '0.0001');
  assert.match(p.licao, /quem separa de verdade é o breadcrumb/);
});

test('o comando passou a exigir o breadcrumb, e avisa quando não o tem', () => {
  assert.equal(SERIES.find((s) => s.n === 'SOPR').caminhoNoMenu, 'Spent Output Profit Ratio (SOPR) / SOPR');
  const comCaminho = comandoDeConferencia({ serie: 'SOPR', campo: 'max' }, V);
  assert.match(comCaminho, /o breadcrumb tem de ler exatamente: Spent Output Profit Ratio \(SOPR\) \/ SOPR/);
  // Homônimo SEM breadcrumb registrado recebe o aviso de que a senha é fraca.
  assert.equal(SERIES.find((s) => s.n === 'Realized Price').caminhoNoMenu, undefined);
  const semCaminho = comandoDeConferencia({ serie: 'Realized Price', campo: 'max' }, V);
  assert.match(semCaminho, /o breadcrumb desta série não está registrado/);
  assert.match(semCaminho, /pode\n {5}separar por uma casa decimal só/);
});

// ══ AS VARREDURAS DO ALL TÊM FORÇA DIFERENTE ══════════════════════════════
test('a varredura por banda falhou no SOPR, e o método mais forte é o eixo', () => {
  const c = V['SOPR'].conferencias.find((x) => x.campo === 'max');
  assert.equal(c.varreduraQueFalhou.metodo, 'banda de altura sobre a série inteira');
  assert.match(c.varreduraQueFalhou.porQue, /0,19 px/);
  assert.match(c.metodoDeVarredura, /eixo auto-escalado/);
  // A compressão é aritmética, não impressão: ~5.700 dias em ~1.100 px.
  const dias = (Date.parse('2026-08-29') - Date.parse('2011-01-01')) / 86400000;
  assert.ok(dias > 5700 && dias < 5730);
  assert.ok(1100 / dias < 0.2, 'um dia ocupa menos de 0,2 px no ALL');
});

test('os métodos de varredura estão ordenados por força, com a fraqueza de cada um', () => {
  assert.equal(METODOS_DE_VARREDURA.length, 3);
  assert.deepEqual(METODOS_DE_VARREDURA.map((m) => m.forca), [1, 2, 3]);
  assert.match(METODOS_DE_VARREDURA[0].m, /eixo auto-escalado/);
  assert.match(METODOS_DE_VARREDURA[0].porQue, /não depende de a barra ser visível/);
  assert.match(METODOS_DE_VARREDURA[1].fraqueza, /falso negativo/);
  // O Supply in Profit usou o método 2 — o positivo dele vale, o negativo herda a ressalva.
  const sp = V['Supply in Profit'].conferencias.find((x) => x.campo === 'min');
  assert.equal(sp.metodoDeVarredura, METODOS_DE_VARREDURA[1].como.slice(0, 0) || 'banda de altura sobre a série inteira, e não trecho a trecho');
});

// ══ FUNDING RATE · MAX — A PRECISÃO REGISTRADA EXCEDE A TELA ══════════════
test('a unidade do Funding Rate foi lida, e fecha a única lacuna de identidade', () => {
  const u = V['Funding Rate'].unidadeLida;
  assert.equal(u.unidade, 'APR (%)');
  assert.equal(u.categoria, 'FUTUROS');
  assert.equal(SERIES.find((s) => s.n === 'Funding Rate').unidade, 'APR (%)');
  // Nenhuma das quinze fica sem unidade agora, exceto a que ainda não foi lida.
  const semUnidade = SERIES.filter((s) => V[s.n] && !s.unidade).map((s) => s.n);
  assert.deepEqual(semUnidade, [], 'as catorze da varredura têm unidade');
  // APR cruza o zero, e é por isso que a escala é linear — mesma razão da D39.
  assert.equal(SERIES.find((s) => s.n === 'Funding Rate').escala, 'lin');
  assert.ok(V['Funding Rate'].min < 0 && V['Funding Rate'].max > 0);
  assert.equal(Number.isNaN(normalizar(V['Funding Rate'].min, -200, 200, 'log')), true);
});

test('o número registrado do Funding Rate não pode ter saído desta tooltip', () => {
  const c = V['Funding Rate'].conferencias.find((x) => x.campo === 'max');
  assert.equal(c.precisaoExcedente.registrado, 186.86);
  assert.equal(c.precisaoExcedente.naTela, 186.9);
  assert.equal(c.precisaoExcedente.compativel, true, '186,86 arredonda para 186,9');
  assert.equal(excedeATooltip('Funding Rate', 'max', V), true);
  assert.match(c.precisaoExcedente.naoCorrigido, /retificação, não implementação/);
});

test('a auditoria de precisão acusa exatamente duas séries, e são as duas problemáticas', () => {
  const fora = camposQueExcedemATooltip(V);
  assert.deepEqual([...new Set(fora.map((f) => f.serie))].sort(), ['Funding Rate', 'Preço do BTC']);
  assert.equal(fora.length, 6, 'as três casas das duas séries');
  // São exatamente as duas onde uma conferência tropeçou: a do preço falhou de vez.
  assert.equal(V['Preço do BTC'].tentativas.find((t) => t.campo === 'min').resultado, 'não confirmado');
  // Zero à direita NÃO conta: 2.8740 vira 2.874 em JS e isso não é perda de leitura.
  assert.equal(excedeATooltip('SOPR', 'max', V), false);
  assert.equal(excedeATooltip('Liveliness', 'max', V), false);
  assert.equal(excedeATooltip('Supply in Profit', 'max', V), false);
  // E as sete séries com tooltip lida e precisão coerente não aparecem.
  for (const n of ['MVRV Ratio', 'SOPR', 'Liveliness', 'DXY', 'Fed Funds Rate', 'Supply in Profit']) {
    assert.ok(!fora.some((f) => f.serie === n), n);
  }
});

test('o portão pede o valor COMO A TELA MOSTRA, não como o registro guarda', () => {
  const cmd = comandoDeConferencia({ serie: 'Funding Rate', campo: 'min' }, V);
  assert.match(cmd, /o valor de hoje tem de bater com 1\.8 \(a tooltip dá 1 casa\(s\); o registro guarda 1\.84\)/);
  // Pedir 1.84 numa tooltip de uma casa seria pedir o que não pode acontecer.
  assert.ok(!/bater com 1\.84\./.test(cmd));
  // E onde não há excesso, o portão segue simples.
  assert.match(comandoDeConferencia({ serie: 'DXY', campo: 'min' }, V),
    /o valor de hoje tem de bater com 99\.16\./);
});

test('a folga do Funding Rate é a mais apertada, e por isso a varredura foi outra', () => {
  const c = V['Funding Rate'].conferencias.find((x) => x.campo === 'max');
  const folga = (c.vizinhos['2020-02-12'] - c.concorrentes['2021-01-06']) / c.vizinhos['2020-02-12'];
  assert.ok(folga > 0.049 && folga < 0.05, `${(folga * 100).toFixed(2)}%`);
  assert.ok(c.metodoDeVarredura.startsWith('concorrentes um a um'),
    'com 5% de folga os concorrentes foram medidos na tooltip, não por banda nem por eixo');
  // E os três concorrentes ficam todos abaixo do máximo.
  for (const v of Object.values(c.concorrentes)) assert.ok(v < c.vizinhos['2020-02-12']);
});

test('trocar os três pelos números exibidos move o índice em 0,0016', () => {
  const base = varrer({ varredura: V, hoje: HOJE }).indice;
  const exibido = { ...V, 'Funding Rate': { ...V['Funding Rate'], valor: 1.8, min: -139.2, max: 186.9 } };
  const d = Math.abs(varrer({ varredura: exibido, hoje: HOJE }).indice - base);
  assert.equal(d.toFixed(4), '0.0016', 'a diferença de precisão custa quase nada — mas custa medido');
});
