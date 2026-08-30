// MOTOR DO SIMULADOR — peça 4, item 4 da implementação da Carteira Semente.
//
// O simulador PROJETA MECANISMO. Não promete retorno, não prevê preço, e a saída
// daqui nunca é recomendação (invariante 1 e Gate 2 item 3).
//
// Tudo o que a tela escreve com número sai deste arquivo (invariante 12, D44). Os
// valores publicados no documento-mãe — as cinco partidas nos três cenários, o
// número de capa e a tabela de deriva — são CALCULADOS aqui, não transcritos: a
// referência v1.3 também é rodada pelo mesmo motor, com o mapeamento da v1.3.
//
// SEM DEFAULT SILENCIOSO (invariante 3 · D8): sem leitura da Linha d'Água este
// arquivo RECUSA a projeção e nomeia o que falta, em vez de assumir uma fase.

import { ESTADOS, faixaDoIndice } from '../torre/torre.mjs';
import { MARCO_INDICE } from '../registro/registro.mjs';
import {
  EXPOSICAO_ALVO, INICIO_DA_RAMPA_ANOS, ABRIGO_ATIVO_ANOS, VELOCIDADE_POR_ESTADO,
  BANDA_PONTOS, TETO_DEFASAGEM, MESES_SEM_MODULACAO,
  alvoDaGlidepath, passoDoMes, bandaDoMes, demandaDaGlidepath,
} from '../alocador/alocador.mjs';

const arred = (x, casas = 4) => Number(x.toFixed(casas));

/**
 * A fase do mês `t`, indexada ao MÊS e não ao ano (D11). Fica em função própria porque
 * ela é o coração da troca do laço, e ponto de uso único é o que permite mirar a
 * mutação nela (D47 A) — duplicada, uma prova deixaria o gêmeo de pé.
 */
export const faseDoMes = (fase, mes, t) =>
  Math.floor((fase * MESES_NA_FASE + mes + t) / MESES_NA_FASE) % FASES.length;

// ── OS TRÊS CENÁRIOS ──────────────────────────────────────────────────────
// Padrão de quatro anos, uma taxa por fase. É perspectiva de mecanismo: as quedas
// estão dentro da conta, não só as altas.
export const CENARIOS = Object.freeze({
  Conservador: Object.freeze([-0.55, 0.35, 1.20, 0.10]),
  Moderado: Object.freeze([-0.60, 0.50, 2.00, 0.20]),
  Forte: Object.freeze([-0.65, 0.70, 3.00, 0.30]),
});

export const FASES = Object.freeze(['queda', 'recuperação', 'alta', 'correção']);

/**
 * D49: os R$ 150 por mês são REFERÊNCIA DE CÁLCULO, não regra de produto. Nada no
 * sistema exige esse valor e nenhuma trava depende dele — o simulador aceita
 * qualquer aporte. Ele existe aqui só porque as tabelas publicadas foram calculadas
 * sobre ele, e comparar deriva exige base fixa. Onde aparecer, sai rotulado.
 *
 * Provisório até o Gui definir aporte mínimo, se houver. Se definir, vira regra e
 * passa uma vez pelos quatro critérios da classe âncora.
 */
export const APORTE_DE_REFERENCIA = 150;
export const IDADE_DE_REFERENCIA = 0;
export const BASE_DA_PUBLICACAO = Object.freeze({
  idade: IDADE_DE_REFERENCIA, aporte: APORTE_DE_REFERENCIA,
  rotulo: 'referência de cálculo, não regra de produto',
});
export const MESES_NA_FASE = 12;
export const ENTREGA_AOS = 18;

// D10 regra 1: o corte é 65, O MESMO limiar da D9. Não se cria limiar novo — por
// isso ele é importado do Registro, e não redigitado aqui.
export const LIMIAR_DA_FASE_3 = MARCO_INDICE;

// ── AS CINCO PARTIDAS (D8 · D10 · D11) ────────────────────────────────────
/**
 * O mapeamento estado → partida devolve um PAR (fase, mês de entrada na fase).
 *
 * `faseNaV13` é a fase que a mesma leitura teria recebido na v1.3, e existe por uma
 * razão só: a tabela de deriva da D12 B / D13 é medida contra a v1.3, e medir contra
 * número transcrito à mão seria carimbar. Rodando as duas pelo mesmo motor, a
 * deriva é medida, não copiada.
 *
 * D11 regra 2: os meses não consumidos da fase de entrada NÃO são recuperados no
 * fim. A fase de entrada é parcial por definição.
 */
