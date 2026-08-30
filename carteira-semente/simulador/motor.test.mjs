// D45 · D48: cada asserção daqui nasce do que a decisão MANDA acontecer, e foi vista
// reprovando antes de entrar. A quebra de cada uma está registrada em `provas.mjs`.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ESTADOS } from '../torre/torre.mjs';
import { MARCO_INDICE } from '../registro/registro.mjs';
import {
  ABRIGO_ATIVO_ANOS, INICIO_DA_RAMPA_ANOS, EXPOSICAO_ALVO, TETO_DEFASAGEM,
  MESES_SEM_MODULACAO, VELOCIDADE_POR_ESTADO, BANDA_PONTOS, bandaDoMes,
} from '../alocador/alocador.mjs';
import {
  CENARIOS, FASES, PARTIDAS, TABELA_EXPO, LIMIAR_DA_FASE_3, MESES_NA_FASE, ENTREGA_AOS,
  ESTACAO_DO_ESTADO, ABRIGO, TETO_DERIVA, CELULAS_DA_GRADE, CENARIO_DA_CAPA,
  partidaDaLeitura, rotuloDaPartida, mesesRestantesDaFase, estadoDaFase, estacoesPorAno,
  motorMensal, motorAnual, criterioDeAceiteD11, grade, numeroDeCapa,
  trajetoriaDaGlidepath, expoDoAno,
} from './motor.mjs';

// A base sobre a qual as tabelas do documento-mãe foram publicadas.
const BASE = { anos: ENTREGA_AOS, aporte: 150 };

// ── O MOTOR ───────────────────────────────────────────────────────────────
test('D11 regra 4: com mês de entrada 0 o motor mensal É o anual, nas doze combinações', () => {
  const r = criterioDeAceiteD11(BASE);
  // Doze é o que a decisão manda rodar: quatro fases × três cenários.
  assert.equal(r.combinacoes.length, FASES.length * Object.keys(CENARIOS).length);
  // A decisão diz "diferença zero", e zero é zero — não "pequeno".
  assert.equal(r.maiorDiferenca, 0, 'o laço mensal divergiu do anual com mês de entrada 0');
  for (const c of r.combinacoes) assert.equal(c.mensal, c.anual, `fase ${c.fase} · ${c.cenario}`);
  assert.equal(r.passa, true);
});

test('D11 regra 1: o mês de entrada muda a projeção, e o horizonte não', () => {
  const padrao = CENARIOS[CENARIO_DA_CAPA];
  const zero = motorMensal({ ...BASE, fase: 0, mes: 0, padrao });
  const nove = motorMensal({ ...BASE, fase: 0, mes: 9, padrao });
  // O horizonte é o mesmo: o aportado não pode se mexer por causa do mês de entrada.
  assert.equal(nove.aportado, zero.aportado, 'o mês de entrada mexeu no horizonte');
  assert.equal(nove.aportado, BASE.anos * MESES_NA_FASE * BASE.aporte);
  // E a projeção precisa se mexer, senão o par (fase, mês) não estaria fazendo nada.
  assert.notEqual(nove.saldo, zero.saldo, 'o mês de entrada não teve efeito nenhum');
});

test('D11 regra 3: o Abrigo é indexado ao ano, e a fase ao mês', () => {
  // Indexado ao ano quer dizer: dentro de um mesmo ano civil da simulação a exposição
  // não se mexe, e ela só depende de quantos anos faltam.
  for (let anosRestantes = 0; anosRestantes <= INICIO_DA_RAMPA_ANOS + 2; anosRestantes++) {
    const esperado = EXPOSICAO_ALVO[Math.min(anosRestantes, INICIO_DA_RAMPA_ANOS)] / 100;
    assert.equal(expoDoAno(anosRestantes), esperado, `${anosRestantes} anos restantes`);
  }
  // E a fase anda por mês: um mês de entrada diferente de zero muda a fase no meio do
  // ano civil, que é exatamente o que o motor anual não conseguia fazer.
  const padrao = CENARIOS[CENARIO_DA_CAPA];
  assert.notEqual(motorMensal({ ...BASE, fase: 0, mes: 6, padrao }).saldo,
    motorAnual({ ...BASE, fase: 0, padrao }).saldo, 'a fase não andou por mês');
});

