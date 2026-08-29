import { test } from 'node:test';
import assert from 'node:assert/strict';
import { varrer, normalizar, confianca, amortecer, classificarLinhaDagua, faixaDoIndice, eventoDeLeitura, camada5, varreduraDaCRM, filtroDeHorizonte, ESTADOS, SERIES } from './torre.mjs';
import { VARREDURA_29_08_2026 as V } from './leitura-29-08-2026.mjs';
import { Registro, AdaptadorMemoria, TIPOS } from '../registro/registro.mjs';

const HOJE = '2026-08-29';
const perto = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

// ══ ITEM 5 · A LEITURA REAL DE 29/08/2026 ═════════════════════════════════
test('as catorze leituras reais devolvem 50,75 · Equilíbrio · Mercado saudável', () => {
  const r = varrer({ varredura: V, hoje: HOJE });
  assert.equal(r.disponivel, true);
  perto(r.indice, 50.75);
  assert.equal(Math.round(r.indice), 51, 'exibido 51');
  assert.equal(r.faixa, 'Equilíbrio');
  assert.equal(r.estado, ESTADOS.SAUDAVEL);
  assert.equal(r.ausencias.length, 0);
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
  assert.deepEqual(r.ausencias.map((a) => a.indicador).sort(), ['DXY', 'SOPR']);
  assert.equal(r.ausencias.find((a) => a.indicador === 'SOPR').camada, 2);
});

test('camada incompleta sai inteira, e os pesos renormalizam sobre o que voltou', () => {
  const sem = { ...V }; delete sem['SOPR'];
  const r = varrer({ varredura: sem, hoje: HOJE });
  assert.deepEqual(r.camadas.map((c) => c.camada), [1, 3, 4], 'a camada 2 saiu inteira');
  perto(r.camadas.reduce((s, c) => s + c.pesoAplicado, 0), 1);
  perto(r.camadas.find((c) => c.camada === 1).pesoAplicado, 0.34 / 0.62);
  assert.ok(r.camadasForaDaConta.some((c) => c.camada === 2 && c.motivo === 'camada incompleta'));
});

test('indicador zerado ou com traço é ausência, não zero', () => {
  const r = varrer({ varredura: { ...V, 'Liveliness': { valor: null, min: 0.1785, max: 0.6410 } }, hoje: HOJE });
  assert.equal(r.ausencias[0].indicador, 'Liveliness');
  assert.match(r.ausencias[0].motivo, /zerado ou com traço/);
});

test('sem nenhuma camada inteira, não há índice — e o motivo vem junto', () => {
  const r = varrer({ varredura: {}, hoje: HOJE });
  assert.equal(r.disponivel, false);
  assert.equal(r.ausencias.length, 14);
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
const APROVA = { liquidezSuficiente: true, teseSemEventoDatado: true, semAlavancagemOuContraparte: true, ciclosCompletos: 2 };

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
  assert.match(v.incluidos[0].motivo, /aguarda julgamento humano/);
  assert.equal(v.eventos.filter((e) => e.tipo === TIPOS.FILTRO_HORIZONTE).length, 0, 'não se aprova por omissão');
});

test('BTC e ETH passam a alínea (b) por definição', () => {
  const semCiclos = { liquidezSuficiente: true, teseSemEventoDatado: true, semAlavancagemOuContraparte: true };
  assert.equal(filtroDeHorizonte('BTC', semCiclos).veredito, 'aprovado');
  assert.equal(filtroDeHorizonte('XYZ', semCiclos).veredito, 'pendente');
});

test('reprovação nomeia a alínea que falhou', () => {
  const r = filtroDeHorizonte('XYZ', { ...APROVA, teseSemEventoDatado: false });
  assert.equal(r.veredito, 'reprovado');
  assert.match(r.motivo, /\(c\) tese sem evento datado/);
});
