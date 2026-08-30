import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASES_DO_ESTADO, EXPOSICAO_ALVO, BANDA_PONTOS, TETO_DEFASAGEM, MESES_SEM_MODULACAO,
  VELOCIDADE_POR_ESTADO, INICIO_DA_RAMPA_ANOS, ABRIGO_ATIVO_ANOS,
  modulador, mEfetivo, abrigoAtivo, fatorDoAbrigo, alvoDaGlidepath, fatorDeVelocidade,
  demandaDaGlidepath, passoDoMes, destinacaoDoAporte, limitesDoPatamar, reforcoDeFundo, degrauDoAtivo,
  ordemDeVenda, propor, GATILHOS_DE_VENDA, TETO_POR_ATIVO, GATILHO_DE_VENDA, PISO_DO_CAIXA,
  FATIA_DO_CAIXA, ACIONAMENTOS_POR_CICLO, ESPACAMENTO_DIAS, INDICE_MAXIMO_REFORCO,
} from './alocador.mjs';

const HOJE = '2026-08-29';
const INDICE = 50.7536;                       // a leitura real de 29/08/2026
const perto = (a, b, tol = 0.06) => assert.ok(Math.abs(a - b) <= tol, `${a} contra ${b}`);

// ══ O TESTE QUE COMPARA COM NÚMERO CONFERIDO FORA DAQUI ═══════════════════
// A matriz do aporte está publicada em 02-agentes.md. Ela foi derivada antes deste
// código existir: é a única checagem que não é o código conferindo a si mesmo.
test('as vinte células da matriz do aporte batem com o documento 02', () => {
  const meses = [48, 36, 24, 12, 0];
  const doc = {
    'Capitulação profunda':    [99.7, 65.8, 44.9, 24.9, 15.0],
    'Prejuízo do mercado':     [89.7, 59.2, 40.4, 22.4, 13.5],
    'Estresse de curto prazo': [64.8, 42.8, 29.2, 16.2, 9.7],
    'Mercado saudável':        [39.9, 26.3, 17.9, 10.0, 6.0],
  };
  for (const [estado, esperado] of Object.entries(doc)) {
    meses.forEach((m, i) => {
      const r = destinacaoDoAporte({ aporte: 150, carteira: 53074, caixa: 0, exposicaoAtual: alvoDaGlidepath(m),
        mesesAteEntrega: m, estado, indice: INDICE });
      perto(r.plantio.percentual, esperado[i]);
    });
  }
});

// ══ D4 · MODULAÇÃO ════════════════════════════════════════════════════════
test('M = 1 + (50 − Índice)/50 × 0,20, e o índice entra CHEIO', () => {
  assert.equal(modulador(50), 1, 'índice 50 devolve a base pura');
  assert.equal(Number(modulador(INDICE).toFixed(5)), 0.99699, 'o número que o doc 02 publica');
  // Modular com o exibido introduziria degrau artificial: com 51 daria 0,99600.
  assert.equal(Number(modulador(51).toFixed(5)), 0.996);
  assert.notEqual(modulador(INDICE), modulador(51));
  // Clamp da própria fórmula.
  assert.equal(modulador(0), 1.20);
  assert.equal(modulador(100), 0.80);
});

test('regra 3: com o Abrigo ativo a modulação reduz, nunca eleva', () => {
  assert.equal(mEfetivo(20, false), 1.12, 'sem Abrigo, índice baixo reforça o aporte');
  assert.equal(mEfetivo(20, true), 1, 'com Abrigo, M_efetivo = min(M, 1)');
  assert.equal(mEfetivo(80, true), 0.88, 'e continua podendo reduzir');
  // Deixar o Índice empurrar exposição acima do que o Abrigo travou desmontaria a proteção.
  const alto = destinacaoDoAporte({ aporte: 150, carteira: 1e5, caixa: 0, exposicaoAtual: 45,
    mesesAteEntrega: 24, estado: 'Capitulação profunda', indice: 10 });
  assert.ok(alto.plantio.percentual <= BASES_DO_ESTADO['Capitulação profunda'] * fatorDoAbrigo(24) + 1e-9);
});

