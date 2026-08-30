// ALOCADOR — peça 3 da implementação da Carteira Semente.
//
// PROPÕE. Não executa. Nem o aporte, nem o reforço, nem a venda (invariante 1).
// Toda saída daqui é proposta para o Gate humano assinar.
//
// Ele lê a Torre (peça 2) e o Registro (peça 1). Não guarda estado próprio: o que
// precisa durar sai como evento para o Registro gravar — e sem registro gravado o
// Reforço de Fundo não é liberado (D9 regra 5).
//
// SEM DEFAULT SILENCIOSO (invariante 3): onde a especificação não decide, este
// arquivo RECUSA e nomeia a divergência, em vez de escolher sozinho (invariante 9).

import { TIPOS } from '../registro/registro.mjs';
import { ESTADOS } from '../torre/torre.mjs';

// ── AS BASES POR ESTADO (doc 02, matriz do aporte) ────────────────────────
// Quem classifica o estado é a Linha d'Água, e só ela (D2). O Índice Semente
// entra depois, como modulação, e nunca como classificador.
export const BASES_DO_ESTADO = Object.freeze({
  'Capitulação profunda': 100,
  'Prejuízo do mercado': 90,
  'Estresse de curto prazo': 65,
  'Mercado saudável': 40,
});

/**
 * TETO E PISO ABSOLUTOS, regra 2 (doc 02): a modulação NUNCA move a decisão para o
 * patamar de um estado vizinho. Ela é mais apertada que a banda de ±20% nos dois
 * estados de cima, porque as bases 100 e 90 estão a 10 pontos e a banda é relativa.
 *
 * Onde morde, segundo o próprio documento:
 *   Capitulação profunda — banda efetiva 90 a 100, morde com Índice acima de 75
 *   Prejuízo do mercado  — banda efetiva 72 a 100, morde com Índice abaixo de 22
 *
 * O caso de cima é teórico (exigiria Índice alto com preço abaixo do custo do LTH).
 * O de baixo é real: Índice abaixo de 22 em Prejuízo é um fundo de ciclo, e ali a
 * regra 2 e o teto de 100% se encontram no mesmo lugar.
 */
const ORDEM_DOS_ESTADOS = Object.freeze([
  'Capitulação profunda', 'Prejuízo do mercado', 'Estresse de curto prazo', 'Mercado saudável',
]);

export function limitesDoPatamar(estado) {
  const i = ORDEM_DOS_ESTADOS.indexOf(estado);
  if (i < 0) return null;
  const base = BASES_DO_ESTADO[estado];
  const acima = i > 0 ? BASES_DO_ESTADO[ORDEM_DOS_ESTADOS[i - 1]] : 100;
  const abaixo = i < ORDEM_DOS_ESTADOS.length - 1 ? BASES_DO_ESTADO[ORDEM_DOS_ESTADOS[i + 1]] : 0;
  // Não pode alcançar o patamar do vizinho: fica na banda entre os dois, e a banda
  // de ±20% da fórmula ainda vale por cima disso.
  return { base, piso: Math.max(abaixo, base * 0.80), teto: Math.min(acima, base * 1.20, 100) };
}

// ── A GLIDEPATH DO ABRIGO ─────────────────────────────────────────────────
// Exposição alvo em % da carteira, por anos restantes até a entrega (doc 01 §7).
export const EXPOSICAO_ALVO = Object.freeze({ 4: 100, 3: 66, 2: 45, 1: 25, 0: 15 });

// 🔒 ÂNCORAS ESTRUTURAIS — mudam só por decisão registrada, com razão escrita,
// passando pelo Gate 2 (D27 C · D30 · D31). Vale nos dois sentidos.
export const BANDA_PONTOS = 3;          // âncora (D30) — determina a exposição da entrega
export const TETO_DEFASAGEM = 12;       // âncora — impede a assimetria de crescer sem limite
export const MESES_SEM_MODULACAO = 12;  // D25 D — o último ano não modula

// D25 B: velocidade da glidepath pelo ESTADO da Linha d'Água, não pelo Índice.
export const VELOCIDADE_POR_ESTADO = Object.freeze({
  'Mercado saudável': 1.50,
  'Estresse de curto prazo': 1.00,
  'Prejuízo do mercado': 0.50,
  'Capitulação profunda': 0.25,
});

