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
  TETO_SALTO_DA_CAPA, TETO_SALTO_DA_CELULA, VERSAO_REFERENCIA,
  saltoEntreVersoes, HISTORICO_PUBLICADO, ultimaPublicada,
  partidaDaLeitura, rotuloDaPartida, mesesRestantesDaFase, estadoDaFase, estacoesPorAno,
  motorMensal, motorAnual, motorDaV13, exposicaoModulada, criterioDeAceiteD11, grade, numeroDeCapa,
  trajetoriaDaGlidepath, expoDoAno,
} from './motor.mjs';
import { passoDoMes } from '../alocador/alocador.mjs';

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
test('D53 A: a projeção publicada usa a exposição modulada, e não mais o alvo do ano', () => {
  for (const p of PARTIDAS) {
    const exposicaoDoMes = exposicaoModulada({ anos: BASE.anos, fase: p.fase, mes: p.mes });
    assert.ok(exposicaoDoMes, `${rotuloDaPartida(p)}: sem trajetória não há exposição modulada`);
    const comum = { ...BASE, fase: p.fase, mes: p.mes, padrao: CENARIOS[CENARIO_DA_CAPA] };
    const modulada = motorMensal({ ...comum, exposicaoDoMes }).saldo;
    const alvoDoAno = motorMensal(comum).saldo;
    // Se as duas dessem o mesmo, a D53 A não teria trocado nada.
    assert.notEqual(modulada, alvoDoAno,
      `${rotuloDaPartida(p)}: a modulação não muda a projeção — a D53 A não está aplicada`);
    // E é a modulada que vai para a grade publicada.
    const naGrade = grade(BASE).linhas.find((l) => l.partida === p)
      .celulas.find((c) => c.cenario === CENARIO_DA_CAPA).atual;
    assert.equal(naGrade, modulada,
      `${rotuloDaPartida(p)}: a grade publicada ainda está no alvo do ano`);
  }
});

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
  // A referência é RODADA, não transcrita — e rodada na REGRA DA v1.3, congelada.
  // Antes da D53 A a referência usava o motor corrente com o mapeamento da v1.3, e por
  // isso as partidas que a v1.3 já mapeava igual davam deriva exatamente zero. Com a
  // regra de exposição trocada isso deixou de valer, e tinha de deixar: se a referência
  // seguisse o motor, os dois lados se moveriam juntos e a deriva mediria zero por
  // construção — a trava ficaria cega justamente para a revisão que ela existe pegar.
  for (const l of g.linhas) {
    for (const c of l.celulas) {
      assert.ok(Number.isFinite(c.deriva), `${l.rotulo} · ${c.cenario}: deriva não numérica`);
      assert.notEqual(c.atual, c.referencia,
        `${l.rotulo} · ${c.cenario}: a referência acompanhou o motor — ela tem de ficar na regra da v1.3`);
    }
  }
  // E a prova de que a referência está mesmo congelada, EM TODAS AS LINHAS: só a linha
  // de cima não bastaria, porque nela a fase de hoje e a da v1.3 por acaso coincidem, e
  // uma troca de mapeamento passaria invisível. A asserção que só olha a primeira linha
  // é a asserção que não olha as que importam.
  for (const l of g.linhas) {
    for (const c of l.celulas) {
      assert.equal(c.referencia,
        motorDaV13({ anos: BASE.anos, aporte: BASE.aporte, fase: l.partida.faseNaV13,
          padrao: CENARIOS[c.cenario] }).saldo,
        `${l.rotulo} · ${c.cenario}: a referência da grade deixou de ser o motor da v1.3`);
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

test('D52 A: o mês fecha a posição — a exposição para no alvo do mês, nunca depois dele', () => {
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    // O que a D52 B afirma: banda zero, distância zero. Nunca distância NEGATIVA — a
    // carteira não atravessa o alvo para baixo, e não vende estando sub-exposta.
    assert.ok(t.folgaNoUltimoMes >= 0,
      `${rotuloDaPartida(p)}: a carteira passou do alvo para baixo, entregando a ${t.exposicaoNaEntrega}%`);
    // E o que sobra cabe na banda daquele mês: é tolerância, não folga carregada. No
    // último mês administrado a banda é zero, então "cabe na banda" quer dizer zero.
    assert.ok(t.folgaNoUltimoMes <= t.bandaDoUltimoMes,
      `${rotuloDaPartida(p)}: sobrou ${t.folgaNoUltimoMes} pt, acima da banda de ${t.bandaDoUltimoMes} pt`);
    // Nenhum mês move mais do que a distância que existe para mover.
    for (const l of t.linhas) {
      assert.ok(l.mover <= Math.max(l.distancia, 0) + 1e-9,
        `mês ${l.t}: moveu ${l.mover} com distância de ${l.distancia}`);
    }
  }
});

test('⚠️ D52 D: as medidas que sustentam a D51 e a D52 ficam fixadas, com os valores novos', () => {
  // A frase virou regra: diagnóstico que sustenta decisão vira asserção, senão
  // envelhece calado. Se qualquer número aqui mudar, a mensagem diz qual decisão
  // precisa ser refeita — não basta o teste ficar vermelho.
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    const quem = rotuloDaPartida(p);

    // 1. A cláusula "não mexe em nada" continua sem disparar no último ano — mas agora
    //    por motivo OPOSTO: a banda é consultada todo mês e define onde a posição para,
    //    só que a distância antes do movimento é sempre banda mais um passo.
    assert.equal(t.mesesEmQueABandaSegurou, 0,
      `${quem}: a cláusula da banda passou a disparar — o diagnóstico da D51 A e da D52 A ` +
      'precisa ser refeito, porque ele afirma que ela nunca dispara');

    // 2. E a medida que passou a carregar o diagnóstico. D53 D fixa o escopo: sem
    //    defasagem acumulada a BANDA dimensiona TODO mês do último ano; com defasagem,
    //    quem traz ao alvo é a liquidação da D25 D, e a banda dimensiona quase nada.
    //    As duas peças cobrem regimes diferentes, e nenhuma é redundante.
    const temDefasagem = t.maiorDefasagem > 0;
    assert.equal(t.mesesEmQueABandaDefiniuAPosicao === t.mesesDoUltimoAno, !temDefasagem,
      `${quem}: quem dimensiona o mês do último ano trocou — o escopo registrado na D53 D, ` +
      'de que a banda manda onde não há defasagem e a liquidação manda onde há, precisa ser refeito');

    // 3. A defasagem continua liquidada até zero (D25 D · D51 C), e a D52 não mexeu nisso.
    assert.equal(t.defasagemNaEntrega, 0, `${quem}: a defasagem sobreviveu à entrega`);
  }
});