test('regra 2: a modulação não alcança o patamar do estado vizinho', () => {
  // As quatro bandas efetivas do doc 02, uma a uma.
  assert.deepEqual(limitesDoPatamar('Capitulação profunda'), { base: 100, piso: 90, teto: 100 });
  assert.deepEqual(limitesDoPatamar('Prejuízo do mercado'), { base: 90, piso: 72, teto: 100 });
  assert.deepEqual(limitesDoPatamar('Estresse de curto prazo'), { base: 65, piso: 52, teto: 78 });
  assert.deepEqual(limitesDoPatamar('Mercado saudável'), { base: 40, piso: 32, teto: 48 });
  // Onde ela morde, segundo o próprio documento: Índice acima de 75 em Capitulação.
  const cap = destinacaoDoAporte({ aporte: 150, carteira: 1e5, caixa: 0, exposicaoAtual: 100,
    mesesAteEntrega: 120, estado: 'Capitulação profunda', indice: 80 });
  assert.equal(cap.plantio.percentual, 90, 'a fórmula daria 88; a regra 2 segura em 90');
  assert.equal(cap.plantio.mordeuARegra2, true);
  // E o caso de baixo: em Prejuízo com Índice 20 quem morde é o teto de 100%, não a
  // regra 2 — o documento diz que os dois "se encontram no mesmo lugar".
  const prej = destinacaoDoAporte({ aporte: 150, carteira: 1e5, caixa: 0, exposicaoAtual: 100,
    mesesAteEntrega: 120, estado: 'Prejuízo do mercado', indice: 20 });
  assert.equal(prej.plantio.percentual, 100, '90 × 1,12 = 100,8, e o teto absoluto é 100');
  assert.equal(prej.plantio.mordeuARegra2, false);
});

// ══ D25 · A GLIDEPATH ═════════════════════════════════════════════════════
test('D25 A: os quatro passos mensais batem com a tabela publicada', () => {
  const passo = (de, ate) => (alvoDaGlidepath(de) - alvoDaGlidepath(ate));
  perto(passo(48, 47), 2.83, 0.01);
  perto(passo(36, 35), 1.75, 0.01);
  perto(passo(24, 23), 1.67, 0.01);
  perto(passo(12, 11), 0.83, 0.01);
  // E os marcos da tabela do doc 01 §7.
  for (const [anos, alvo] of Object.entries(EXPOSICAO_ALVO)) {
    assert.equal(alvoDaGlidepath(Number(anos) * 12), alvo);
  }
});

test('a banda de 3 pontos existe para o sistema não vender por ruído', () => {
  assert.equal(BANDA_PONTOS, 3);
  const dentro = demandaDaGlidepath({ exposicaoAtual: 68, mesesAteEntrega: 36, estado: 'Mercado saudável' });
  assert.equal(dentro.dentroDaBanda, true);
  assert.equal(dentro.mover, 0, 'dentro da banda não se move nada');
  const fora = demandaDaGlidepath({ exposicaoAtual: 72, mesesAteEntrega: 36, estado: 'Mercado saudável' });
  assert.equal(fora.dentroDaBanda, false);
  assert.ok(fora.mover > 0);
});

test('D25 B: a velocidade vem do ESTADO, e nunca do Índice', () => {
  assert.deepEqual(VELOCIDADE_POR_ESTADO, {
    'Mercado saudável': 1.50, 'Estresse de curto prazo': 1.00,
    'Prejuízo do mercado': 0.50, 'Capitulação profunda': 0.25,
  });
  // Mesmo estado, índices opostos: a velocidade não muda.
  const a = demandaDaGlidepath({ exposicaoAtual: 80, mesesAteEntrega: 36, estado: 'Capitulação profunda' });
  const b = demandaDaGlidepath({ exposicaoAtual: 80, mesesAteEntrega: 36, estado: 'Capitulação profunda' });
  assert.equal(a.fator, 0.25);
  assert.equal(a.fator, b.fator);
});

