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

test('o marco completo é gravado pelo registro, com rastro (D32 B)', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  const hoje = dias('2026-01-01', 29);
  assert.equal(r.diasConsecutivosNoMarco(C, hoje).completo, true);
  const reset = r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).at(-1);
  assert.equal(reset.marco, 'virada');
  assert.equal(reset.desde, '2026-01-01', 'o intervalo que o produziu fica no rastro');
  assert.equal(reset.ate, hoje);
  assert.equal(r.cicloReforco(C).desde, hoje);
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

// ── D32 A · LEITURA RETROATIVA ─────────────────────────────────────────────
const retro = (data, indice, coletadaEm) => ({ ...leitura(data, indice), retroativa: true, coletadaEm });

test('gravada a leitura que faltava, a contagem se recompõe sozinha', () => {
  const r = novo();
  for (let i = 0; i < 3; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  r.registrar(leitura(dias('2026-01-01', 4), 70)); // buraco no dia 3
  assert.equal(r.diasConsecutivosNoMarco(C, dias('2026-01-01', 4)).dias, 1, 'o buraco quebra');
  r.registrar(retro(dias('2026-01-01', 3), 70, dias('2026-01-01', 10)));
  assert.equal(r.diasConsecutivosNoMarco(C, dias('2026-01-01', 4)).dias, 5, 'recomposta, emenda de verdade');
});

test('retroativa fora da janela de 30 dias é recusada', () => {
  const r = novo();
  assert.throws(() => r.registrar(retro('2026-01-01', 70, '2026-02-05')), RegistroInvalido);
  assert.doesNotThrow(() => r.registrar(retro('2026-01-01', 70, '2026-01-31')));
});

test('retroativa sem data de coleta é recusada', () => {
  const r = novo();
  assert.throws(() => r.registrar({ ...leitura('2026-01-01', 70), retroativa: true }), RegistroInvalido);
});

test('leitura de dia que já tem leitura é recusada — não há correção disfarçada', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  assert.throws(() => r.registrar(leitura('2026-01-01', 40)), RegistroInvalido);
  assert.throws(() => r.registrar(retro('2026-01-01', 40, '2026-01-10')), RegistroInvalido);
});

// ── D32 B · O REGISTRO GRAVA O RESET ───────────────────────────────────────
test('o reset é gravado sozinho no 30º fechamento consecutivo', () => {
  const r = novo();
  r.registrar({ carteira: C, tipo: TIPOS.REFORCO_ACIONADO, data: '2025-12-01', indice: 18, pctCaixa: 25 });
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  const resets = r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET });
  assert.equal(resets.length, 1);
  assert.equal(resets[0].data, dias('2026-01-01', 29), 'datado no 30º dia, não no dia da gravação');
  assert.equal(resets[0].desde, '2026-01-01');
  assert.equal(r.cicloReforco(C).contador, 0, 'e o contador zerou');
});

test('sequência que passa de 30 dias não produz um segundo reset', () => {
  const r = novo();
  for (let i = 0; i < 45; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 1);
});

test('leitura retroativa que completa um marco grava o reset com data no passado', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) if (i !== 10) r.registrar(leitura(dias('2026-01-01', i), 70));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 0, 'o buraco impediu');
  r.registrar(retro(dias('2026-01-01', 10), 70, dias('2026-01-01', 35)));
  const resets = r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET });
  assert.equal(resets.length, 1);
  assert.equal(resets[0].data, dias('2026-01-01', 29));
});

// ── D32 C · OS TRÊS REGISTROS NOVOS ────────────────────────────────────────
test('reprovado no filtro não volta sozinho; excluído por contagem volta', () => {
  const r = novo();
  r.registrar({ carteira: C, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'XYZ', aprovado: false, motivo: 'tese depende de upgrade datado' });
  r.registrar({ carteira: C, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'SOL', aprovado: true, motivo: 'passa nas quatro alíneas' });
  r.registrar({ carteira: C, tipo: TIPOS.TETO_CONTAGEM, data: '2026-08-02', ativo: 'SOL', posicao: 9 });

  const xyz = r.situacaoDoAtivo(C, 'XYZ');
  assert.equal(xyz.situacao, 'reprovado_no_filtro');
  assert.equal(xyz.voltaSozinho, false);

  const sol = r.situacaoDoAtivo(C, 'SOL');
  assert.equal(sol.situacao, 'teto_de_contagem');
  assert.equal(sol.voltaSozinho, true, 'volta sozinho se subir de posição (D22 C)');
});

test('os dois motivos são tipos distintos, não campo livre', () => {
  assert.notEqual(TIPOS.FILTRO_HORIZONTE, TIPOS.TETO_CONTAGEM);
  const r = novo();
  assert.throws(() => r.registrar({ carteira: C, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'A', aprovado: false }), RegistroInvalido);
  assert.throws(() => r.registrar({ carteira: C, tipo: TIPOS.TETO_CONTAGEM, data: '2026-08-01', ativo: 'A' }), RegistroInvalido);
});