// ── AS CINCO PARTIDAS ─────────────────────────────────────────────────────
test('D8 · D10 · D11: cada estado devolve o par (fase, mês), e os dois de queda se separam', () => {
  const par = (estado, indice) => {
    const r = partidaDaLeitura({ disponivel: true, estado, indice });
    assert.equal(r.disponivel, true, r.motivo);
    return [r.partida.fase, r.partida.mes];
  };
  // Capitulação é queda quase consumida; Prejuízo é queda em curso. Mesma fase, meses
  // diferentes — se os dois voltarem iguais, a razão da D11 deixou de valer.
  const capitulacao = par(ESTADOS.CAPITULACAO), prejuizo = par(ESTADOS.PREJUIZO);
  assert.equal(capitulacao[0], prejuizo[0], 'os dois estados de queda saíram de fases diferentes');
  assert.notDeepEqual(capitulacao, prejuizo, 'Capitulação e Prejuízo voltaram a produzir a mesma partida');
  assert.ok(capitulacao[1] > prejuizo[1],
    'Capitulação tem de entrar MAIS TARDE na queda que Prejuízo — é o que a razão da D11 diz');
  // Estresse entra no começo da recuperação.
  assert.deepEqual(par(ESTADOS.ESTRESSE), [1, 0]);
});

test('D10 regra 2: a fronteira exata do limiar vai para a fase da correção', () => {
  const fase = (indice) => partidaDaLeitura({ disponivel: true, estado: ESTADOS.SAUDAVEL, indice }).partida.fase;
  const abaixo = fase(LIMIAR_DA_FASE_3 - 0.01), naLinha = fase(LIMIAR_DA_FASE_3), acima = fase(LIMIAR_DA_FASE_3 + 1);
  assert.equal(naLinha, acima, 'o índice exatamente no limiar não foi para a fase de cima');
  assert.notEqual(naLinha, abaixo, 'o limiar não separou nada');
  // D10 regra 1: o corte é o MESMO limiar da D9. Não se cria limiar novo.
  assert.equal(LIMIAR_DA_FASE_3, MARCO_INDICE, 'o simulador criou um limiar próprio');
});