test('D53 C: o último mês executa — os dois alvos batem no marco, e a carteira chega nele', () => {
  // O passo órfão da D52 C não existe mais. Os dois campos continuam separados na tela,
  // porque foi a separação que tornou o mês escondido visível — mas agora eles batem.
  for (const p of PARTIDAS) {
    const t = trajetoriaDaGlidepath({ anos: ENTREGA_AOS, fase: p.fase, mes: p.mes });
    const quem = rotuloDaPartida(p);
    assert.equal(t.alvoDoMarcoDaEntrega, EXPOSICAO_ALVO[0],
      'o marco da entrega deixou de ser a exposição de entrega da tabela');
    assert.equal(t.alvoDoUltimoMes, t.alvoDoMarcoDaEntrega,
      `${quem}: o último mês administrado voltou a mirar um ponto anterior ao marco`);
    assert.equal(t.exposicaoNaEntrega, EXPOSICAO_ALVO[0],
      `${quem}: a carteira chega a ${t.exposicaoNaEntrega}% com o marco publicado em ${EXPOSICAO_ALVO[0]}%`);
    assert.equal(t.folgaContraOMarco, 0, `${quem}: sobrou folga contra o marco`);
    assert.equal(t.bandaDoUltimoMes, 0, `${quem}: sobrou tolerância no mês que aterrissa`);
  }
});