test('D25 C: a defasagem acumula 1,5× mais rápido do que recupera', () => {
  // A tabela da D25 C sai do passo mensal do trecho 3→2 anos, que é 1,75 pt. É sobre
  // o PASSO que a modulação incide, não sobre a distância acumulada — foi esta tabela
  // que fixou isso, e ela é número derivado fora deste código.
  assert.equal(passoDoMes(30), 1.75);
  const fora = alvoDaGlidepath(30) + 5;   // fora da banda, senão nada se move
  const cap = demandaDaGlidepath({ exposicaoAtual: fora, mesesAteEntrega: 30, estado: 'Capitulação profunda' });
  perto(cap.defasagemDepois, 1.31, 0.01);
  perto(cap.mover, 0.44, 0.01);
  const prej = demandaDaGlidepath({ exposicaoAtual: fora, mesesAteEntrega: 30, estado: 'Prejuízo do mercado' });
  perto(prej.defasagemDepois, 0.88, 0.01);
  const neutro = demandaDaGlidepath({ exposicaoAtual: fora, mesesAteEntrega: 30, estado: 'Estresse de curto prazo' });
  assert.equal(neutro.naoMovido, 0, 'estresse é neutro: move o passo inteiro');
  // E o saudável recupera 0,88 do que estava acumulado.
  const bom = demandaDaGlidepath({ exposicaoAtual: fora, mesesAteEntrega: 30, estado: 'Mercado saudável', defasagem: 5 });
  perto(5 - bom.defasagemDepois, 0.88, 0.01);
  // A assimetria é 1,5×, e é intencional na direção certa.
  perto(cap.defasagemDepois / (5 - bom.defasagemDepois), 1.5, 0.02);
  // Nove meses de capitulação enchem o teto; treze e meio de saudável o esvaziam.
  perto(TETO_DEFASAGEM / cap.defasagemDepois, 9.1, 0.1);
  perto(TETO_DEFASAGEM / (5 - bom.defasagemDepois), 13.7, 0.1);
});

test('a banda é tolerância de POSIÇÃO: dentro dela a defasagem não cresce', () => {
  // A defasagem é o que a MODULAÇÃO deixou de mover, não o que a banda deixou.
  const dentro = demandaDaGlidepath({ exposicaoAtual: alvoDaGlidepath(30) + 2,
    mesesAteEntrega: 30, estado: 'Capitulação profunda' });
  assert.equal(dentro.dentroDaBanda, true);
  assert.equal(dentro.mover, 0);
  assert.equal(dentro.defasagemDepois, 0, 'estar na tolerância não é atraso');
});

test('D25 C: o teto de 12 pontos devolve o fator a 1,00 mesmo em Capitulação', () => {
  assert.equal(TETO_DEFASAGEM, 12);
  const noTeto = fatorDeVelocidade({ estado: 'Capitulação profunda', mesesAteEntrega: 30, defasagem: 12 });
  assert.equal(noTeto.fator, 1.00);
  assert.match(noTeto.motivo, /defasagem no teto/);
  const abaixo = fatorDeVelocidade({ estado: 'Capitulação profunda', mesesAteEntrega: 30, defasagem: 11 });
  assert.equal(abaixo.fator, 0.25);
  // E a defasagem nunca passa do teto.
  const r = demandaDaGlidepath({ exposicaoAtual: 90, mesesAteEntrega: 30, estado: 'Capitulação profunda', defasagem: 11.5 });
  assert.ok(r.defasagemDepois <= TETO_DEFASAGEM);
});

test('D25 D: os últimos doze meses não modulam, e a defasagem é LIQUIDADA', () => {
  assert.equal(MESES_SEM_MODULACAO, 12);
  for (const estado of Object.keys(VELOCIDADE_POR_ESTADO)) {
    assert.equal(fatorDeVelocidade({ estado, mesesAteEntrega: 12 }).fator, 1.00, estado);
    assert.equal(fatorDeVelocidade({ estado, mesesAteEntrega: 1 }).fator, 1.00, estado);
  }
  // Liquidada, não perdoada: perdoar deixaria a criança receber com até 12 pontos a
  // mais de exposição que o alvo, que é o risco que o Abrigo existe para evitar.
  const r = demandaDaGlidepath({ exposicaoAtual: 30, mesesAteEntrega: 6, estado: 'Capitulação profunda', defasagem: 6 });
  assert.equal(r.ultimoAno, true);
  assert.ok(r.liquidacaoDeDefasagem > 0, 'a defasagem entra no que se move');
  assert.ok(r.defasagemDepois < 6, 'e diminui');
  const zerada = demandaDaGlidepath({ exposicaoAtual: 20, mesesAteEntrega: 1, estado: 'Capitulação profunda', defasagem: 3 });
  assert.equal(zerada.defasagemDepois, 0, 'no último mês, zero');
});