export const PARTIDAS = Object.freeze([
  Object.freeze({ estado: ESTADOS.CAPITULACAO, indice: null, fase: 0, mes: 9, faseNaV13: 0 }),
  Object.freeze({ estado: ESTADOS.PREJUIZO, indice: null, fase: 0, mes: 3, faseNaV13: 3 }),
  Object.freeze({ estado: ESTADOS.ESTRESSE, indice: null, fase: 1, mes: 0, faseNaV13: 1 }),
  Object.freeze({ estado: ESTADOS.SAUDAVEL, indice: 'abaixo', fase: 2, mes: 0, faseNaV13: 2 }),
  Object.freeze({ estado: ESTADOS.SAUDAVEL, indice: 'acima', fase: 3, mes: 0, faseNaV13: 2 }),
]);

/** O rótulo da partida sai daqui — nunca escrito à mão do lado da tela (D44). */
export const rotuloDaPartida = (p) => p.indice === null ? p.estado
  : `${p.estado} · Índice ${p.indice === 'acima' ? '≥' : '<'} ${LIMIAR_DA_FASE_3}`;

export const rotuloDoPar = (p) => `fase ${p.fase} · ${FASES[p.fase]} · mês ${p.mes}`;

/** D11: meses que ainda restam da fase de entrada. Sai da tabela, não de conta à mão. */
export const mesesRestantesDaFase = (p) => MESES_NA_FASE - p.mes;

/**
 * D8, última linha, e é a regra e não o rodapé: **sem leitura da Linha d'Água o
 * simulador não assume fase.** Exibe o estado indisponível e não gera projeção.
 * Nunca cair em default silencioso.
 *
 * E o Índice é exigido só onde ele decide alguma coisa: em Mercado saudável, que a
 * D10 partiu em duas. Exigi-lo nos outros três seria inventar dependência.
 */
export function partidaDaLeitura(leitura) {
  if (!leitura || leitura.disponivel === false || !leitura.estado) {
    return { disponivel: false,
      motivo: 'sem leitura da Linha d\'Água não há projeção — estado indisponível (D8)',
      detalhe: leitura?.motivo ?? null };
  }
  const { estado, indice } = leitura;
  const candidatas = PARTIDAS.filter((p) => p.estado === estado);
  if (candidatas.length === 0) {
    return { disponivel: false, motivo: `estado sem partida definida: ${estado}` };
  }
  if (candidatas.length === 1) return { disponivel: true, partida: candidatas[0], indice };
  if (typeof indice !== 'number' || !Number.isFinite(indice)) {
    return { disponivel: false,
      motivo: `${estado} se parte em duas pelo Índice (D10) e o Índice não veio — sem ele não há partida` };
  }
  // D10 regra 2: a fronteira exata (Índice igual ao limiar) vai para a fase 3.
  const lado = indice >= LIMIAR_DA_FASE_3 ? 'acima' : 'abaixo';
  return { disponivel: true, partida: candidatas.find((p) => p.indice === lado), indice };
}

/**
 * O estado que vigora num mês qualquer da simulação, lido da própria tabela da D11
 * DE TRÁS PARA A FRENTE. Não é mapeamento novo: a D11 diz que Prejuízo entra na
 * fase 0 no mês 3 (nove meses pela frente) e Capitulação no mês 9 (três pela
 * frente) — logo, dentro da fase 0, os primeiros meses são Prejuízo e os últimos
 * são Capitulação. É o que os meses de entrada afirmam.
 *
 * Serve à modulação de velocidade da D25 B, que é indexada ao ESTADO. Sem a D11 a
 * fase 0 seria ambígua (dois estados, uma fase) e a modulação não teria estado
 * definido para ler.
 */
export function estadoDaFase(fase, mesNaFase) {
  const candidatas = PARTIDAS.filter((p) => p.fase === fase).sort((a, b) => b.mes - a.mes);
  if (candidatas.length === 0) return null;
  return (candidatas.find((p) => mesNaFase >= p.mes) ?? candidatas[candidatas.length - 1]).estado;
}