// ── D54 · A TRAVA DE SALTO ENTRE VERSÕES ─────────────────────────────────
test('D54 A: o salto é medido contra a versão anterior, e nos dois sentidos', () => {
  const r = saltoEntreVersoes(BASE);
  const anterior = ultimaPublicada();
  assert.equal(r.versaoAnterior, anterior.versao, 'o salto não está sendo medido contra a última publicada');
  // A capa tem limite MENOR que as demais células (D54 B): é o número que o cliente lê
  // primeiro, e a D12 A fez dele o compromisso do material.
  assert.ok(TETO_SALTO_DA_CAPA < TETO_SALTO_DA_CELULA,
    'a capa perdeu o limite mais apertado — ela é a promessa publicada');
  // D54 D: qualquer direção. Um salto para baixo do mesmo tamanho tem de acionar igual.
  const paraCima = (100 + TETO_SALTO_DA_CAPA + 1) / 100, paraBaixo = (100 - TETO_SALTO_DA_CAPA - 1) / 100;
  for (const fator of [paraCima, paraBaixo]) {
    const salto = (anterior.capa * fator / anterior.capa - 1) * 100;
    assert.ok(Math.abs(salto) > TETO_SALTO_DA_CAPA,
      'um salto simétrico deixou de acionar — a trava virou unidirecional');
  }
  // E a saída diz o que aciona o Gate, não só que algo aciona.
  assert.equal(r.vaiAoGate, r.capa.vaiAoGate || r.celulas.some((c) => c.vaiAoGate));
});

test('D54 A: célula sem registro na versão anterior não vira salto zero', () => {
  // ⚠️ Contra a v1.10 este caso NÃO EXISTE — ela registrou as quinze células, e um teste
  // rodado contra ela passaria por vazio, sem nunca entrar no ramo que confere. A versão
  // sem células é real e está no histórico: a v1.3, e todas até a v1.9, só têm a capa.
  const semCelulas = HISTORICO_PUBLICADO[0];
  assert.equal(semCelulas.celulas, undefined, 'a v1.3 passou a registrar células — troque o réu');
  const r = saltoEntreVersoes({ ...BASE, anterior: semCelulas });
  assert.equal(r.celulasSemRegistro, CELULAS_DA_GRADE,
    'contra uma versão sem células registradas, TODAS as células têm de sair sem registro');
  for (const c of r.celulas) {
    assert.equal(c.salto, null, `${c.partida} · ${c.cenario}: sem registro virou número`);
    assert.equal(c.vaiAoGate, false, 'sem registro não pode acionar nem liberar por conta própria');
  }
  // E a capa, que é registrada desde a v1.3, continua sendo comparável.
  assert.ok(Number.isFinite(r.capa.salto), 'a capa deixou de ser comparável contra a v1.3');

  // E contra a versão que registrou tudo, o outro ramo: salto numérico e gatilho ligado
  // ao limite, célula a célula.
  const cheio = saltoEntreVersoes(BASE);
  assert.equal(cheio.celulasSemRegistro, 0, 'a versão anterior deixou de registrar as células');
  for (const c of cheio.celulas) {
    assert.ok(Number.isFinite(c.salto), `${c.partida} · ${c.cenario}: salto não numérico`);
    assert.equal(c.vaiAoGate, Math.abs(c.salto) > TETO_SALTO_DA_CELULA,
      `${c.partida} · ${c.cenario}: o gatilho não acompanha o limite`);
  }
});