/**
 * D43 A: o Abrigo fica ativo a partir de QUATRO anos da entrega, não três.
 *
 * A divergência que a peça 3 levantou está resolvida, e resolvida do lado da
 * aritmética: a rampa da D25 A estava certa, e as outras três fontes é que estavam
 * desalinhadas. Alinhar o início resolve os três problemas de uma vez — o teto
 * `M_efetivo = min(M,1)`, a trava 3 do Reforço e a ordem caixa → aporte → venda
 * passam todos a valer no mesmo dia em que a rampa começa a mover.
 *
 * D43 C, o preço, dito em voz alta: o Reforço de Fundo passa a ser bloqueado um ano
 * antes, e o teto do M passa a morder o quarto ano inteiro. É perda real de munição.
 * Aceito — é a invariante 6, proteção vence convicção, aplicada onde ela custa alguma
 * coisa, que é o único lugar onde invariante prova que vale.
 */
export const INICIO_DA_RAMPA_ANOS = 4;
export const ABRIGO_ATIVO_ANOS = 4;

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);
const arred = (x, casas = 4) => Number(x.toFixed(casas));

// ── MODULAÇÃO PELO ÍNDICE (D4) ────────────────────────────────────────────
/**
 * M = 1 + (50 − Índice)/50 × 0,20, com clamp em [0,80; 1,20].
 * Modula com o índice CHEIO, nunca com o exibido: arredondar antes introduz
 * degrau artificial na fronteira de cada ponto (doc 02).
 */
export function modulador(indice) {
  if (typeof indice !== 'number' || !Number.isFinite(indice)) return null;
  return clamp(1 + ((50 - indice) / 50) * 0.20, 0.80, 1.20);
}

/** Com o Abrigo ativo o teto dele prevalece: a modulação reduz, nunca eleva. */
export const mEfetivo = (indice, abrigoAtivo) => {
  const m = modulador(indice);
  return m === null ? null : (abrigoAtivo ? Math.min(m, 1) : m);
};

export const abrigoAtivo = (mesesAteEntrega) => mesesAteEntrega <= ABRIGO_ATIVO_ANOS * 12;
export const fatorDoAbrigo = (mesesAteEntrega) => alvoDaGlidepath(mesesAteEntrega) / 100;

/**
 * D25 A: alvo interpolado linearmente mês a mês entre os pontos da tabela.
 * Acima do início da rampa a carteira é cheia; na entrega, o piso.
 */
export function alvoDaGlidepath(mesesAteEntrega) {
  const anos = mesesAteEntrega / 12;
  if (anos >= INICIO_DA_RAMPA_ANOS) return EXPOSICAO_ALVO[4];
  if (anos <= 0) return EXPOSICAO_ALVO[0];
  const teto = Math.ceil(anos), piso = Math.floor(anos);
  if (teto === piso) return EXPOSICAO_ALVO[piso];
  const fracao = anos - piso;   // 0 no marco de baixo, 1 no de cima
  return arred(EXPOSICAO_ALVO[piso] + (EXPOSICAO_ALVO[teto] - EXPOSICAO_ALVO[piso]) * fracao, 4);
}

/**
 * D25 B, C e D. O fator 1,00 nos últimos doze meses não é conveniência: modular
 * pressupõe tempo para esperar o mercado virar, e no último ano não há esse tempo.
 * E com a defasagem no teto o fator volta a 1,00 mesmo em Capitulação — abaixo
 * disso a modulação deixaria de ser prudência e viraria aposta.
 */
export function fatorDeVelocidade({ estado, mesesAteEntrega, defasagem = 0 }) {
  if (mesesAteEntrega <= MESES_SEM_MODULACAO) {
    return { fator: 1.00, motivo: 'últimos doze meses não modulam (D25 D)' };
  }
  if (defasagem >= TETO_DEFASAGEM) {
    return { fator: 1.00, motivo: `defasagem no teto de ${TETO_DEFASAGEM} pontos (D25 C)` };
  }
  const fator = VELOCIDADE_POR_ESTADO[estado];
  if (fator === undefined) return { fator: null, motivo: `estado não reconhecido: ${estado}` };
  return { fator, motivo: `estado ${estado}` };
}

/**
 * A demanda da glidepath do mês. Devolve quanto mover em pontos de exposição, o
 * alvo, e a defasagem que sobra — o que a modulação deixou de mover não se perde.
 */