// ── O ABRIGO, INDEXADO AO ANO ─────────────────────────────────────────────
/**
 * D11 regra 3: a modulação de Abrigo continua indexada aos ANOS restantes até a
 * entrega, nunca à fase. É o que separa as duas indexações do motor mensal — o
 * Abrigo anda por ano, a fase anda por mês.
 *
 * D43: a tabela vai até quatro anos, e o Abrigo passa a estar ativo a partir dali.
 * Acima do início da rampa a exposição é cheia, que é a própria entrada de 4 anos.
 */
export const expoDoAno = (anosRestantes) =>
  EXPOSICAO_ALVO[Math.min(Math.max(anosRestantes, 0), INICIO_DA_RAMPA_ANOS)] / 100;

/** A tabela EXPO completa, com o passo mensal de cada trecho (D25 A · D43). */
export const TABELA_EXPO = Object.freeze(
  Object.keys(EXPOSICAO_ALVO).map(Number).sort((a, b) => b - a).map((anos) => Object.freeze({
    anos,
    rotulo: anos === 0 ? 'entrega' : `${anos} ${anos === 1 ? 'ano' : 'anos'}`,
    exposicao: EXPOSICAO_ALVO[anos],
    // Passo do mês DENTRO do trecho que desce até este marco. No topo da rampa não
    // há trecho acima, e na entrega o trecho é o de 1 ano para 0.
    passoMensal: anos >= INICIO_DA_RAMPA_ANOS ? null : arred(passoDoMes(anos * 12), 4),
    abrigoAtivo: anos <= ABRIGO_ATIVO_ANOS,
  }))
);

// ── O MOTOR ───────────────────────────────────────────────────────────────
/**
 * D11, especificação do motor. O laço central é MENSAL:
 *   ano  = t ÷ 12                                (divisão inteira)
 *   exp  = EXPO[anos restantes]                  ← Abrigo, indexado ao ANO
 *   f    = ((fase × 12 + mês + t) ÷ 12) mod 4    ← fase, indexada ao MÊS
 *
 * Com mês 0 a expressão de `f` colapsa em `(fase + ano) mod 4`, que é exatamente o
 * motor anual — identidade algébrica, não arredondamento. `criterioDeAceiteD11`
 * roda essa igualdade nas doze combinações.
 */
export function motorMensal({ anos, aporte, fase, mes = 0, padrao }) {
  const pontos = [{ ano: 0, saldo: 0, aportado: 0, exposicao: expoDoAno(anos - 1) * 100 }];
  let saldo = 0, aportado = 0;
  for (let t = 0; t < anos * MESES_NA_FASE; t++) {
    const ano = Math.floor(t / MESES_NA_FASE);
    const exp = expoDoAno(anos - ano - 1);
    const f = faseDoMes(fase, mes, t);
    const m = (1 + padrao[f] * exp) ** (1 / 12) - 1;
    saldo = (saldo + aporte) * (1 + m);
    aportado += aporte;
    if (t % MESES_NA_FASE === MESES_NA_FASE - 1) {
      pontos.push({ ano: ano + 1, saldo, aportado, exposicao: exp * 100 });
    }
  }
  return { pontos, saldo, aportado };
}

/**
 * O motor ANTERIOR, anual, mantido por um motivo só: ser o réu do critério de aceite
 * da D11 regra 4. Não alimenta tela nenhuma.
 */
export function motorAnual({ anos, aporte, fase, padrao }) {
  let saldo = 0, aportado = 0;
  for (let y = 0; y < anos; y++) {
    const exp = expoDoAno(anos - y - 1);
    const m = (1 + padrao[(fase + y) % FASES.length] * exp) ** (1 / 12) - 1;
    for (let i = 0; i < MESES_NA_FASE; i++) { saldo = (saldo + aporte) * (1 + m); aportado += aporte; }
  }
  return { saldo, aportado };
}

/**
 * D11 regra 4: estados que entram no mês 0 mantêm o comportamento anterior BIT A
 * BIT. Doze combinações — quatro fases × três cenários — e a diferença tem de ser
 * exatamente zero, não pequena.
 */