test('D8: sem leitura da Linha d\'Água a partida é recusada, e o motivo é nomeado', () => {
  for (const leitura of [null, {}, { disponivel: false, motivo: 'terminal fora do ar' }]) {
    const r = partidaDaLeitura(leitura);
    assert.equal(r.disponivel, false, 'a tela assumiu uma fase sem leitura');
    assert.match(r.motivo, /Linha d'Água/, 'a recusa não diz o que faltou');
  }
  // E não existe partida devolvida junto com a recusa: nada de default guardado.
  assert.equal(partidaDaLeitura(null).partida, undefined);
  // Mercado saudável sem o Índice também recusa: é o Índice que parte o estado em dois.
  const semIndice = partidaDaLeitura({ disponivel: true, estado: ESTADOS.SAUDAVEL, indice: null });
  assert.equal(semIndice.disponivel, false, 'escolheu uma das duas metades sem o Índice');
  assert.match(semIndice.motivo, /Índice/);
  // Os outros três não dependem do Índice, e exigi-lo seria inventar dependência.
  assert.equal(partidaDaLeitura({ disponivel: true, estado: ESTADOS.ESTRESSE }).disponivel, true);
});

test('D11 regra 5: o rótulo da partida traz o par inteiro, gerado da constante', () => {
  // O rótulo do estado que se parte em dois tem de dizer de que lado do limiar está,
  // e o limiar tem de sair da constante — não escrito à mão ao lado.
  const acima = PARTIDAS.find((p) => p.indice === 'acima');
  assert.match(rotuloDaPartida(acima), new RegExp(`≥ ${LIMIAR_DA_FASE_3}$`));
  // E os meses que sobram da fase de entrada saem da tabela, não de conta à mão.
  for (const p of PARTIDAS) {
    assert.equal(mesesRestantesDaFase(p), MESES_NA_FASE - p.mes, rotuloDaPartida(p));
  }
});

// ── O ABRIGO ──────────────────────────────────────────────────────────────
test('D43: a tabela EXPO vai até quatro anos, e lá o Abrigo já está ativo', () => {
  const quatro = TABELA_EXPO.find((e) => e.anos === ABRIGO_ATIVO_ANOS);
  assert.ok(quatro, `a tabela EXPO não tem a linha de ${ABRIGO_ATIVO_ANOS} anos`);
  assert.equal(quatro.abrigoAtivo, true, 'o Abrigo não está ativo no ano em que a D43 o liga');
  // O ponto da D43: no ano em que o Abrigo liga a exposição ainda é cheia. Quem começa
  // a morder ali é o teto do M e a trava 3 do Reforço, não a rampa.
  assert.equal(quatro.exposicao, EXPOSICAO_ALVO[INICIO_DA_RAMPA_ANOS]);
  // A tabela é a inteira, e desce.
  assert.equal(TABELA_EXPO.length, Object.keys(EXPOSICAO_ALVO).length);
  for (let i = 1; i < TABELA_EXPO.length; i++) {
    assert.ok(TABELA_EXPO[i].exposicao < TABELA_EXPO[i - 1].exposicao, 'a rampa subiu em algum trecho');
    assert.ok(TABELA_EXPO[i].passoMensal > 0, 'trecho sem passo mensal');
  }
});

test('D43: o Abrigo assume as estações a partir do ano em que fica ativo', () => {
  const est = estacoesPorAno({ anos: ENTREGA_AOS, fase: 2, mes: 0 });
  const emAbrigo = est.filter((e) => e.estacao === ABRIGO);
  assert.equal(emAbrigo.length, ABRIGO_ATIVO_ANOS + 1,
    `o Abrigo tem de cobrir os anos com ${ABRIGO_ATIVO_ANOS} ou menos restando`);
  for (const e of est) {
    assert.equal(e.estacao === ABRIGO, e.anosRestantes <= ABRIGO_ATIVO_ANOS, `ano ${e.ano}`);
  }
});

test('a estação vem do estado, nunca da fase', () => {
  // A fase 3 é entrada de Mercado saudável (D10), e Mercado saudável é Colheita.
  // A versão anterior da tela tinha um mapa de fase escrito à mão que mandava a fase 3
  // para Plantio — o oposto do que o estado diz.
  const est = estacoesPorAno({ anos: ENTREGA_AOS, fase: 3, mes: 0 });
  assert.equal(est[0].estado, ESTADOS.SAUDAVEL, 'a fase 3 não é entrada de Mercado saudável');
  assert.equal(est[0].estacao, ESTACAO_DO_ESTADO[ESTADOS.SAUDAVEL]);
  // E todo estado tem estação: nenhum cai em nulo.
  for (const estado of Object.values(ESTADOS)) assert.ok(ESTACAO_DO_ESTADO[estado], estado);
});

test('D11 lida de trás para a frente: dentro da queda, Prejuízo vem antes de Capitulação', () => {
  // Não é mapa novo. Os meses de entrada da D11 são o que separa os dois estados dentro
  // da mesma fase, e a modulação de velocidade da D25 B precisa desse estado para ler.
  const capitulacao = PARTIDAS.find((p) => p.estado === ESTADOS.CAPITULACAO);
  const prejuizo = PARTIDAS.find((p) => p.estado === ESTADOS.PREJUIZO);
  assert.equal(estadoDaFase(capitulacao.fase, capitulacao.mes), ESTADOS.CAPITULACAO);
  assert.equal(estadoDaFase(prejuizo.fase, prejuizo.mes), ESTADOS.PREJUIZO);
  assert.equal(estadoDaFase(capitulacao.fase, capitulacao.mes - 1), ESTADOS.PREJUIZO,
    'o mês anterior à entrada da Capitulação tem de ser ainda Prejuízo');
  assert.equal(estadoDaFase(prejuizo.fase, 0), ESTADOS.PREJUIZO, 'a queda começa em Prejuízo');
});

// ── A MODULAÇÃO DA VELOCIDADE (D25 B · C · D) ─────────────────────────────
test('D25 C: a defasagem nunca passa do teto, em nenhuma partida', () => {
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    assert.ok(t.maiorDefasagem <= TETO_DEFASAGEM,
      `${rotuloDaPartida(p)}: defasagem chegou a ${t.maiorDefasagem}, acima do teto`);
    for (const l of t.linhas) {
      // No teto o fator volta ao neutro: abaixo disso a modulação viraria aposta. Quem
      // decide o fator do mês é a defasagem com que o mês COMEÇOU — o mês que leva a
      // defasagem ao teto ainda modula, e é o seguinte que trava.
      if (l.defasagemAntes >= TETO_DEFASAGEM && l.mesesAteEntrega > MESES_SEM_MODULACAO) {
        assert.equal(l.fator, 1, `mês ${l.t}: começou no teto e ainda modulou`);
      }
    }
  }
});