/** Quanto o alvo andou neste mês. É sobre ELE que a modulação incide. */
export const passoDoMes = (mesesAteEntrega) =>
  arred(alvoDaGlidepath(mesesAteEntrega + 1) - alvoDaGlidepath(mesesAteEntrega), 4);

/**
 * A demanda da glidepath do mês.
 *
 * ⚠️ A modulação incide sobre o PASSO DO MÊS, não sobre a distância acumulada até o
 * alvo. Foi a tabela da D25 C que fixou isso: "Capitulação 0,25 → acumula 1,31 pt"
 * só fecha com 1,75 × 0,75, e 1,75 é o passo mensal do trecho 3→2 anos. Modular a
 * distância inteira contaria a defasagem duas vezes — ela já é, por definição, o que
 * a modulação deixou de mover.
 *
 * A banda de 3 pontos é tolerância de POSIÇÃO, e não suspende o cronograma: dentro
 * dela não se move nada, e a defasagem também não cresce, porque a defasagem é o que
 * a modulação deixou de mover, não o que a banda deixou de mover.
 */
export function demandaDaGlidepath({ exposicaoAtual, mesesAteEntrega, estado, defasagem = 0 }) {
  const alvo = alvoDaGlidepath(mesesAteEntrega);
  const distancia = arred(exposicaoAtual - alvo, 4);   // positivo = exposto demais
  const { fator, motivo } = fatorDeVelocidade({ estado, mesesAteEntrega, defasagem });
  if (fator === null) return { erro: motivo };

  const ultimoAno = mesesAteEntrega <= MESES_SEM_MODULACAO;
  const passo = passoDoMes(mesesAteEntrega);

  // Banda de 3 pontos: sem ela o sistema venderia todo mês por ruído (âncora, D30).
  if (Math.abs(distancia) <= BANDA_PONTOS && defasagem === 0) {
    return { alvo, distancia, dentroDaBanda: true, mover: 0, passo, fator, motivo,
      defasagemDepois: 0, defasagemNoTeto: false, liquidacaoDeDefasagem: 0, ultimoAno };
  }

  // O que a modulação move deste mês, e o que ela deixa de mover.
  const programado = Math.max(Math.min(passo, distancia), 0);
  const movidoPeloFator = arred(programado * Math.min(fator, 1), 4);
  const naoMovido = arred(programado - movidoPeloFator, 4);
  // D25 C: o fator 1,50 recupera defasagem ANTES de seguir o alvo corrente.
  const aRecuperar = fator > 1 ? arred(Math.min(defasagem, (fator - 1) * programado), 4) : 0;

  // D25 D: nos últimos doze meses a defasagem é LIQUIDADA, não perdoada — trabalhada
  // até zero dentro do período. Perdoar deixaria a entrega com até 12 pontos a mais
  // de exposição que o alvo, que é o risco que o Abrigo existe para evitar.
  const liquidacao = ultimoAno ? arred(defasagem / Math.max(mesesAteEntrega, 1), 4) : 0;

  const defasagemDepois = ultimoAno
    ? arred(Math.max(defasagem - liquidacao, 0), 4)
    : arred(clamp(defasagem + naoMovido - aRecuperar, 0, TETO_DEFASAGEM), 4);

  return {
    alvo, distancia, dentroDaBanda: false, passo, fator, motivo,
    mover: arred(movidoPeloFator + aRecuperar + liquidacao, 4),
    naoMovido, recuperado: aRecuperar, liquidacaoDeDefasagem: liquidacao,
    defasagemDepois, defasagemNoTeto: defasagemDepois >= TETO_DEFASAGEM, ultimoAno,
  };
}

// ── PRECEDÊNCIA (D26) E ORDEM DE RECURSOS (D27) ───────────────────────────
/**
 * A ordem de destinação, sempre e por regra:
 *   1. a defesa, até fechar a demanda da glidepath do mês;
 *   2. o que sobrar segue o Índice de Plantio;
 *   3. sobrando ainda, o excedente vai para a parte protegida — e com o Abrigo
 *      ativo o caixa NÃO recebe mais (D27).
 *
 * E o recurso vem em ordem: caixa → aporte → venda. Em todo mês em que o caixa
 * cobre a demanda, a venda é zero e o aporte nem é tocado.
 *
 * "Proteção vence convicção" é invariante, e invariante não pode depender de dois
 * fatores calibrados calharem de se alinhar: aqui é a alocação que cede, sempre.
 */