test('invalidação do Gate exige motivo e prevalece sobre o registro anterior', () => {
  const r = novo();
  r.registrar({ carteira: C, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'SOL', aprovado: true, motivo: 'passa nas quatro' });
  assert.throws(() => r.registrar({ carteira: C, tipo: TIPOS.GATE_INVALIDAR, data: '2026-09-01', ativo: 'SOL' }), RegistroInvalido);
  r.registrar({ carteira: C, tipo: TIPOS.GATE_INVALIDAR, data: '2026-09-01', ativo: 'SOL', motivo: 'tese invalidada na revisão de vaga bloqueada' });
  const s = r.situacaoDoAtivo(C, 'SOL');
  assert.equal(s.situacao, 'invalidado_pelo_gate');
  assert.equal(s.voltaSozinho, false);
});

test('o universo lista cada ativo com a situação corrente', () => {
  const r = novo();
  r.registrar({ carteira: C, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'SOL', aprovado: true, motivo: 'ok' });
  r.registrar({ carteira: C, tipo: TIPOS.FILTRO_HORIZONTE, data: '2026-08-01', ativo: 'XYZ', aprovado: false, motivo: 'evento datado' });
  const u = r.universo(C);
  assert.deepEqual([...u.keys()], ['SOL', 'XYZ']);
  assert.equal(u.get('SOL').situacao, 'elegivel');
});

// ── D33 · RETIFICAÇÃO ──────────────────────────────────────────────────────
const retif = (data, dataRetificada, valorAntigo, valorNovo, campo = 'indice') => ({
  carteira: C, tipo: TIPOS.RETIFICACAO, data, dataRetificada, campo, valorAntigo, valorNovo,
  motivo: 'tooltip relida, dígito trocado na coleta', aprovadoEm: data,
});

test('retificação exige os quatro obrigatórios da D33 B', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  const base = retif('2026-01-10', '2026-01-01', 70, 64);
  for (const faltando of ['motivo', 'aprovadoEm', 'valorAntigo', 'dataRetificada', 'campo']) {
    const ev = { ...base }; delete ev[faltando];
    assert.throws(() => r.registrar(ev), RegistroInvalido, `sem ${faltando} deveria recusar`);
  }
});

test('retificação sem o Gate é recusada — é o que a separa de reescrita', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  assert.throws(() => r.registrar({ ...retif('2026-01-10', '2026-01-01', 70, 64), aprovadoEm: undefined }), RegistroInvalido);
});

test('as duas versões permanecem no log para sempre', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  r.registrar(retif('2026-01-10', '2026-01-01', 70, 64));
  const h = r.historicoDaLeitura(C, '2026-01-01');
  assert.equal(h.original.indice, 70, 'a original continua lá');
  assert.equal(h.retificacoes.length, 1);
  assert.equal(h.vigente.indice, 64, 'e a vigente é a retificada');
});

test('retificar data sem leitura é recusado', () => {
  const r = novo();
  assert.throws(() => r.registrar(retif('2026-01-10', '2026-01-01', 70, 64)), RegistroInvalido);
});

test('retificação escrita sobre versão que já não vale é recusada', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  r.registrar(retif('2026-01-10', '2026-01-01', 70, 64));
  assert.throws(() => r.registrar(retif('2026-01-11', '2026-01-01', 70, 50)), RegistroInvalido);
  assert.doesNotThrow(() => r.registrar(retif('2026-01-11', '2026-01-01', 64, 50)), 'partindo da vigente, passa');
});

test('as derivações leem a versão vigente e se recompõem sozinhas (D33 C)', () => {
  const r = novo();
  for (let i = 0; i < 5; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  assert.equal(r.diasConsecutivosNoMarco(C, dias('2026-01-01', 4)).dias, 5);
  r.registrar(retif('2026-02-01', dias('2026-01-01', 2), 70, 60));
  assert.equal(r.diasConsecutivosNoMarco(C, dias('2026-01-01', 4)).dias, 2, 'a sequência quebrou no dia retificado');
});

test('retificação que desfaz um marco gera anulação, e o marco não some (D33 D)', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  const marco = r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).at(-1);
  assert.equal(r.cicloReforco(C).desde, dias('2026-01-01', 29));

  r.registrar(retif('2026-02-15', dias('2026-01-01', 15), 70, 60));

  const anulacoes = r.eventos({ carteira: C, tipo: TIPOS.ANULACAO_MARCO });
  assert.equal(anulacoes.length, 1);
  assert.equal(anulacoes[0].marcoSeq, marco.seq, 'aponta para o marco');
  assert.equal(typeof anulacoes[0].retificacaoSeq, 'number', 'e para a retificação que o desfez');
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 1, 'o marco continua no log');
  assert.equal(r.cicloReforco(C).desde, null, 'mas saiu da contagem');
});