// ══ D26 · PRECEDÊNCIA · D27 · ORDEM DE RECURSOS ═══════════════════════════
test('D26: a defesa vem primeiro, sempre e por regra', () => {
  // Demanda maior que o aporte: o Índice de Plantio não aloca nada.
  const r = destinacaoDoAporte({ aporte: 150, carteira: 53074, caixa: 0, exposicaoAtual: 80,
    mesesAteEntrega: 36, estado: 'Mercado saudável', indice: INDICE });
  assert.equal(r.defesa.doAporte, 150, 'o aporte inteiro foi para a proteção');
  assert.equal(r.plantio.sobreOAporte, 0);
  assert.equal(r.plantio.paraOAtivo, 0);
  assert.equal(r.plantio.nota, 'aporte integralmente destinado à proteção',
    'a leitura diz isso com estas palavras');
  assert.ok(r.defesa.porVenda > 0, 'e o que o fluxo não cobriu sai por venda');
});

test('D27: caixa → aporte → venda, e o caixa cobrindo zera a venda', () => {
  const r = destinacaoDoAporte({ aporte: 150, carteira: 53074, caixa: 50000, exposicaoAtual: 70,
    mesesAteEntrega: 36, estado: 'Estresse de curto prazo', indice: INDICE });
  assert.ok(r.defesa.doCaixa > 0);
  assert.equal(r.defesa.doAporte, 0, 'o aporte nem chega a ser tocado');
  assert.equal(r.defesa.porVenda, 0);
  assert.equal(r.defesa.vendaZeradaPeloCaixa, true);
  // E o aporte inteiro sobra para o Índice de Plantio.
  assert.equal(r.plantio.sobreOAporte, 150);
});

test('D27: com o Abrigo ativo o caixa não recebe mais', () => {
  const emAbrigo = destinacaoDoAporte({ aporte: 150, carteira: 1e5, caixa: 0, exposicaoAtual: 66,
    mesesAteEntrega: 36, estado: 'Mercado saudável', indice: INDICE });
  assert.equal(emAbrigo.emAbrigo, true);
  assert.equal(emAbrigo.excedente.destino, 'parte protegida');
  const fora = destinacaoDoAporte({ aporte: 150, carteira: 1e5, caixa: 0, exposicaoAtual: 100,
    mesesAteEntrega: 120, estado: 'Mercado saudável', indice: INDICE });
  assert.equal(fora.emAbrigo, false);
  assert.equal(fora.excedente.destino, 'caixa');
});

test('proteção vence convicção mesmo com a modulação no máximo', () => {
  // Índice 0 dá M = 1,20 — o aporte mais reforçado possível. A defesa continua antes.
  const r = destinacaoDoAporte({ aporte: 150, carteira: 53074, caixa: 0, exposicaoAtual: 90,
    mesesAteEntrega: 30, estado: 'Capitulação profunda', indice: 0 });
  assert.equal(r.plantio.paraOAtivo, 0, 'é a alocação que cede, nunca a proteção');
  assert.equal(r.defesa.doAporte, 150);
});

// ══ A DIVERGÊNCIA DE ESPECIFICAÇÃO, LEVANTADA E NÃO RESOLVIDA ═════════════
test('D43 A: a rampa e o Abrigo começam no mesmo dia — não há mais janela', () => {
  assert.equal(INICIO_DA_RAMPA_ANOS, 4);
  assert.equal(ABRIGO_ATIVO_ANOS, 4, 'alinhados pela D43');
  assert.equal(INICIO_DA_RAMPA_ANOS, ABRIGO_ATIVO_ANOS);
  // A 3,5 anos a rampa move E o Abrigo está ativo. Antes da D43 só a primeira valia.
  assert.equal(alvoDaGlidepath(42), 83);
  assert.equal(abrigoAtivo(42), true);
  assert.equal(abrigoAtivo(48), true, 'no marco de 4 anos já está ativo');
  assert.equal(abrigoAtivo(49), false);
});