export function destinacaoDoAporte({
  aporte, carteira, caixa = 0, exposicaoAtual, mesesAteEntrega, estado, indice, defasagem = 0,
}) {
  const emAbrigo = abrigoAtivo(mesesAteEntrega);
  const demanda = demandaDaGlidepath({ exposicaoAtual, mesesAteEntrega, estado, defasagem });
  if (demanda.erro) return { erro: demanda.erro };

  // A demanda vem em pontos de exposição; vira dinheiro contra o tamanho da carteira.
  const demandaEmDinheiro = arred((demanda.mover / 100) * carteira, 2);

  // Ordem de recursos. O caixa é o primeiro recurso da glidepath a partir do momento
  // em que o Abrigo começa (D27). Depois da D43 esse momento é o MESMO em que a rampa
  // começa a mover — não há mais janela com demanda e caixa fechado.
  const caixaDisponivel = emAbrigo ? caixa : 0;
  const doCaixa = Math.min(caixaDisponivel, demandaEmDinheiro);
  const restanteAposCaixa = arred(demandaEmDinheiro - doCaixa, 2);
  const doAporte = Math.min(aporte, restanteAposCaixa);
  const porVenda = arred(restanteAposCaixa - doAporte, 2);

  const sobra = arred(aporte - doAporte, 2);
  const m = mEfetivo(indice, emAbrigo);
  const base = BASES_DO_ESTADO[estado];
  if (base === undefined) return { erro: `estado sem base definida: ${estado}` };

  // O Índice de Plantio só decide o que sobrou depois da defesa.
  // Regra 2 ANTES do fator do Abrigo: "patamar de estado vizinho" é conceito sobre
  // as bases, e o Abrigo escala tudo para baixo depois. Regra 3: o teto do Abrigo
  // prevalece, e por isso ele é o último a ser aplicado.
  const lim = limitesDoPatamar(estado);
  const semAbrigo = m === null ? null : clamp(base * m, lim.piso, lim.teto);
  const percentual = semAbrigo === null ? null
    : clamp(semAbrigo * fatorDoAbrigo(mesesAteEntrega), 0, 100);
  const paraOAtivo = percentual === null ? null : arred((percentual / 100) * sobra, 2);
  const excedente = paraOAtivo === null ? null : arred(sobra - paraOAtivo, 2);

  return {
    emAbrigo,
    glidepath: demanda,
    defesa: {
      demandaEmPontos: demanda.mover, demandaEmDinheiro,
      doCaixa: arred(doCaixa, 2), doAporte: arred(doAporte, 2), porVenda,
      // D27: em todo mês em que o caixa cobre a demanda, a venda é zero.
      vendaZeradaPeloCaixa: doCaixa > 0 && porVenda === 0 && doAporte === 0,
    },
    plantio: {
      base, fatorDoAbrigo: arred(fatorDoAbrigo(mesesAteEntrega), 4), m: m === null ? null : arred(m, 5),
      patamar: lim, mordeuARegra2: semAbrigo !== null && arred(semAbrigo, 4) !== arred(clamp(base * m, 0, 100), 4),
      percentual: percentual === null ? null : arred(percentual, 4),
      sobreOAporte: sobra, paraOAtivo,
      // A frase é da própria decisão, e é assim que a leitura tem de dizer.
      nota: sobra === 0 ? 'aporte integralmente destinado à proteção' : null,
    },
    // D27: com o Abrigo ativo o excedente vai para a parte protegida, não para o caixa.
    excedente: { valor: excedente, destino: emAbrigo ? 'parte protegida' : 'caixa' },
  };
}

// ── FLUXO 2 · REFORÇO DE FUNDO — AS SETE TRAVAS (D6 · D9 · D31) ───────────
export const ESTADOS_DO_REFORCO = Object.freeze(['Capitulação profunda', 'Prejuízo do mercado']);
export const INDICE_MAXIMO_REFORCO = 30;
export const FATIA_DO_CAIXA = 0.25;
export const ACIONAMENTOS_POR_CICLO = 3;
export const ESPACAMENTO_DIAS = 30;
export const PISO_DO_CAIXA = 0.10;      // 🔒 âncora estrutural (D31)