test('retificação que completa um marco novo grava o marco', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), i === 15 ? 60 : 70));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 0);
  r.registrar(retif('2026-02-15', dias('2026-01-01', 15), 60, 70));
  const resets = r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET });
  assert.equal(resets.length, 1, 'o marco nasceu da retificação');
  assert.equal(resets[0].data, dias('2026-01-01', 29));
});

test('marco anulado não é regravado enquanto a sequência não voltar a valer', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  r.registrar(retif('2026-02-15', dias('2026-01-01', 15), 70, 60));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 1);
  r.registrar(retif('2026-02-16', dias('2026-01-01', 15), 60, 70));
  const resets = r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET });
  assert.equal(resets.length, 2, 'volta a valer, nasce marco novo — e o anulado segue no log');
  assert.equal(r.cicloReforco(C).desde, dias('2026-01-01', 29));
});

// ── D33 E · MARCO ÚNICO ────────────────────────────────────────────────────
test('sequência de 200 dias produz o mesmo marco único', () => {
  const r = novo();
  for (let i = 0; i < 200; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 1);
});

test('rompida e reformada, a sequência produz um segundo marco', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  r.registrar(leitura(dias('2026-01-01', 30), 60));
  for (let i = 31; i < 61; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.CONTADOR_RESET }).length, 2);
});

// ── D34 · RETIFICAÇÃO COBRE A LEITURA INTEIRA ──────────────────────────────
const comIndicadores = (data, indice, indicadores) => ({ ...leitura(data, indice), indicadores });

test('o estado da Linha dágua é retificável pelo mesmo evento (D34 B)', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70, 'Mercado saudável'));
  r.registrar(retif('2026-01-10', '2026-01-01', 'Mercado saudável', 'Estresse de curto prazo', 'estado'));
  const v = r.historicoDaLeitura(C, '2026-01-01').vigente;
  assert.equal(v.estado, 'Estresse de curto prazo');
  assert.equal(v.indice, 70, 'o índice não foi tocado');
});

test('indicador individual da varredura é retificável', () => {
  const r = novo();
  r.registrar(comIndicadores('2026-01-01', 70, { MVRV: 1.465, SOPR: 1.0112 }));
  r.registrar(retif('2026-01-10', '2026-01-01', 1.465, 1.456, 'indicadores.MVRV'));
  const v = r.historicoDaLeitura(C, '2026-01-01').vigente;
  assert.equal(v.indicadores.MVRV, 1.456);
  assert.equal(v.indicadores.SOPR, 1.0112, 'os outros indicadores ficam intactos');
});

test('a cadeia da D34 A vale campo a campo, e um campo não trava o outro', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70, 'Mercado saudável'));
  r.registrar(retif('2026-01-10', '2026-01-01', 70, 64, 'indice'));
  // partir do valor original do índice já não vale...
  assert.throws(() => r.registrar(retif('2026-01-11', '2026-01-01', 70, 50, 'indice')), RegistroInvalido);
  // ...mas o estado segue no valor original, e retifica normalmente
  assert.doesNotThrow(() => r.registrar(retif('2026-01-11', '2026-01-01', 'Mercado saudável', 'Prejuízo do mercado', 'estado')));
});

test('campo que não existe na leitura é recusado', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  assert.throws(() => r.registrar(retif('2026-01-10', '2026-01-01', 1, 2, 'indicadores.MVRV')), RegistroInvalido);
});

test('valor antigo e novo de tipos diferentes é recusado', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70));
  assert.throws(() => r.registrar(retif('2026-01-10', '2026-01-01', 70, 'sessenta e quatro', 'indice')), RegistroInvalido);
});

test('o histórico separa as retificações por campo', () => {
  const r = novo();
  r.registrar(leitura('2026-01-01', 70, 'Mercado saudável'));
  r.registrar(retif('2026-01-10', '2026-01-01', 70, 64, 'indice'));
  r.registrar(retif('2026-01-11', '2026-01-01', 'Mercado saudável', 'Prejuízo do mercado', 'estado'));
  const h = r.historicoDaLeitura(C, '2026-01-01');
  assert.equal(h.retificacoes.length, 2);
  assert.equal(h.porCampo.get('indice').length, 1);
  assert.equal(h.porCampo.get('estado').length, 1);
  assert.deepEqual(h.vigente.camposRetificados.sort(), ['estado', 'indice']);
  assert.equal(h.original.indice, 70, 'a original continua inteira');
  assert.equal(h.original.estado, 'Mercado saudável');
});

test('retificar o estado não anula marco — o marco não depende do estado', () => {
  const r = novo();
  for (let i = 0; i < 30; i++) r.registrar(leitura(dias('2026-01-01', i), 70));
  r.registrar(retif('2026-02-15', '2026-01-05', 'Mercado saudável', 'Estresse de curto prazo', 'estado'));
  assert.equal(r.eventos({ carteira: C, tipo: TIPOS.ANULACAO_MARCO }).length, 0);
  assert.equal(r.cicloReforco(C).desde, dias('2026-01-01', 29), 'o marco segue de pé');
});