export function criterioDeAceiteD11({ anos, aporte }) {
  const combinacoes = [];
  for (let fase = 0; fase < FASES.length; fase++) {
    for (const [cenario, padrao] of Object.entries(CENARIOS)) {
      const mensal = motorMensal({ anos, aporte, fase, mes: 0, padrao }).saldo;
      const anual = motorAnual({ anos, aporte, fase, padrao }).saldo;
      combinacoes.push({ fase, cenario, mensal, anual, diferenca: mensal - anual });
    }
  }
  const maiorDiferenca = Math.max(...combinacoes.map((c) => Math.abs(c.diferenca)));
  return { combinacoes, maiorDiferenca, passa: maiorDiferenca === 0 };
}

// ── A GRADE DAS CINCO PARTIDAS E A DERIVA (D12 B · D13) ───────────────────
// 🔒 ÂNCORAS — mudam só por decisão registrada, com razão escrita, pelo Gate 2.
export const TETO_DERIVA = 15;                 // âncora (D12 B regra 3 · D13 regra 1)
export const VERSAO_REFERENCIA = 'v1.3';       // âncora — a referência não se move
export const CENARIO_DA_CAPA = 'Conservador';  // D12 A

export const CELULAS_DA_GRADE = PARTIDAS.length * Object.keys(CENARIOS).length;

/**
 * D12 B regra 1: toda revisão recalcula AS CINCO PARTIDAS NOS TRÊS CENÁRIOS antes de
 * publicar. Publicar só a linha afetada está proibido — por isso a grade inteira sai
 * de uma chamada só, e a tela não tem como mostrar um pedaço.
 *
 * D13 regra 1: o limite de 15% vale para CADA UMA das quinze células, medido contra
 * a v1.3, e não apenas para o piso conservador. A referência é rodada aqui pelo
 * mesmo motor, com o mapeamento da v1.3 (só fase, mês 0).
 */
export function grade({ anos, aporte }) {
  const linhas = PARTIDAS.map((partida) => {
    const celulas = Object.entries(CENARIOS).map(([cenario, padrao]) => {
      const atual = motorMensal({ anos, aporte, fase: partida.fase, mes: partida.mes, padrao }).saldo;
      const referencia = motorMensal({ anos, aporte, fase: partida.faseNaV13, mes: 0, padrao }).saldo;
      const deriva = (atual / referencia - 1) * 100;
      return { cenario, atual, referencia, deriva, estourou: deriva > TETO_DERIVA };
    });
    const aportado = motorMensal({ anos, aporte, fase: partida.fase, mes: partida.mes,
      padrao: CENARIOS[CENARIO_DA_CAPA] }).aportado;
    return { partida, rotulo: rotuloDaPartida(partida), par: rotuloDoPar(partida), aportado, celulas };
  });
  const estouradas = linhas.flatMap((l) => l.celulas.filter((c) => c.estourou));
  return {
    linhas, aportado: linhas[0].aportado,
    celulas: CELULAS_DA_GRADE, estouradas: estouradas.length,
    // D13 regra 2: estourou qualquer célula, A REVISÃO INTEIRA vai para o Gui.
    retida: estouradas.length > 0,
  };
}

/**
 * D12 A: o número de capa é o PISO — o menor resultado entre as cinco partidas, no
 * cenário conservador. Nunca a leitura do dia.
 *
 * D13 regra 4: a IDENTIDADE do piso é rastreada junto com o valor. Se a partida que
 * ocupa o piso mudar, isso é reportado mesmo que o valor não se mova — por isso a
 * saída devolve a partida, e não só o número.
 */
export function numeroDeCapa({ anos, aporte }) {
  const g = grade({ anos, aporte });
  const piso = g.linhas.reduce((menor, l) => {
    const v = l.celulas.find((c) => c.cenario === CENARIO_DA_CAPA).atual;
    return menor === null || v < menor.valor ? { valor: v, linha: l } : menor;
  }, null);
  return {
    cenario: CENARIO_DA_CAPA, valor: piso.valor, aportado: g.aportado,
    multiplicador: piso.valor / g.aportado,
    identidade: piso.linha.rotulo, par: piso.linha.par,
    // Os outros dois cenários da MESMA partida — piso é partida, não é célula solta.
    outros: piso.linha.celulas.filter((c) => c.cenario !== CENARIO_DA_CAPA)
      .map((c) => ({ cenario: c.cenario, valor: c.atual, multiplicador: c.atual / g.aportado })),
  };
}