/**
 * As sete travas são TODAS obrigatórias: qualquer uma que falhe BLOQUEIA. A saída
 * lista as sete uma a uma, passe ou não — o Auditor confere cada uma, e uma lista
 * que só mostra as que falharam não é conferível.
 */
export function reforcoDeFundo({ estado, indice, mesesAteEntrega, caixa, carteira, ciclo, hoje }) {
  const travas = [
    { n: 1, o: 'estado de fundo', passa: ESTADOS_DO_REFORCO.includes(estado),
      leitura: estado },
    { n: 2, o: `Índice ≤ ${INDICE_MAXIMO_REFORCO}`, passa: typeof indice === 'number' && indice <= INDICE_MAXIMO_REFORCO,
      leitura: indice },
    { n: 3, o: `mais de ${ABRIGO_ATIVO_ANOS} anos até a entrega`, passa: !abrigoAtivo(mesesAteEntrega),
      leitura: `${mesesAteEntrega} meses` },
    { n: 4, o: `no máximo ${FATIA_DO_CAIXA * 100}% do caixa`, passa: true,
      leitura: `libera ${arred(caixa * FATIA_DO_CAIXA, 2)}` },
    { n: 5, o: `no máximo ${ACIONAMENTOS_POR_CICLO} por ciclo, espaçados ${ESPACAMENTO_DIAS} dias`,
      passa: Boolean(ciclo) && ciclo.acionamentos < ACIONAMENTOS_POR_CICLO
        && (ciclo.ultimoAcionamento === null || diasEntre(ciclo.ultimoAcionamento, hoje) >= ESPACAMENTO_DIAS),
      leitura: ciclo ? `${ciclo.acionamentos} acionamentos · último ${ciclo.ultimoAcionamento ?? 'nenhum'}` : 'SEM REGISTRO' },
    { n: 6, o: `caixa nunca abaixo de ${PISO_DO_CAIXA * 100}% da carteira`,
      passa: arred(caixa - caixa * FATIA_DO_CAIXA, 2) >= arred(carteira * PISO_DO_CAIXA, 2),
      leitura: `caixa ficaria em ${arred(caixa - caixa * FATIA_DO_CAIXA, 2)}, piso é ${arred(carteira * PISO_DO_CAIXA, 2)}` },
    { n: 7, o: 'Gate humano como decisão própria, separada do aporte', passa: false,
      leitura: 'só o Gui assina — nunca passa aqui' },
  ];

  // D9 regra 5: sem registro gravado, o reforço não é liberado. Não é uma trava
  // entre outras — é a condição de existir a leitura da trava 5.
  const semRegistro = !ciclo;
  const bloqueiam = travas.filter((t) => t.n !== 7 && !t.passa);

  return {
    // Nunca "liberado": a trava 7 é o Gate, e ela não passa por código nenhum.
    situacao: semRegistro ? 'bloqueado — sem registro gravado'
      : bloqueiam.length ? 'bloqueado' : 'condições reunidas — vai ao Gate como decisão própria',
    travas,
    bloqueiam: bloqueiam.map((t) => t.n),
    valorProposto: bloqueiam.length || semRegistro ? null : arred(caixa * FATIA_DO_CAIXA, 2),
    separadoDoAporte: true,
    registroDoCiclo: ciclo ?? null,
  };
}

const DIA_MS = 86400000;
const diasEntre = (de, ate) => Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_MS);

// ── OS TRÊS DEGRAUS DO TETO DE 8% (doc 01) ────────────────────────────────
export const TETO_POR_ATIVO = 8;        // 🔒 âncora de par com os 12% (D30)
export const GATILHO_DE_VENDA = 12;     // 🔒 âncora de par com os 8%
export const PISO_POR_POSICAO = 2;      // 🔒 âncora estrutural
export const PISO_BTC_ETH = 60;         // 🔒 âncora estrutural
export const ANCORAS_DE_TESE = Object.freeze(['BTC', 'ETH']);

/**
 * Os tetos são medidos sobre a parte EXPOSTA, nunca sobre a carteira inteira
 * (checklist 21 do Auditor). BTC e ETH têm piso e não teto.
 */