test('D43 A: as três regras que estavam desalinhadas passam a valer juntas', () => {
  const m = 42;   // 3,5 anos — o meio da janela que a D43 fechou
  // 1. o teto M_efetivo = min(M,1) vale
  assert.equal(mEfetivo(10, abrigoAtivo(m)), 1, 'M seria 1,08 e fica em 1');
  // 2. a trava 3 do Reforço bloqueia
  const r = reforcoDeFundo({ estado: 'Capitulação profunda', indice: 20, mesesAteEntrega: m,
    caixa: 10000, carteira: 50000, ciclo: CICLO_LIMPO, hoje: HOJE });
  assert.ok(r.bloqueiam.includes(3));
  // 3. a ordem caixa → aporte → venda está aberta
  const d = destinacaoDoAporte({ aporte: 150, carteira: 53074, caixa: 50000, exposicaoAtual: 90,
    mesesAteEntrega: m, estado: 'Estresse de curto prazo', indice: INDICE });
  assert.ok(d.defesa.doCaixa > 0, 'o caixa atende a demanda em vez de vender');
  assert.equal(d.defesa.porVenda, 0);
});

test('D43 C: o preço está medido, e o maior trecho é o que passa a ser protegido', () => {
  // O trecho 4→3 é o maior da glidepath inteira: 34 pontos.
  const trecho = EXPOSICAO_ALVO[4] - EXPOSICAO_ALVO[3];
  assert.equal(trecho, 34);
  assert.ok(trecho > EXPOSICAO_ALVO[3] - EXPOSICAO_ALVO[2]);
  // E o teto do M passa a morder ali. Em Capitulação a 3,5 anos com Índice 10:
  const livre = BASES_DO_ESTADO['Capitulação profunda'] * fatorDoAbrigo(42) * modulador(10);
  const travado = BASES_DO_ESTADO['Capitulação profunda'] * fatorDoAbrigo(42) * mEfetivo(10, true);
  perto(livre - travado, 13.3, 0.1, );
  assert.ok(travado < livre, 'perda real de munição, e é o ponto da decisão');
});

test('D43: a matriz publicada não muda, porque hoje M já é menor que 1', () => {
  // M(50,7536) = 0,99699. O min(M,1) não morde na leitura de hoje, então as vinte
  // células ficam iguais — a decisão muda o comportamento, não o número publicado.
  assert.ok(modulador(INDICE) < 1);
  const r = destinacaoDoAporte({ aporte: 150, carteira: 53074, caixa: 0, exposicaoAtual: 100,
    mesesAteEntrega: 48, estado: 'Mercado saudável', indice: INDICE });
  perto(r.plantio.percentual, 39.9);
});

// ══ FLUXO 2 · AS SETE TRAVAS ══════════════════════════════════════════════
const CICLO_LIMPO = { acionamentos: 0, ultimoAcionamento: null };
const FUNDO = { estado: 'Capitulação profunda', indice: 20, mesesAteEntrega: 120,
  caixa: 10000, carteira: 50000, ciclo: CICLO_LIMPO, hoje: HOJE };

test('as sete travas aparecem sempre, passem ou não', () => {
  const r = reforcoDeFundo(FUNDO);
  assert.equal(r.travas.length, 7, 'uma lista que só mostra as que falharam não é conferível');
  assert.deepEqual(r.travas.map((t) => t.n), [1, 2, 3, 4, 5, 6, 7]);
  for (const t of r.travas) assert.ok(t.leitura !== undefined, `trava ${t.n} sem leitura`);
});

test('a trava 7 nunca passa por código nenhum — quem assina é o Gui', () => {
  const r = reforcoDeFundo(FUNDO);
  assert.equal(r.travas[6].passa, false);
  assert.match(r.travas[6].leitura, /só o Gui assina/);
  assert.notEqual(r.situacao, 'liberado');
  assert.match(r.situacao, /vai ao Gate como decisão própria/);
  assert.equal(r.separadoDoAporte, true, 'nunca misturado no aporte do mês');
});