// ── A GLIDEPATH MODULADA PELO ESTADO (D25 B · C · D) ──────────────────────
export { VELOCIDADE_POR_ESTADO, BANDA_PONTOS, TETO_DEFASAGEM, MESES_SEM_MODULACAO,
  EXPOSICAO_ALVO, ABRIGO_ATIVO_ANOS, INICIO_DA_RAMPA_ANOS, alvoDaGlidepath, bandaDoMes };

/**
 * A trajetória mês a mês da exposição REAL contra o alvo, com a velocidade modulada
 * pelo estado do mês. É o que a tela mostra no lugar de uma rampa lisa: a rampa lisa
 * é o alvo, e o que a carteira faz é o alvo mais a defasagem que a modulação criou.
 *
 * Três coisas que só aparecem aqui:
 *   · a banda de 3 pontos é tolerância de POSIÇÃO e não gera defasagem;
 *   · a defasagem tem teto de 12 pontos, e no teto o fator volta a 1,00;
 *   · nos últimos 12 meses não se modula, e a defasagem é LIQUIDADA, não perdoada.
 */
export function trajetoriaDaGlidepath({ anos, fase, mes = 0 }) {
  const total = anos * MESES_NA_FASE;
  let exposicao = alvoDaGlidepath(total);
  let defasagem = 0;
  const linhas = [];
  for (let t = 0; t < total; t++) {
    const mesesAteEntrega = total - t;
    const absoluto = fase * MESES_NA_FASE + mes + t;
    const faseCorrente = faseDoMes(fase, mes, t);
    const estado = estadoDaFase(faseCorrente, absoluto % MESES_NA_FASE);
    const d = demandaDaGlidepath({ exposicaoAtual: exposicao, mesesAteEntrega, estado, defasagem });
    if (d.erro) return { erro: d.erro };
    exposicao = arred(exposicao - d.mover, 4);
    // As duas defasagens ficam na linha, e não uma só. O fator do mês é decidido pela
    // defasagem COM QUE O MÊS COMEÇOU: o mês que leva a defasagem ao teto ainda modula,
    // porque quando ele começou ela ainda estava abaixo. É o mês seguinte que trava.
    const defasagemAntes = defasagem;
    defasagem = d.defasagemDepois;
    linhas.push({
      t, mesesAteEntrega, anosRestantes: mesesAteEntrega / MESES_NA_FASE,
      fase: faseCorrente, estado, fator: d.fator, motivo: d.motivo,
      alvo: d.alvo, exposicao, defasagemAntes, defasagem, banda: d.banda,
      distancia: d.distancia, passo: d.passo, mover: d.mover, dentroDaBanda: Boolean(d.dentroDaBanda),
      noTeto: Boolean(d.defasagemNoTeto), ultimoAno: Boolean(d.ultimoAno),
    });
  }
  const fim = linhas[linhas.length - 1];
  const ultimoAno = linhas.filter((l) => l.ultimoAno);
  return {
    linhas,
    maiorDefasagem: Math.max(...linhas.map((l) => l.defasagem)),
    mesesNoTeto: linhas.filter((l) => l.noTeto).length,
    defasagemNaEntrega: fim.defasagem,
    exposicaoNaEntrega: fim.exposicao,
    alvoNaEntrega: fim.alvo,
    bandaNaEntrega: fim.banda,
    // A folga que sobra sobre o alvo na entrega. Não é defasagem — a defasagem chega a
    // zero — e não é a banda, que já afunilou. É o que o teto do passo deixou de fora.
    folgaNaEntrega: arred(fim.exposicao - fim.alvo, 4),
    // ⚠️ MEDIDO: em quantos meses do último ano a banda chegou a DECIDIR alguma coisa.
    // Se for zero, o afunilamento da D51 A não teve onde morder, e quem segura a folga
    // é o teto `min(passo, distância)` da D25 C, não a banda.
    mesesEmQueABandaSegurou: ultimoAno.filter((l) => l.dentroDaBanda).length,
    // E em quantos a distância já era MAIOR que o passo do mês. Nesse regime o mês
    // move um passo, o alvo desce um passo, e a folga fica exatamente onde estava:
    // é `programado = min(passo, distância)` que a congela, não a banda.
    mesesTravadosNoPasso: ultimoAno.filter((l) => l.distancia > l.passo).length,
    mesesDoUltimoAno: ultimoAno.length,
  };
}

