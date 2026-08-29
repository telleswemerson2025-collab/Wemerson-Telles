// REGISTRO DO ALOCADOR — peça 1 da implementação da Carteira Semente.
//
// Guarda as quatro coisas duráveis que as decisões exigem, em log append-only:
//   1. ciclo do Reforço de Fundo      (D6, D9)
//   2. última composição da CRM lida  (D16 B)
//   3. histórico de degraus           (D16 D, D17, D18)
//   4. tranches e defasagem da glidepath (D24 B, D25 C)
//
// Duas invariantes governam este arquivo inteiro:
//   · NUNCA SOBRESCREVE (D18 D) — só existe acrescentar. Não há update nem delete.
//   · SEM DEFAULT SILENCIOSO (invariante 3) — o que falta é reportado como ausente,
//     nunca preenchido por suposição. Toda derivação devolve o motivo junto do valor.
//
// Este módulo NÃO calcula Índice, alocação, alvo de glidepath nem modulação:
// isso é peça 2 e peça 3. Aqui só se grava e se deriva do que está gravado.

export const TIPOS = Object.freeze({
  LEITURA: 'leitura',                 // {data, indice, estado}
  REFORCO_ACIONADO: 'reforco_acionado', // {data, indice, pctCaixa}
  CONTADOR_RESET: 'contador_reset',   // {data, marco: 'virada'|'abrigo'}
  CRM_COMPOSICAO: 'crm_composicao',   // {data, legivel, ativos[]}
  DEGRAU: 'degrau',                   // {data, ativo, valor, motivo}
  TRANCHE: 'tranche',                 // {data, ativo, quantidade, exposicaoAntes, exposicaoDepois}
  DEFASAGEM: 'defasagem',             // {data, pontosNaoMovidos, fator, estado}
});

export const DEGRAUS_VALIDOS = Object.freeze([0, 33, 66, 100]);
export const VALIDADE_DIAS = 180;      // âncora estrutural (D18, D28)
export const MARCO_INDICE = 65;        // D9
export const MARCO_DIAS = 30;          // D9
export const ANCORAS_DE_TESE = Object.freeze(['BTC', 'ETH']); // D21 B

const DIA_MS = 86400000;

const dia = (d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / DIA_MS);
const ehData = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(dia(d));
const naoVazio = (s) => typeof s === 'string' && s.trim().length > 0;

/** Erro de validação: o registro recusa o evento em vez de gravar algo malformado. */
export class RegistroInvalido extends Error {}

function valida(ev) {
  if (!naoVazio(ev?.carteira)) throw new RegistroInvalido('evento sem carteira');
  if (!Object.values(TIPOS).includes(ev?.tipo)) throw new RegistroInvalido(`tipo desconhecido: ${ev?.tipo}`);
  if (!ehData(ev?.data)) throw new RegistroInvalido('data ausente ou fora do formato AAAA-MM-DD');

  switch (ev.tipo) {
    case TIPOS.LEITURA:
      if (typeof ev.indice !== 'number' || !Number.isFinite(ev.indice)) throw new RegistroInvalido('leitura sem índice numérico');
      if (!naoVazio(ev.estado)) throw new RegistroInvalido('leitura sem estado da Linha dágua');
      break;
    case TIPOS.REFORCO_ACIONADO:
      if (typeof ev.indice !== 'number') throw new RegistroInvalido('acionamento sem índice');
      if (typeof ev.pctCaixa !== 'number') throw new RegistroInvalido('acionamento sem percentual do caixa');
      break;
    case TIPOS.CONTADOR_RESET:
      if (!['virada', 'abrigo'].includes(ev.marco)) throw new RegistroInvalido('reset sem marco válido');
      break;
    case TIPOS.CRM_COMPOSICAO:
      if (typeof ev.legivel !== 'boolean') throw new RegistroInvalido('composição sem indicação de legibilidade');
      if (ev.legivel && !Array.isArray(ev.ativos)) throw new RegistroInvalido('composição legível sem lista de ativos');
      break;
    case TIPOS.DEGRAU:
      if (!naoVazio(ev.ativo)) throw new RegistroInvalido('degrau sem ativo');
      if (!DEGRAUS_VALIDOS.includes(ev.valor)) throw new RegistroInvalido(`degrau fora da escala ordinal: ${ev.valor}`);
      // D18 C: reatribuição é sempre ato novo, com motivo escrito. Sem motivo não é ato.
      if (!naoVazio(ev.motivo)) throw new RegistroInvalido('degrau sem motivo escrito (D18 C)');
      break;
    case TIPOS.TRANCHE:
      if (!naoVazio(ev.ativo)) throw new RegistroInvalido('tranche sem ativo');
      for (const campo of ['quantidade', 'exposicaoAntes', 'exposicaoDepois']) {
        if (typeof ev[campo] !== 'number') throw new RegistroInvalido(`tranche sem ${campo}`);
      }
      break;
    case TIPOS.DEFASAGEM:
      if (typeof ev.pontosNaoMovidos !== 'number') throw new RegistroInvalido('defasagem sem pontos');
      if (typeof ev.fator !== 'number') throw new RegistroInvalido('defasagem sem fator do estado');
      break;
  }
}

