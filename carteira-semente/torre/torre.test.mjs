import { test } from 'node:test';
import assert from 'node:assert/strict';
import { varrer, normalizar, confianca, amortecer, classificarLinhaDagua, faixaDoIndice, eventoDeLeitura, camada5, varreduraDaCRM, filtroDeHorizonte, filaDeJulgamento, LIMIAR_LIQUIDEZ, EXCHANGES_MINIMAS, JANELA_LIQUIDEZ_DIAS, EXCHANGES_PRIMEIRA_LINHA, seriesComExtremosProvisorios, estadoDosExtremos, filaDeConferencia, comandoDeConferencia, CAMADAS, PESOS, ESTADOS, SERIES } from './torre.mjs';
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

test('a fila segue a prioridade da D35 D: logarítmicas primeiro, e por peso de camada', () => {
  const fila = filaDeConferencia(V);
  const primeiras = fila.slice(0, 10).map((f) => f.serie);
  for (const n of primeiras) {
    assert.equal(SERIES.find((s) => s.n === n).escala, 'log', `${n} deveria ser logarítmica`);
  }
  // dentro das log, camada 1 (34%) antes de camada 2 (26%)
  const soprPos = fila.findIndex((f) => f.serie === 'SOPR');
  const mvrvPos = fila.findIndex((f) => f.serie === 'MVRV Ratio');
  assert.ok(mvrvPos < soprPos, 'MVRV, camada 1, vem antes do SOPR, camada 2');
  // e as lineares só depois de todas as log
  const primeiraLinear = fila.findIndex((f) => f.escala === 'lin');
  const ultimaLog = fila.map((f) => f.escala).lastIndexOf('log');
  assert.ok(ultimaLog < primeiraLinear);
});

test('a leitura publicada informa quantos são provisórios, sem bloquear', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.equal(r.disponivel, true, 'não bloqueia');
  assert.equal(r.indice.toFixed(4), '50.7536', 'e o índice não muda');
  assert.equal(r.extremos.provisorios, estadoDosExtremos(V).provisorios);
  assert.ok(r.extremos.series.length > 0, 'e diz em quais séries');
});

test('o comando de conferência é de um extremo por vez e só de leitura', () => {
  const fila = filaDeConferencia(V);
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
  const conferido = { ...V, 'SOPR': { ...V['SOPR'], confirmado: { valor: '2026-08-29', min: '2026-08-30', max: null } } };
  assert.equal(estadoDosExtremos(conferido).provisorios, antes - 1);
  assert.ok(!filaDeConferencia(conferido).some((f) => f.serie === 'SOPR' && f.campo === 'min'));
  // e o mínimo do MVRV, já conferido, não está mais na fila
  assert.ok(!filaDeConferencia(V).some((f) => f.serie === 'MVRV Ratio' && f.campo === 'min'));
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
  assert.ok(!filaDeConferencia(V).some((f) => f.serie === 'MVRV Ratio'), 'saiu inteiro da fila');
});