/**
 * O que a modulação da D25 CUSTARIA na projeção, se a projeção passasse a usar a
 * exposição real em vez do alvo do ano.
 *
 * ⚠️ MEDIDO, NÃO APLICADO. As quinze células publicadas — e a própria referência
 * v1.3 da tabela de deriva — foram todas calculadas com o alvo do ano. Trocar a base
 * moveria as quinze de uma vez, e a D13 regra 2 mandaria a revisão inteira para o
 * Gui. A troca é decisão dele, não do implementador (invariante 9). Enquanto não
 * houver decisão, a tela mostra a diferença e diz que ela não está aplicada.
 */
export function custoDaModulacaoNaProjecao({ anos, aporte, fase, mes = 0 }) {
  const traj = trajetoriaDaGlidepath({ anos, fase, mes });
  if (traj.erro) return { erro: traj.erro };
  return Object.entries(CENARIOS).map(([cenario, padrao]) => {
    const publicado = motorMensal({ anos, aporte, fase, mes, padrao }).saldo;
    let saldo = 0;
    for (let t = 0; t < anos * MESES_NA_FASE; t++) {
      const f = faseDoMes(fase, mes, t);
      const m = (1 + padrao[f] * (traj.linhas[t].exposicao / 100)) ** (1 / 12) - 1;
      saldo = (saldo + aporte) * (1 + m);
    }
    return { cenario, publicado, comModulacao: saldo, diferenca: (saldo / publicado - 1) * 100 };
  });
}

// ── AS ESTAÇÕES ───────────────────────────────────────────────────────────
/**
 * A estação vem do ESTADO cruzado com o tempo restante (doc 01, tabela das
 * estações · doc 02): Plantio em capitulação e prejuízo, Crescimento no mercado se
 * recuperando, Colheita no mercado saudável. O Abrigo prevalece sobre as três
 * quando está ativo, porque aí quem manda é o prazo e não o mercado.
 *
 * Não existe estação de fase: o simulador anda por fase, e a fase vira estado pela
 * leitura de trás para a frente da D11 antes de virar estação. Foi assim que o
 * `NOME` escrito à mão da versão anterior saiu da tela — ele mandava a fase 3 para
 * Plantio, quando a fase 3 é entrada de Mercado saudável, que é Colheita.
 */
export const ESTACAO_DO_ESTADO = Object.freeze({
  [ESTADOS.CAPITULACAO]: 'Plantio',
  [ESTADOS.PREJUIZO]: 'Plantio',
  [ESTADOS.ESTRESSE]: 'Crescimento',
  [ESTADOS.SAUDAVEL]: 'Colheita',
});

export const ABRIGO = 'Abrigo';

/** Estação de um mês qualquer: o Abrigo vence, e abaixo dele manda o estado. */
export function estacaoDoMes({ fase, mes = 0, t, anosRestantes }) {
  if (anosRestantes <= ABRIGO_ATIVO_ANOS) return { estacao: ABRIGO, estado: null, abrigo: true };
  const absoluto = fase * MESES_NA_FASE + mes + t;
  const estado = estadoDaFase(faseDoMes(fase, mes, t), absoluto % MESES_NA_FASE);
  return { estacao: ESTACAO_DO_ESTADO[estado] ?? null, estado, abrigo: false };
}

/** A linha do tempo ano a ano: o mês lido é o primeiro do ano civil da simulação. */
export const estacoesPorAno = ({ anos, fase, mes = 0 }) =>
  Array.from({ length: anos }, (_, ano) => ({
    ano, anosRestantes: anos - ano - 1,
    ...estacaoDoMes({ fase, mes, t: ano * MESES_NA_FASE, anosRestantes: anos - ano - 1 }),
  }));
