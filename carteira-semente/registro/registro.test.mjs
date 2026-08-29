import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Registro, AdaptadorMemoria, RegistroInvalido, TIPOS } from './registro.mjs';

const novo = () => new Registro(new AdaptadorMemoria());
const C = 'carteira-1';
const leitura = (data, indice, estado = 'Mercado saudável') => ({ carteira: C, tipo: TIPOS.LEITURA, data, indice, estado });
const degrau = (data, ativo, valor, motivo = 'revisão de tese') => ({ carteira: C, tipo: TIPOS.DEGRAU, data, ativo, valor, motivo });
const dias = (base, n) => new Date(Date.parse(`${base}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

// ── APPEND-ONLY (D18 D) ────────────────────────────────────────────────────
test('não existe update nem delete na superfície do registro', () => {
  const r = novo();
  for (const proibido of ['atualizar', 'apagar', 'remover', 'sobrescrever']) {
    assert.equal(typeof r[proibido], 'undefined', `${proibido}() não pode existir`);
  }
});

test('evento gravado é congelado e a série anterior permanece', () => {
  const r = novo();
  const a = r.registrar(degrau('2026-08-29', 'BTC', 100));
  r.registrar(degrau('2026-09-30', 'BTC', 66, 'sinal contrário isolado'));
  assert.throws(() => { 'use strict'; a.valor = 0; });
  assert.equal(r.historicoDegraus(C, 'BTC').length, 2, 'o histórico guarda os dois');
});

// ── VALIDAÇÃO: recusa em vez de gravar malformado ──────────────────────────
test('degrau fora da escala ordinal é recusado', () => {
  const r = novo();
  assert.throws(() => r.registrar(degrau('2026-08-29', 'BTC', 50)), RegistroInvalido);
});

test('degrau sem motivo escrito é recusado (D18 C)', () => {
  const r = novo();
  assert.throws(() => r.registrar({ ...degrau('2026-08-29', 'BTC', 100), motivo: '  ' }), RegistroInvalido);
});

// ── 1 · CICLO DO REFORÇO (D9) ──────────────────────────────────────────────
test('contador zera no reset e conta só o que veio depois', () => {
  const r = novo();
  const acion = (data) => r.registrar({ carteira: C, tipo: TIPOS.REFORCO_ACIONADO, data, indice: 18, pctCaixa: 25 });
  acion('2026-01-10'); acion('2026-02-15');
  assert.equal(r.cicloReforco(C).contador, 2);
  r.registrar({ carteira: C, tipo: TIPOS.CONTADOR_RESET, data: '2026-03-01', marco: 'virada' });
  assert.equal(r.cicloReforco(C).contador, 0, 'zera no dia do marco');
  acion('2026-04-01');
  assert.equal(r.cicloReforco(C).contador, 1);
});

test('"consecutivos" é literal: um fechamento abaixo de 65 recomeça do zero', () => {
  const r = novo();
  for (let i = 0; i < 10; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  assert.equal(r.diasConsecutivosNoMarco(C, dias('2026-01-01', 9)).dias, 10);
  r.registrar(leitura(dias('2026-01-01', 10), 64.9));
  r.registrar(leitura(dias('2026-01-01', 11), 70));
  assert.equal(r.diasConsecutivosNoMarco(C, dias('2026-01-01', 11)).dias, 1, 'recomeça do zero');
});

test('dia sem leitura interrompe a contagem — não se presume que fechou acima', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  r.registrar(leitura('2026-01-02', 70));
  r.registrar(leitura('2026-01-05', 70)); // faltam 03 e 04
  assert.equal(r.diasConsecutivosNoMarco(C, '2026-01-05').dias, 1);
});

test('sem leitura de hoje, a contagem é ausente e não o valor de ontem', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  const c = r.diasConsecutivosNoMarco(C, '2026-01-03');
  assert.equal(c.disponivel, false);
  assert.match(c.motivo, /sem leitura de 2026-01-03/);
});

test('o marco completo é apontado como pendente, não gravado sozinho', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  const hoje = dias('2026-01-01', 29);
  assert.equal(r.diasConsecutivosNoMarco(C, hoje).completo, true);
  assert.deepEqual(r.marcoPendenteDeRegistro(C, hoje).marco, 'virada');
  assert.equal(r.cicloReforco(C).desde, null, 'o reset não aparece sem ser gravado');
});

// ── 2 · COMPOSIÇÃO DA CRM (D16 B) ──────────────────────────────────────────
test('composição ilegível congela a última conhecida e marca a data', () => {
  const r = novo();
  r.registrar({ carteira: C, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-01', legivel: true, ativos: ['BTC', 'ETH', 'SOL'] });
  r.registrar({ carteira: C, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-29', legivel: false });
  const c = r.composicaoCRM(C);
  assert.deepEqual(c.ativos, ['BTC', 'ETH', 'SOL']);
  assert.equal(c.congelada, true);
  assert.equal(c.desatualizadaDesde, '2026-08-01');
});

test('ilegível sem nenhuma leitura anterior é ausência, não lista vazia', () => {
  const r = novo();
  r.registrar({ carteira: C, tipo: TIPOS.CRM_COMPOSICAO, data: '2026-08-29', legivel: false });
  assert.equal(r.composicaoCRM(C).disponivel, false);
});

// ── 3 · DEGRAUS (D17, D18, D21) ────────────────────────────────────────────
test('degrau vence em 180 dias e vira ausência, não 0 nem valor herdado', () => {
  const r = novo();
  r.registrar(degrau('2026-01-01', 'SOL', 100));
  assert.equal(r.degraus(C, dias('2026-01-01', 180)).get('SOL').status, 'vigente');
  const vencido = r.degraus(C, dias('2026-01-01', 181)).get('SOL');
  assert.equal(vencido.status, 'vencido');
  assert.equal(vencido.valor, null, 'não vira 0 e não herda o valor');
});

test('BTC ou ETH vencido suspende a camada 5 inteira, nomeado e com data (D21 B)', () => {
  const r = novo();
  r.registrar(degrau('2026-01-01', 'BTC', 100));
  r.registrar(degrau('2026-01-01', 'ETH', 100));
  assert.equal(r.suspensaoDaCamada5(C, dias('2026-01-01', 100)).suspensa, false);
  const s = r.suspensaoDaCamada5(C, dias('2026-01-01', 181));
  assert.equal(s.suspensa, true);
  assert.equal(s.ativo, 'BTC');
  assert.equal(s.desde, '2026-01-01');
});

test('BTC sem degrau nenhum também suspende — ausência não é tese intacta', () => {
  const r = novo();
  r.registrar(degrau('2026-08-29', 'ETH', 100));
  const s = r.suspensaoDaCamada5(C, '2026-08-29');
  assert.equal(s.suspensa, true);
  assert.equal(s.razao, 'nunca atribuído');
});

test('aviso aos 150 dias: diário para as âncoras, semanal para os demais (D18 B)', () => {
  const r = novo();
  r.registrar(degrau('2026-01-01', 'BTC', 100));
  r.registrar(degrau('2026-01-01', 'SOL', 100));
  const em151 = r.degrausAVencer(C, dias('2026-01-01', 151)).map((a) => a.ativo);
  assert.deepEqual(em151, ['BTC'], 'no 151º dia só a âncora avisa');
  const em157 = r.degrausAVencer(C, dias('2026-01-01', 157)).map((a) => a.ativo).sort();
  assert.deepEqual(em157, ['BTC', 'SOL'], 'no 157º o semanal cai junto');
  assert.equal(r.degrausAVencer(C, dias('2026-01-01', 149)).length, 0, 'antes dos 150 não avisa');
});

test('a etiqueta traz as três informações da D17 D', () => {
  const r = novo();
  r.registrar(degrau('2026-01-01', 'BTC', 100));
  r.registrar(degrau('2026-06-01', 'ETH', 66, 'sinal contrário isolado'));
  const e = r.etiquetaDeJulgamento(C, dias('2026-01-01', 181));
  assert.equal(e.carregaJulgamentoHumano, true);
  assert.equal(e.degrauMaisAntigoEm, '2026-06-01', 'o vencido saiu de "em vigor"');
  assert.equal(e.ativosSemDegrau, 1);
});

test('a data do degrau mais antigo em vigor nunca passa de 180 dias', () => {
  const r = novo();
  r.registrar(degrau('2026-01-01', 'BTC', 100));
  r.registrar(degrau('2026-05-01', 'ETH', 100));
  const e = r.etiquetaDeJulgamento(C, dias('2026-01-01', 181));
  assert.ok(e.idadeDoMaisAntigo <= 180, `idade ${e.idadeDoMaisAntigo} passou do teto`);
});

// ── 4 · TRANCHES E DEFASAGEM (D24 B, D25 C) ────────────────────────────────
test('tranche exige exposição antes e depois', () => {
  const r = novo();
  assert.throws(() => r.registrar({ carteira: C, tipo: TIPOS.TRANCHE, data: '2026-08-29', ativo: 'SOL', quantidade: 10 }), RegistroInvalido);
});

test('a defasagem soma e guarda o fator de cada mês', () => {
  const r = novo();
  const def = (data, pontos, fator, estado) => r.registrar({ carteira: C, tipo: TIPOS.DEFASAGEM, data, pontosNaoMovidos: pontos, fator, estado });
  def('2026-01-31', 1.31, 0.25, 'Capitulação profunda');
  def('2026-02-28', 0.88, 0.50, 'Prejuízo do mercado');
  def('2026-03-31', -0.88, 1.50, 'Mercado saudável');
  const d = r.defasagemAcumulada(C);
  assert.equal(d.pontos, 1.31);
  assert.equal(d.eventos.length, 3, 'a série fica inteira, inclusive a recuperação');
});

// ── ISOLAMENTO POR CARTEIRA (D9 regra 4) ───────────────────────────────────
test('o contador é por carteira, nunca global', () => {
  const r = novo();
  r.registrar({ carteira: 'A', tipo: TIPOS.REFORCO_ACIONADO, data: '2026-01-10', indice: 18, pctCaixa: 25 });
  r.registrar({ carteira: 'B', tipo: TIPOS.REFORCO_ACIONADO, data: '2026-01-10', indice: 18, pctCaixa: 25 });
  assert.equal(r.cicloReforco('A').contador, 1);
  assert.equal(r.cicloReforco('B').contador, 1);
});