test('sem registro gravado, o reforço não é liberado (D9 regra 5)', () => {
  const r = reforcoDeFundo({ ...FUNDO, ciclo: null });
  assert.match(r.situacao, /sem registro gravado/);
  assert.equal(r.valorProposto, null);
  assert.equal(r.travas.find((t) => t.n === 5).leitura, 'SEM REGISTRO');
});

test('cada trava bloqueia sozinha', () => {
  const casos = [
    [1, { estado: 'Mercado saudável' }],
    [2, { indice: INDICE_MAXIMO_REFORCO + 1 }],
    [3, { mesesAteEntrega: 36 }],
    [5, { ciclo: { acionamentos: ACIONAMENTOS_POR_CICLO, ultimoAcionamento: null } }],
    [6, { caixa: 5000, carteira: 50000 }],
  ];
  for (const [n, mudanca] of casos) {
    const r = reforcoDeFundo({ ...FUNDO, ...mudanca });
    assert.ok(r.bloqueiam.includes(n), `a trava ${n} devia bloquear`);
    assert.equal(r.valorProposto, null);
  }
  // Espaçamento de 30 dias, também na trava 5.
  const perto30 = reforcoDeFundo({ ...FUNDO, ciclo: { acionamentos: 1, ultimoAcionamento: '2026-08-15' } });
  assert.ok(perto30.bloqueiam.includes(5), `${ESPACAMENTO_DIAS} dias de espaçamento`);
  const longe = reforcoDeFundo({ ...FUNDO, ciclo: { acionamentos: 1, ultimoAcionamento: '2026-07-01' } });
  assert.ok(!longe.bloqueiam.includes(5));
});

test('o Abrigo bloqueia o reforço, e é intencional que o teto morda sem compensação', () => {
  const r = reforcoDeFundo({ ...FUNDO, mesesAteEntrega: 30 });
  assert.ok(r.bloqueiam.includes(3), 'a trava 3 existe justamente para a proteção vencer');
  // E bloqueia desde os 4 anos, depois da D43 — não desde os 3.
  assert.ok(reforcoDeFundo({ ...FUNDO, mesesAteEntrega: 47 }).bloqueiam.includes(3));
  assert.ok(!reforcoDeFundo({ ...FUNDO, mesesAteEntrega: 49 }).bloqueiam.includes(3));
  // O RÓTULO tem de acompanhar a regra: um texto dizendo "3" com o sistema bloqueando
  // a 4 engana quem lê a tela, e nenhum teste de lógica pega isso.
  assert.equal(r.travas.find((t) => t.n === 3).o, `mais de ${ABRIGO_ATIVO_ANOS} anos até a entrega`);
  assert.match(r.travas.find((t) => t.n === 3).o, /mais de 4 anos/);
});

test('o que as travas 4 e 5 produzem juntas — derivado, não digitado', () => {
  // Cada acionamento leva 25% do que SOBROU: 25,00% · 18,75% · 14,06%.
  let restante = 1, sequencia = [];
  for (let i = 0; i < ACIONAMENTOS_POR_CICLO; i++) { const leva = restante * FATIA_DO_CAIXA; sequencia.push(leva); restante -= leva; }
  assert.deepEqual(sequencia.map((x) => Number((x * 100).toFixed(2))), [25.00, 18.75, 14.06]);
  perto(1 - restante, 0.578, 0.001, );
  perto(restante, 0.422, 0.001);
  // E o ciclo mínimo de três acionamentos leva 60 dias.
  assert.equal((ACIONAMENTOS_POR_CICLO - 1) * ESPACAMENTO_DIAS, 60);
});

test('a trava 6 é âncora, e o piso pode interromper a sequência antes das três', () => {
  assert.equal(PISO_DO_CAIXA, 0.10);
  // Caixa em 13% da carteira: um acionamento de 25% o levaria a 9,75%.
  const r = reforcoDeFundo({ ...FUNDO, caixa: 6500, carteira: 50000 });
  assert.ok(r.bloqueiam.includes(6));
  const folgado = reforcoDeFundo({ ...FUNDO, caixa: 7000, carteira: 50000 });
  assert.ok(!folgado.bloqueiam.includes(6));
});