/** Resultado de derivação que pode faltar. Nunca devolve valor inventado. */
const ausente = (motivo) => ({ disponivel: false, motivo });
const presente = (valor) => ({ disponivel: true, ...valor });

export class Registro {
  #adaptador;
  #eventos;

  constructor(adaptador) {
    this.#adaptador = adaptador;
    this.#eventos = adaptador.ler();
  }

  /** Acrescenta um evento. É a única forma de escrita que existe. */
  registrar(evento) {
    valida(evento);
    const gravado = Object.freeze({
      ...evento,
      seq: this.#eventos.length + 1,
      gravadoEm: new Date().toISOString(),
    });
    this.#eventos = [...this.#eventos, gravado];
    this.#adaptador.gravar(this.#eventos);
    return gravado;
  }

  eventos({ carteira, tipo } = {}) {
    return this.#eventos.filter((e) =>
      (carteira === undefined || e.carteira === carteira) &&
      (tipo === undefined || e.tipo === tipo));
  }

  #porData(carteira, tipo) {
    return this.eventos({ carteira, tipo }).slice().sort((a, b) =>
      a.data < b.data ? -1 : a.data > b.data ? 1 : a.seq - b.seq);
  }

  // ── 1 · CICLO DO REFORÇO DE FUNDO ────────────────────────────────────────
  // D9: contador por carteira; zera no dia em que o marco se completa, e também
  // na entrada em Abrigo. Sem registro gravado, o reforço não é liberado.

  cicloReforco(carteira) {
    const resets = this.#porData(carteira, TIPOS.CONTADOR_RESET);
    const ultimoReset = resets.at(-1) ?? null;
    const desde = ultimoReset?.data ?? null;
    const acionamentos = this.#porData(carteira, TIPOS.REFORCO_ACIONADO)
      .filter((a) => desde === null || a.data > desde);
    return {
      desde,                                  // null = primeiro ciclo, desde a abertura da carteira
      marcoDoReset: ultimoReset?.marco ?? null,
      acionamentos,
      contador: acionamentos.length,
      ultimoAcionamento: acionamentos.at(-1)?.data ?? null,
    };
  }

  /**
   * D9: "30 dias corridos consecutivos" é literal — um único fechamento abaixo de 65
   * recomeça a contagem do zero. Dia sem leitura também interrompe: pela invariante 3
   * não se pode presumir que o dia ausente fechou acima de 65.
   */
  diasConsecutivosNoMarco(carteira, hoje) {
    const leituras = this.#porData(carteira, TIPOS.LEITURA);
    if (leituras.length === 0) return ausente('nenhuma leitura registrada');

    let inicio = null, anterior = null;
    for (const l of leituras) {
      const rompeu = l.indice < MARCO_INDICE;
      const pulouDia = anterior !== null && dia(l.data) !== dia(anterior) + 1;
      if (rompeu || pulouDia) inicio = rompeu ? null : l.data;
      else if (inicio === null) inicio = l.data;
      anterior = l.data;
    }

    const ultima = leituras.at(-1);
    if (hoje !== undefined && ehData(hoje) && dia(hoje) > dia(ultima.data)) {
      return ausente(`última leitura em ${ultima.data}; sem leitura de ${hoje}`);
    }
    if (inicio === null) return presente({ dias: 0, desde: null, completo: false });

    const dias = dia(ultima.data) - dia(inicio) + 1;
    return presente({ dias, desde: inicio, completo: dias >= MARCO_DIAS });
  }

  /**
   * D9 regra 5: o reset tem de ser GRAVADO. Este método não o cria sozinho — aponta
   * que ele está devido, para que quem grava o grave. Registro não deriva o que a
   * decisão manda gravar.
   */
  marcoPendenteDeRegistro(carteira, hoje) {
    const contagem = this.diasConsecutivosNoMarco(carteira, hoje);
    if (!contagem.disponivel || !contagem.completo) return null;
    const ciclo = this.cicloReforco(carteira);
    const fim = this.#porData(carteira, TIPOS.LEITURA).at(-1).data;
    if (ciclo.desde !== null && ciclo.desde >= fim) return null; // já registrado
    return { marco: 'virada', desde: contagem.desde, completoEm: fim };
  }

  // ── 2 · ÚLTIMA COMPOSIÇÃO DA CRM ─────────────────────────────────────────
  // D16 B: composição ilegível congela o universo no último estado conhecido,
  // marcado como desatualizado desde tal data. Nunca se presume que não mudou.

  composicaoCRM(carteira) {
    const leituras = this.#porData(carteira, TIPOS.CRM_COMPOSICAO);
    if (leituras.length === 0) return ausente('nenhuma composição da CRM registrada');

    const ultima = leituras.at(-1);
    if (ultima.legivel) {
      return presente({ ativos: ultima.ativos, lidaEm: ultima.data, congelada: false });
    }
    const ultimaLegivel = leituras.filter((l) => l.legivel).at(-1);
    if (!ultimaLegivel) return ausente(`composição ilegível desde ${ultima.data}, e nunca houve leitura legível`);
    return presente({
      ativos: ultimaLegivel.ativos,
      lidaEm: ultimaLegivel.data,
      congelada: true,
      desatualizadaDesde: ultimaLegivel.data,
    });
  }

  // ── 3 · HISTÓRICO DE DEGRAUS ─────────────────────────────────────────────
  // D18 A: validade de 180 dias; vencido vira ausência, não 0 e não valor herdado.
  // D18 D: série completa por ativo, nunca sobrescrita.

  historicoDegraus(carteira, ativo) {
    return this.#porData(carteira, TIPOS.DEGRAU).filter((d) => ativo === undefined || d.ativo === ativo);
  }

  degraus(carteira, hoje) {
    if (!ehData(hoje)) throw new RegistroInvalido('degraus() exige a data de hoje');
    const porAtivo = new Map();
    for (const d of this.#porData(carteira, TIPOS.DEGRAU)) porAtivo.set(d.ativo, d);

    const saida = new Map();
    for (const [ativo, d] of porAtivo) {
      const idade = dia(hoje) - dia(d.data);
      saida.set(ativo, idade > VALIDADE_DIAS
        ? { status: 'vencido', valor: null, atribuidoEm: d.data, idade, motivo: d.motivo }
        : { status: 'vigente', valor: d.valor, atribuidoEm: d.data, idade, motivo: d.motivo });
    }
    return saida;
  }

  /** D18 B: aviso aos 150 dias — diário para BTC e ETH, semanal para os demais. */
  degrausAVencer(carteira, hoje) {
    const avisar = VALIDADE_DIAS - 30;
    const fora = [];
    for (const [ativo, d] of this.degraus(carteira, hoje)) {
      if (d.status !== 'vigente' || d.idade < avisar) continue;
      const ancora = ANCORAS_DE_TESE.includes(ativo);
      const devido = ancora || (d.idade - avisar) % 7 === 0;
      if (devido) fora.push({ ativo, ancora, idade: d.idade, venceEm: VALIDADE_DIAS - d.idade, cadencia: ancora ? 'diária' : 'semanal' });
    }
    return fora;
  }

  /**
   * D21 B: degrau de BTC ou ETH vencido — ou nunca atribuído — não vira ausência.
   * A camada 5 é suspensa por inteiro, nomeada e com data. Não depende de pesos,
   * por isso mora aqui e não no Alocador.
   */
  suspensaoDaCamada5(carteira, hoje) {
    const atuais = this.degraus(carteira, hoje);
    for (const ativo of ANCORAS_DE_TESE) {
      const d = atuais.get(ativo);
      if (!d) return { suspensa: true, ativo, razao: 'nunca atribuído', desde: null };
      if (d.status === 'vencido') return { suspensa: true, ativo, razao: 'tese vencida', desde: d.atribuidoEm };
    }
    return { suspensa: false };
  }

  /** D17 D: a etiqueta de julgamento — as três informações, ou não se publica. */
  etiquetaDeJulgamento(carteira, hoje) {
    const atuais = this.degraus(carteira, hoje);
    const vigentes = [...atuais.values()].filter((d) => d.status === 'vigente');
    if (vigentes.length === 0) return ausente('nenhum degrau vigente');
    const maisAntigo = vigentes.reduce((a, b) => (a.idade >= b.idade ? a : b));
    return presente({
      carregaJulgamentoHumano: true,
      degrauMaisAntigoEm: maisAntigo.atribuidoEm,
      idadeDoMaisAntigo: maisAntigo.idade,
      ativosSemDegrau: [...atuais.values()].filter((d) => d.status === 'vencido').length,
    });
  }

  // ── 4 · TRANCHES E DEFASAGEM DA GLIDEPATH ────────────────────────────────
  // D24 B: cada tranche com data, ativo, quantidade e exposição antes e depois.
  // D25 C: a defasagem não se perde — fica registrada e é recuperada depois.

  tranches(carteira) {
    return this.#porData(carteira, TIPOS.TRANCHE);
  }

  defasagemAcumulada(carteira) {
    const eventos = this.#porData(carteira, TIPOS.DEFASAGEM);
    const pontos = eventos.reduce((s, e) => s + e.pontosNaoMovidos, 0);
    return { pontos: Number(pontos.toFixed(6)), eventos };
  }
}

// ── ADAPTADORES ────────────────────────────────────────────────────────────
// O log é append-only por contrato; o adaptador só persiste a lista inteira.

export class AdaptadorMemoria {
  #eventos = [];
  ler() { return this.#eventos.slice(); }
  gravar(eventos) { this.#eventos = eventos.slice(); }
}

export class AdaptadorLocalStorage {
  constructor(chave = 'carteira-semente:registro', armazem = globalThis.localStorage) {
    this.chave = chave; this.armazem = armazem;
  }
  ler() {
    try { return JSON.parse(this.armazem.getItem(this.chave) ?? '[]'); }
    catch { return []; }
  }
  gravar(eventos) { this.armazem.setItem(this.chave, JSON.stringify(eventos)); }
}

export function adaptadorArquivo(caminho, fs) {
  return {
    ler() {
      try { return JSON.parse(fs.readFileSync(caminho, 'utf8')); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
    gravar(eventos) { fs.writeFileSync(caminho, JSON.stringify(eventos, null, 2)); },
  };
}