test('D25 D: nos últimos doze meses ninguém modula, e a defasagem é liquidada', () => {
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    for (const l of t.linhas.filter((l) => l.mesesAteEntrega <= MESES_SEM_MODULACAO)) {
      assert.equal(l.fator, 1, `${rotuloDaPartida(p)}, mês ${l.t}: modulou dentro do último ano`);
    }
    // Liquidada, não perdoada: chega a zero DENTRO do período, e não some de uma vez.
    assert.equal(t.defasagemNaEntrega, 0,
      `${rotuloDaPartida(p)}: chegou na entrega com ${t.defasagemNaEntrega} de defasagem`);
  }
});

test('D25 B: a velocidade é do estado, e os quatro fatores estão ligados ao seu estado', () => {
  // Ligado, não presente (D46): cada estado com o SEU fator, na mesma linha.
  assert.equal(VELOCIDADE_POR_ESTADO[ESTADOS.SAUDAVEL], 1.50);
  assert.equal(VELOCIDADE_POR_ESTADO[ESTADOS.ESTRESSE], 1.00);
  assert.equal(VELOCIDADE_POR_ESTADO[ESTADOS.PREJUIZO], 0.50);
  assert.equal(VELOCIDADE_POR_ESTADO[ESTADOS.CAPITULACAO], 0.25);
  // E a trajetória usa o fator do estado do mês, não um fator fixo.
  const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: 0, mes: 9 });
  for (const l of t.linhas.filter((l) => l.mesesAteEntrega > MESES_SEM_MODULACAO
    && l.defasagem < TETO_DEFASAGEM)) {
    assert.equal(l.fator, VELOCIDADE_POR_ESTADO[l.estado], `mês ${l.t}, estado ${l.estado}`);
  }
});

// ── A CAPA E A DERIVA (D12 · D13) ─────────────────────────────────────────
test('D12 A: o número de capa é o piso entre as partidas, e traz a identidade junto', () => {
  const capa = numeroDeCapa(BASE);
  const g = grade(BASE);
  const conservadores = g.linhas.map((l) => l.celulas.find((c) => c.cenario === CENARIO_DA_CAPA).atual);
  assert.equal(capa.valor, Math.min(...conservadores), 'a capa não é o menor resultado');
  assert.equal(capa.cenario, CENARIO_DA_CAPA);
  // D13 regra 4: a identidade do piso é rastreada JUNTO com o valor.
  const dono = g.linhas.find((l) => l.celulas.some((c) => c.atual === capa.valor));
  assert.equal(capa.identidade, dono.rotulo, 'a capa não sabe de que partida saiu');
  // E a capa nunca é a leitura do dia: ela é escolhida por ser a menor, não por ser hoje.
  assert.equal(capa.multiplicador, capa.valor / capa.aportado);
});

test('D12 B regra 1 · D13 regra 1: a grade sai inteira, e a deriva é medida contra a v1.3', () => {
  const g = grade(BASE);
  assert.equal(g.celulas, CELULAS_DA_GRADE);
  assert.equal(g.linhas.length * g.linhas[0].celulas.length, CELULAS_DA_GRADE,
    'a grade publicada não tem as cinco partidas nos três cenários');
  // A referência é RODADA, não transcrita: onde a v1.3 já usava a mesma fase e o mês 0,
  // a deriva tem de ser exatamente zero.
  for (const l of g.linhas) {
    const igual = l.partida.fase === l.partida.faseNaV13 && l.partida.mes === 0;
    for (const c of l.celulas) {
      if (igual) assert.equal(c.deriva, 0, `${l.rotulo} · ${c.cenario}: mesma partida, deriva não zero`);
      else assert.notEqual(c.deriva, 0, `${l.rotulo} · ${c.cenario}: mudou de partida e não derivou`);
    }
  }
});