// ══ OS TRÊS DEGRAUS DO TETO ═══════════════════════════════════════════════
test('os três degraus, e BTC e ETH sem teto', () => {
  assert.equal(degrauDoAtivo('SOL', 7).degrau, 1);
  assert.equal(degrauDoAtivo('SOL', 9).degrau, 2);
  assert.match(degrauDoAtivo('SOL', 9).acao, /para de receber aporte novo/);
  const d3 = degrauDoAtivo('SOL', 14);
  assert.equal(d3.degrau, 3);
  assert.equal(d3.venderPontos, 6, `de volta para ${TETO_POR_ATIVO}%`);
  // O degrau 3 colide com a invariante 1, e foi implementado como gatilho automático
  // com execução pelo Gate: o sistema monta a ordem, o Gui assina.
  assert.equal(d3.viaGate, true);
  for (const a of ['BTC', 'ETH']) assert.equal(degrauDoAtivo(a, 40).degrau, 0);
});

test('os gatilhos de venda são três e só três', () => {
  assert.equal(GATILHOS_DE_VENDA.length, 3);
  assert.deepEqual(GATILHOS_DE_VENDA.map((g) => g.n), [1, 2, 3]);
  assert.equal(GATILHO_DE_VENDA, 12);
  assert.equal(TETO_POR_ATIVO, 8);
});

test('a venda sai na ordem inversa do peso de longo prazo', () => {
  const posicoes = [{ ativo: 'BTC', peso: 45 }, { ativo: 'SOL', peso: 7 },
    { ativo: 'ETH', peso: 20 }, { ativo: 'LINK', peso: 3 }];
  assert.deepEqual(ordemDeVenda(posicoes), ['LINK', 'SOL', 'ETH', 'BTC'],
    'fora de BTC e ETH primeiro, do menor peso ao maior; as âncoras por último');
});

// ══ A PROPOSTA ════════════════════════════════════════════════════════════
const CARTEIRA = { id: 'c1', aporte: 150, total: 53074, caixa: 5000,
  exposicao: 100, mesesAteEntrega: 120,
  posicoes: [{ ativo: 'BTC', peso: 45 }, { ativo: 'ETH', peso: 20 }, { ativo: 'SOL', peso: 14 }] };

test('a proposta propõe, e diz que propõe', () => {
  const p = propor({ leitura: { disponivel: true, estado: 'Mercado saudável', indice: INDICE },
    carteira: CARTEIRA, registro: null, hoje: HOJE });
  assert.match(p.limite, /PROPÕE — não executa/);
  assert.match(p.limite, /Quem assina é o Gui/);
  // Os dois fluxos vêm separados, e não misturados.
  assert.ok(p.aporteDoMes && p.reforcoDeFundo);
  assert.equal(p.reforcoDeFundo.separadoDoAporte, true);
  // Sem registro, o reforço não é liberado.
  assert.match(p.reforcoDeFundo.situacao, /sem registro gravado/);
  // E o excesso de concentração aparece.
  assert.deepEqual(p.concentracao.excessos.map((e) => e.ativo), ['SOL']);
  assert.equal(p.concentracao.excessos[0].degrau, 3);
});

test('sem leitura não há proposta — nunca se estima o estado', () => {
  const p = propor({ leitura: { disponivel: false, motivo: 'nenhuma camada voltou inteira' },
    carteira: CARTEIRA, registro: null, hoje: HOJE });
  assert.equal(p.proposta, null);
  assert.match(p.motivo, /sem estado não há proposta/);
});

test('a divergência saiu da proposta porque a D43 a resolveu', () => {
  const p = propor({ leitura: { disponivel: true, estado: 'Mercado saudável', indice: INDICE },
    carteira: CARTEIRA, registro: null, hoje: HOJE });
  assert.equal(p.divergenciasAbertas, undefined, 'decidida, não pendente');
  const d = destinacaoDoAporte({ aporte: 150, carteira: 1e5, caixa: 1000, exposicaoAtual: 90,
    mesesAteEntrega: 42, estado: 'Mercado saudável', indice: INDICE });
  assert.equal(d.divergencia, undefined);
});