test('⚠️ D54: as duas travas não pegam as mesmas células — é por isso que são duas', () => {
  // Se as duas pegassem sempre o mesmo conjunto, uma seria redundante. A medida que
  // sustenta a D54 A é justamente esta: há célula retida por uma e liberada pela outra.
  const g = grade(BASE), r = saltoEntreVersoes(BASE);
  const chave = (partida, cenario) => `${partida} · ${cenario}`;
  const porDeriva = new Set(g.linhas.flatMap((l) =>
    l.celulas.filter((c) => c.estourou).map((c) => chave(l.rotulo, c.cenario))));
  const porSalto = new Set(r.celulas.filter((c) => c.vaiAoGate).map((c) => chave(c.partida, c.cenario)));
  assert.ok(porDeriva.size > 0 && porSalto.size > 0, 'uma das travas parou de acionar');
  const soNoSalto = [...porSalto].filter((k) => !porDeriva.has(k));
  const soNaDeriva = [...porDeriva].filter((k) => !porSalto.has(k));
  assert.ok(soNoSalto.length > 0,
    'nenhuma célula é pega só pela trava de salto — a razão escrita na D54 A, de que uma não ' +
    'substitui a outra, precisa ser refeita');
  assert.ok(soNaDeriva.length > 0,
    'nenhuma célula é pega só pela trava de deriva — idem');
});

test('o histórico publicado é registro, e o que ele registrou da v1.10 confere', () => {
  // O histórico é fato escrito: não sai do motor de hoje, porque o motor mudou. Mas o
  // motor da v1.10 — alvo do ano, sem modulação — ainda está disponível como padrão do
  // `motorMensal`, e enquanto estiver, o registro é conferível contra ele. Se esta
  // asserção quebrar por troca do motor padrão, ela sai e o REGISTRO fica: é ele que
  // vale, e a conferência cruzada era um bônus enquanto durou.
  const v110 = HISTORICO_PUBLICADO.find((v) => v.versao === 'v1.10');
  assert.ok(v110?.celulas, 'a v1.10 deixou de registrar as células');
  for (const p of PARTIDAS) {
    const registrado = v110.celulas[rotuloDaPartida(p)];
    assert.ok(registrado, `a v1.10 não registrou a partida ${rotuloDaPartida(p)}`);
    for (const [cenario, padrao] of Object.entries(CENARIOS)) {
      const reproduzido = Math.round(
        motorMensal({ ...BASE, fase: p.fase, mes: p.mes, padrao }).saldo);
      assert.equal(registrado[cenario], reproduzido,
        `${rotuloDaPartida(p)} · ${cenario}: o registro diz ${registrado[cenario]} e o motor da v1.10 dá ${reproduzido}`);
    }
  }
  // E a capa registrada da v1.10 é o menor conservador registrado.
  const conservadores = Object.values(v110.celulas).map((c) => c.Conservador);
  assert.equal(v110.capa, Math.min(...conservadores), 'a capa registrada não é o piso registrado');
});

test('D54: o histórico é append-only e a série não pula versão', () => {
  // ⚠️ Versão não é decimal: `Number('1.10')` dá 1.1, que é MENOR que `Number('1.9')`.
  // Comparar como número diria que a v1.10 vem antes da v1.9. Compara-se parte a parte.
  const partes = (v) => v.versao.slice(1).split('.').map(Number);
  const maior = (a, b) => a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1];
  for (let i = 1; i < HISTORICO_PUBLICADO.length; i++) {
    assert.ok(maior(partes(HISTORICO_PUBLICADO[i]), partes(HISTORICO_PUBLICADO[i - 1])),
      `a série voltou atrás em ${HISTORICO_PUBLICADO[i].versao}`);
  }
  // A primeira linha é a base da trava de deriva, e ela não se move (D13 regra 2).
  assert.equal(HISTORICO_PUBLICADO[0].versao, VERSAO_REFERENCIA,
    'a série deixou de começar na referência da trava de deriva');
  assert.equal(ultimaPublicada(), HISTORICO_PUBLICADO[HISTORICO_PUBLICADO.length - 1]);
});