test('D13 regra 2: estourou uma célula, a revisão inteira fica retida', () => {
  const g = grade(BASE);
  assert.equal(g.retida, g.estouradas > 0, 'a retenção não acompanha o estouro');
  // A contagem é por célula, e a marca de cada uma é o próprio limite.
  const contadas = g.linhas.flatMap((l) => l.celulas).filter((c) => c.deriva > TETO_DERIVA).length;
  assert.equal(g.estouradas, contadas, 'a contagem de estouros não bate com o limite');
  // E o limite é por célula, não só pelo piso: o piso desta grade não estourou, e a
  // grade está retida assim mesmo. Se isso deixar de valer, a D13 virou a D12 de novo.
  const capa = numeroDeCapa(BASE);
  const doPiso = g.linhas.find((l) => l.rotulo === capa.identidade);
  assert.equal(doPiso.celulas.some((c) => c.estourou), false, 'o piso estourou — o exemplo mudou');
  assert.equal(g.retida, true, 'a grade não reteve por linha, só olhou o piso');
});

// ── D51 · A BANDA NO ÚLTIMO ANO E A MODULAÇÃO NA PROJEÇÃO ─────────────────
test('D51 A: a banda afunila de ponta a ponta do último ano, e não é suspensa', () => {
  // Fora dos últimos doze meses ela é a âncora, inteira.
  assert.equal(bandaDoMes(MESES_SEM_MODULACAO), BANDA_PONTOS);
  assert.equal(bandaDoMes(MESES_SEM_MODULACAO * 5), BANDA_PONTOS);
  // 1. NÃO É SUSPENSA: enquanto sobra mês do último ano, sobra banda.
  for (let m = 1; m < MESES_SEM_MODULACAO; m++) {
    assert.ok(bandaDoMes(m) > 0,
      `a banda foi a zero faltando ${m} mês(es) — isso é suspender, não afunilar`);
  }
  // 2. AFUNILA EM LINHA RETA, não por degrau: cada mês vale a fração do que resta.
  for (let m = 0; m <= MESES_SEM_MODULACAO; m++) {
    const proporcional = Number((BANDA_PONTOS * (m / MESES_SEM_MODULACAO)).toFixed(4));
    assert.equal(bandaDoMes(m), proporcional,
      `faltando ${m} mês(es) a banda devia ser ${proporcional} e é ${bandaDoMes(m)}`);
  }
  // 3. E DECRESCE SEMPRE: nenhum mês do último ano tolera mais que o anterior.
  for (let m = 0; m < MESES_SEM_MODULACAO; m++) {
    assert.ok(bandaDoMes(m) < bandaDoMes(m + 1),
      `a banda não encolheu de ${m + 1} para ${m} mês(es)`);
  }
  // 4. NA ENTREGA É ZERO: é isso que tira a folga da promessa central do produto.
  assert.equal(bandaDoMes(0), 0, 'a banda não zerou na entrega');
});

test('D51 C: o afunilamento não mexe na liquidação da defasagem', () => {
  // Banda e defasagem seguem coisas diferentes: a banda encolhe, a defasagem continua
  // sendo liquidada até zero dentro do último ano, nas cinco partidas.
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    assert.equal(t.defasagemNaEntrega, 0, rotuloDaPartida(p));
    // E dentro da banda a defasagem continua sem crescer — a banda não gera defasagem.
    for (const l of t.linhas.filter((l) => l.dentroDaBanda)) {
      assert.equal(l.defasagem, l.defasagemAntes, `mês ${l.t}: a banda gerou defasagem`);
    }
  }
});

test('⚠️ D51 A medido: a banda não é o que segura a folga da entrega', () => {
  // Esta asserção não afirma que a regra está errada. Ela FIXA A MEDIDA que a decisão
  // precisa ver: se a banda nunca decide nada no último ano, o afunilamento não tem
  // onde morder, e quem congela a folga é `min(passo, distância)` da D25 C.
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    assert.equal(t.mesesEmQueABandaSegurou, 0,
      `${rotuloDaPartida(p)}: a banda passou a segurar meses do último ano — a medida mudou, ` +
      'e a conclusão registrada na D51 precisa ser refeita');
    assert.equal(t.mesesTravadosNoPasso, t.mesesDoUltimoAno,
      `${rotuloDaPartida(p)}: deixou de haver mês com distância acima do passo`);
    // A folga é positiva e sobrevive à entrega, mesmo com a banda em zero no fim.
    assert.ok(t.folgaNaEntrega > t.bandaNaEntrega,
      `${rotuloDaPartida(p)}: a folga coube na banda — o diagnóstico mudou`);
  }
});