export function degrauDoAtivo(ativo, pesoNaParteExposta) {
  if (ANCORAS_DE_TESE.includes(ativo)) return { degrau: 0, acao: 'sem teto — BTC e ETH têm piso' };
  if (pesoNaParteExposta > GATILHO_DE_VENDA) {
    return { degrau: 3, acao: `venda parcial de volta para ${TETO_POR_ATIVO}%`,
      // Gatilho automático, execução pelo Gate: o sistema monta a ordem, o Gui assina.
      viaGate: true, venderPontos: arred(pesoNaParteExposta - TETO_POR_ATIVO, 4) };
  }
  if (pesoNaParteExposta > TETO_POR_ATIVO) {
    return { degrau: 2, acao: 'para de receber aporte novo; o que iria para ele se redistribui' };
  }
  return { degrau: 1, acao: 'normal' };
}

export const GATILHOS_DE_VENDA = Object.freeze([
  { n: 1, gatilho: `estouro acima de ${GATILHO_DE_VENDA}% do teto por ativo`, origem: 'teto de concentração' },
  { n: 2, gatilho: `queda abaixo de ${PISO_POR_POSICAO}% do piso de posição`, origem: 'piso de posição' },
  { n: 3, gatilho: 'realização programada da glidepath', origem: 'calendário e tabela do Abrigo' },
]);

/** Ordem de venda quando o fluxo não cobre: fora de BTC e ETH primeiro, do menor peso ao maior. */
export function ordemDeVenda(posicoes) {
  const fora = posicoes.filter((p) => !ANCORAS_DE_TESE.includes(p.ativo)).sort((a, b) => a.peso - b.peso);
  const ancoras = posicoes.filter((p) => ANCORAS_DE_TESE.includes(p.ativo)).sort((a, b) => a.peso - b.peso);
  return [...fora, ...ancoras].map((p) => p.ativo);
}

// ── A PROPOSTA ────────────────────────────────────────────────────────────
/**
 * A saída do Alocador. PROPÕE — o Gate assina. Se as condições do Reforço
 * estiverem reunidas, ele vai SEPARADO, como segunda proposta, com o registro do
 * ciclo junto (doc 02).
 */
export function propor({ leitura, carteira, registro, hoje }) {
  if (!leitura?.disponivel) {
    return { proposta: null, motivo: 'leitura indisponível — sem estado não há proposta',
      detalhe: leitura?.motivo ?? null };
  }
  const { estado, indice } = leitura;
  const ciclo = registro?.cicloReforco?.(carteira.id) ?? null;
  const defasagem = registro?.defasagemAcumulada?.(carteira.id) ?? 0;

  const fluxo1 = destinacaoDoAporte({
    aporte: carteira.aporte, carteira: carteira.total, caixa: carteira.caixa,
    exposicaoAtual: carteira.exposicao, mesesAteEntrega: carteira.mesesAteEntrega,
    estado, indice, defasagem,
  });
  if (fluxo1.erro) return { proposta: null, motivo: fluxo1.erro };

  const fluxo2 = reforcoDeFundo({
    estado, indice, mesesAteEntrega: carteira.mesesAteEntrega,
    caixa: carteira.caixa, carteira: carteira.total, ciclo, hoje,
  });

  const excessos = (carteira.posicoes ?? [])
    .map((p) => ({ ativo: p.ativo, peso: p.peso, ...degrauDoAtivo(p.ativo, p.peso) }))
    .filter((d) => d.degrau >= 2);

  return {
    hoje, carteira: carteira.id, estado, indice,
    // Os dois fluxos são separados e NÃO se misturam (doc 02).
    aporteDoMes: fluxo1,
    reforcoDeFundo: fluxo2,
    concentracao: { excessos, ordemDeVendaSeNecessario: ordemDeVenda(carteira.posicoes ?? []) },
    // A Torre não classifica estação e o Alocador não executa: as duas invariantes
    // ficam ditas na saída, não só no comentário.
    limite: 'PROPÕE — não executa. Nem o aporte, nem o reforço, nem a venda. Quem assina é o Gui.',
  };
}

/** O evento que a peça 1 grava quando o Gate assina o reforço. A peça 3 não grava. */
export const eventoDeReforco = (carteira, proposta) => ({
  tipo: TIPOS.REFORCO_ACIONADO, carteira, data: proposta.hoje,
  indice: proposta.indice, estado: proposta.estado,
  valor: proposta.reforcoDeFundo.valorProposto,
});

export const ESTADOS_CONHECIDOS = Object.freeze(Object.keys(ESTADOS).map((k) => ESTADOS[k]));
