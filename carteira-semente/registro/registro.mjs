// REGISTRO DO ALOCADOR — peça 1 da implementação da Carteira Semente.
//
// Guarda as quatro coisas duráveis que as decisões exigem, em log append-only:
//   1. ciclo do Reforço de Fundo      (D6, D9)
//   2. última composição da CRM lida  (D16 B)
//   3. histórico de degraus           (D16 D, D17, D18)
//   4. tranches e defasagem da glidepath (D24 B, D25 C)
//   5. "invalidar" do Gate na vaga bloqueada (D23 B)
//   6. resultado do Filtro de Horizonte, com o motivo (D16 B)
//   7. exclusão por teto de contagem, com o motivo (D22 C)
//
// Correção de fato gravado existe, e é evento próprio (D33 B): a retificação
// acrescenta, aponta para a original, e as duas versões ficam no log para sempre.
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
  GATE_INVALIDAR: 'gate_invalidar',   // {data, ativo, motivo}
  FILTRO_HORIZONTE: 'filtro_horizonte', // {data, ativo, aprovado, motivo}
  TETO_CONTAGEM: 'teto_contagem',     // {data, ativo, posicao}
  RETIFICACAO: 'retificacao',         // {data, dataRetificada, campo, valorAntigo, valorNovo, motivo, aprovadoEm}
  ANULACAO_MARCO: 'anulacao_marco',   // {data, marcoSeq, retificacaoSeq, motivo}
});

// D22 C: excluído por contagem volta sozinho se subir de posição; reprovado no
// filtro não volta sem reexame. São dois TIPOS de evento, nunca um só com motivo
// livre — a diferença tem de sobreviver a quem ler o log daqui a dez anos.

export const DEGRAUS_VALIDOS = Object.freeze([0, 33, 66, 100]);
export const VALIDADE_DIAS = 180;      // âncora estrutural (D18, D28)
export const MARCO_INDICE = 65;        // D9
export const MARCO_DIAS = 30;          // D9
export const ANCORAS_DE_TESE = Object.freeze(['BTC', 'ETH']); // D21 B
export const RECUPERACAO_DIAS = 30;    // D32 A — janela para gravar leitura retroativa

const DIA_MS = 86400000;

const dia = (d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / DIA_MS);
const ehData = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(dia(d));
const naoVazio = (s) => typeof s === 'string' && s.trim().length > 0;

/** Lê e escreve campo por caminho pontuado: 'indice', 'estado', 'indicadores.MVRV'. */
const leCampo = (obj, caminho) => caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const comCampo = (obj, caminho, valor) => {
  const [chave, ...resto] = caminho.split('.');
  return { ...obj, [chave]: resto.length === 0 ? valor : comCampo(obj[chave] ?? {}, resto.join('.'), valor) };
};

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
      if (ev.indicadores !== undefined && (typeof ev.indicadores !== 'object' || ev.indicadores === null)) {
        throw new RegistroInvalido('indicadores da varredura têm de vir como objeto');
      }
      // D32 A: leitura retroativa carrega a data em que foi coletada, e só vale
      // dentro de 30 dias da data faltante. Passado isso o dia fica ausente em
      // definitivo — o dado onchain não se perde, mas a janela de recompor fecha.
      if (ev.retroativa) {
        if (!ehData(ev.coletadaEm)) throw new RegistroInvalido('leitura retroativa sem data de coleta');
        const atraso = dia(ev.coletadaEm) - dia(ev.data);
        if (atraso < 0) throw new RegistroInvalido('coleta anterior à data da leitura');
        if (atraso > RECUPERACAO_DIAS) {
          throw new RegistroInvalido(`recuperação fora da janela: ${atraso} dias depois de ${ev.data}, o limite é ${RECUPERACAO_DIAS}`);
        }
      }
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
    case TIPOS.GATE_INVALIDAR:
      if (!naoVazio(ev.ativo)) throw new RegistroInvalido('invalidação sem ativo');
      if (!naoVazio(ev.motivo)) throw new RegistroInvalido('invalidação sem motivo escrito (D23 B)');
      break;
    case TIPOS.FILTRO_HORIZONTE:
      if (!naoVazio(ev.ativo)) throw new RegistroInvalido('filtro sem ativo');
      if (typeof ev.aprovado !== 'boolean') throw new RegistroInvalido('filtro sem veredito');
      if (!naoVazio(ev.motivo)) throw new RegistroInvalido('filtro sem motivo escrito (D16 B)');
      break;
    case TIPOS.TETO_CONTAGEM:
      if (!naoVazio(ev.ativo)) throw new RegistroInvalido('exclusão por contagem sem ativo');
      if (typeof ev.posicao !== 'number') throw new RegistroInvalido('exclusão por contagem sem a posição do ativo');
      break;
    case TIPOS.RETIFICACAO:
      // D33 B: os quatro obrigatórios. O Gate é o que separa retificação de
      // reescrita de história — sem ele o append-only vira formalidade.
      if (!ehData(ev.dataRetificada)) throw new RegistroInvalido('retificação sem a data da leitura retificada');
      // D34 B: a retificação cobre a leitura inteira — índice, estado da Linha d'Água
      // e qualquer indicador da varredura. Uma por campo, nunca uma que mexe em
      // vários de uma vez, para a cadeia continuar legível campo a campo.
      if (!naoVazio(ev.campo)) throw new RegistroInvalido('retificação sem o campo retificado (D34 B)');
      if (ev.valorAntigo === undefined) throw new RegistroInvalido('retificação sem o valor antigo');
      if (ev.valorNovo === undefined) throw new RegistroInvalido('retificação sem o valor novo');
      if (typeof ev.valorAntigo !== typeof ev.valorNovo) {
        throw new RegistroInvalido('retificação com valor antigo e novo de tipos diferentes');
      }
      if (!naoVazio(ev.motivo)) throw new RegistroInvalido('retificação sem motivo escrito (D33 B)');
      if (!ehData(ev.aprovadoEm)) throw new RegistroInvalido('retificação sem passagem pelo Gate 2 (D33 B)');
      break;
    case TIPOS.ANULACAO_MARCO:
      if (typeof ev.marcoSeq !== 'number') throw new RegistroInvalido('anulação sem o marco que anula');
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
    // Append-only tem uma consequência: leitura de um dia que já tem leitura seria
    // correção disfarçada. Recusa-se, inclusive a retroativa.
    if (evento.tipo === TIPOS.LEITURA) {
      const jaTem = this.eventos({ carteira: evento.carteira, tipo: TIPOS.LEITURA })
        .some((l) => l.data === evento.data);
      if (jaTem) throw new RegistroInvalido(`já existe leitura de ${evento.data}; o log não sobrescreve — corrija por retificação (D33 B)`);
    }
    if (evento.tipo === TIPOS.RETIFICACAO) {
      const vigente = this.#leiturasVigentes(evento.carteira).get(evento.dataRetificada);
      if (!vigente) throw new RegistroInvalido(`não há leitura de ${evento.dataRetificada} para retificar`);
      // D34 A: retificação é elo de cadeia. O valor antigo tem de bater com o VIGENTE
      // naquele campo, não com o da leitura original — elo que parte de um ponto que
      // já não vale cria duas correções concorrentes sem ordem entre elas.
      const atual = leCampo(vigente, evento.campo);
      if (atual === undefined) {
        throw new RegistroInvalido(`campo "${evento.campo}" não existe na leitura de ${evento.dataRetificada}`);
      }
      if (atual !== evento.valorAntigo) {
        throw new RegistroInvalido(`valor antigo não confere: vigente em ${evento.dataRetificada}.${evento.campo} é ${atual}, não ${evento.valorAntigo}`);
      }
    }
    const gravado = this.#anexar(evento);
    if (evento.tipo === TIPOS.LEITURA) this.#gravarMarcoSeCompletou(evento.carteira);
    if (evento.tipo === TIPOS.RETIFICACAO) {
      this.#anularDerivacoesDesfeitas(evento.carteira, gravado);
      this.#gravarMarcoSeCompletou(evento.carteira);
    }
    return gravado;
  }

  /**
   * D33 C: a versão vigente de uma data é a última retificação que aponta para ela,
   * ou a leitura original se não houver nenhuma. Toda derivação lê daqui, e por isso
   * se recompõe sozinha.
   */
  #leiturasVigentes(carteira) {
    const mapa = new Map();
    for (const l of this.#porData(carteira, TIPOS.LEITURA)) {
      mapa.set(l.data, {
        data: l.data, indice: l.indice, estado: l.estado,
        ...(l.indicadores ? { indicadores: { ...l.indicadores } } : {}),
        camposRetificados: [],
      });
    }
    for (const r of this.eventos({ carteira, tipo: TIPOS.RETIFICACAO }).sort((a, b) => a.seq - b.seq)) {
      const atual = mapa.get(r.dataRetificada);
      if (!atual) continue;
      mapa.set(r.dataRetificada, {
        ...comCampo(atual, r.campo, r.valorNovo),
        camposRetificados: [...new Set([...atual.camposRetificados, r.campo])],
      });
    }
    return mapa;
  }

  /**
   * D33 D · D34 C: retificação não apaga o que foi derivado. Se a derivação deixou
   * de valer, nasce uma anulação que aponta para ela e para a retificação que a
   * desfez. Apagar seria exatamente o rastro que a D9 regra 5 existe para impedir.
   *
   * Hoje a única derivação gravada é o marco de virada, que depende só do índice.
   * Quando a peça 3 gravar derivações que dependem do estado da Linha d'Água, elas
   * entram nesta mesma varredura — a mecânica já é genérica, a lista é que é curta.
   */
  #anularDerivacoesDesfeitas(carteira, retificacao) {
    const vigentes = this.#leiturasVigentes(carteira);
    for (const reset of this.eventos({ carteira, tipo: TIPOS.CONTADOR_RESET })) {
      if (reset.marco !== 'virada' || this.#marcoAnulado(carteira, reset.seq)) continue;
      let vale = true;
      for (let d = dia(reset.desde); d <= dia(reset.ate); d++) {
        const l = vigentes.get(new Date(d * DIA_MS).toISOString().slice(0, 10));
        if (!l || l.indice < MARCO_INDICE) { vale = false; break; }
      }
      if (!vale) {
        this.#anexar({
          carteira, tipo: TIPOS.ANULACAO_MARCO, data: retificacao.data,
          marcoSeq: reset.seq, retificacaoSeq: retificacao.seq,
          motivo: `retificação de ${retificacao.dataRetificada} desfez a sequência ${reset.desde}–${reset.ate}`,
        });
      }
    }
  }

  #marcoAnulado(carteira, seq) {
    return this.eventos({ carteira, tipo: TIPOS.ANULACAO_MARCO }).some((a) => a.marcoSeq === seq);
  }

  #anexar(evento) {
    const gravado = Object.freeze({
      ...evento,
      seq: this.#eventos.length + 1,
      gravadoEm: new Date().toISOString(),
    });
    this.#eventos = [...this.#eventos, gravado];
    this.#adaptador.gravar(this.#eventos);
    return gravado;
  }

  /**
   * D32 B: o registro grava o reset, automaticamente, no dia em que o 30º
   * fechamento consecutivo se completa. É derivação determinística de um log que
   * já existe — não decisão, e nenhuma das quatro coisas que a invariante 1
   * proíbe (comprar, vender, aportar, publicar). O que a D9 regra 5 quer é que o
   * reset deixe rastro, e rastro derivado é rastro.
   *
   * D33 E — um marco por sequência: trinta fechamentos completam um marco, e um só.
   * Sequência de 45 ou 200 dias produz o mesmo marco único; para nascer outro, ela
   * precisa romper e se formar de novo. Um marco a cada 30 dias rearmaria o reforço
   * repetidamente num bull longo, que é justamente quando ele não deve ser rearmado.
   */
  #gravarMarcoSeCompletou(carteira) {
    const seq = this.#sequenciaNoMarco(carteira);
    if (seq === null || seq.dias < MARCO_DIAS) return;
    const completoEm = this.#somaDias(seq.desde, MARCO_DIAS - 1);
    const jaGravado = this.eventos({ carteira, tipo: TIPOS.CONTADOR_RESET })
      .some((r) => r.marco === 'virada' && r.desde === seq.desde && !this.#marcoAnulado(carteira, r.seq));
    if (jaGravado) return;
    this.#anexar({
      carteira, tipo: TIPOS.CONTADOR_RESET, data: completoEm, marco: 'virada',
      desde: seq.desde, ate: completoEm,
    });
  }

  #somaDias(data, n) {
    return new Date((dia(data) + n) * DIA_MS).toISOString().slice(0, 10);
  }

  /** A sequência corrente de fechamentos em 65 ou mais, ou null se não há. */
  #sequenciaNoMarco(carteira) {
    const leituras = [...this.#leiturasVigentes(carteira).values()].sort((a, b) => (a.data < b.data ? -1 : 1));
    if (leituras.length === 0) return null;
    let inicio = null, anterior = null;
    for (const l of leituras) {
      const rompeu = l.indice < MARCO_INDICE;
      const pulouDia = anterior !== null && dia(l.data) !== dia(anterior) + 1;
      if (rompeu || pulouDia) inicio = rompeu ? null : l.data;
      else if (inicio === null) inicio = l.data;
      anterior = l.data;
    }
    if (inicio === null) return null;
    return { desde: inicio, ate: anterior, dias: dia(anterior) - dia(inicio) + 1 };
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
    // D33 D: marco anulado sai da contagem, mas continua no log.
    const resets = this.#porData(carteira, TIPOS.CONTADOR_RESET)
      .filter((r) => !this.#marcoAnulado(carteira, r.seq));
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
    const leituras = [...this.#leiturasVigentes(carteira).values()].sort((a, b) => (a.data < b.data ? -1 : 1));
    if (leituras.length === 0) return ausente('nenhuma leitura registrada');

    const ultima = leituras.at(-1);
    if (hoje !== undefined && ehData(hoje) && dia(hoje) > dia(ultima.data)) {
      // D32 A: o dia pode ser recomposto por leitura retroativa dentro de 30 dias.
      const recuperavel = dia(hoje) - dia(ultima.data) <= RECUPERACAO_DIAS;
      return ausente(`última leitura em ${ultima.data}; sem leitura de ${hoje}` +
        (recuperavel ? ' — ainda recuperável por leitura retroativa' : ' — fora da janela de recuperação'));
    }
    const seq = this.#sequenciaNoMarco(carteira);
    if (seq === null) return presente({ dias: 0, desde: null, completo: false });
    return presente({ dias: seq.dias, desde: seq.desde, completo: seq.dias >= MARCO_DIAS });
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

  /** A série completa de uma data: a leitura original e cada retificação sobre ela. */
  historicoDaLeitura(carteira, data) {
    const original = this.#porData(carteira, TIPOS.LEITURA).find((l) => l.data === data) ?? null;
    const retificacoes = this.eventos({ carteira, tipo: TIPOS.RETIFICACAO })
      .filter((r) => r.dataRetificada === data).sort((a, b) => a.seq - b.seq);
    const porCampo = new Map();
    for (const r of retificacoes) porCampo.set(r.campo, [...(porCampo.get(r.campo) ?? []), r]);
    return { original, retificacoes, porCampo, vigente: this.#leiturasVigentes(carteira).get(data) ?? null };
  }

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

  // ── 5·6·7 · GATE, FILTRO E TETO DE CONTAGEM ─────────────────────────────
  // D23 B · D16 B · D22 C. São três tipos distintos de propósito: a razão pela
  // qual um ativo está fora determina se ele volta sozinho ou não.

  /**
   * Situação de um ativo, com a diferença que a D22 C exige preservada:
   *   'reprovado_no_filtro' — não volta sem reexame;
   *   'teto_de_contagem'    — volta sozinho se subir de posição;
   *   'invalidado_pelo_gate'— saiu por decisão de tese, com saída ordenada.
   */
  situacaoDoAtivo(carteira, ativo) {
    const ultimo = (tipo) => this.#porData(carteira, tipo).filter((e) => e.ativo === ativo).at(-1) ?? null;
    const invalidacao = ultimo(TIPOS.GATE_INVALIDAR);
    const filtro = ultimo(TIPOS.FILTRO_HORIZONTE);
    const contagem = ultimo(TIPOS.TETO_CONTAGEM);

    const candidatos = [
      invalidacao && { evento: invalidacao, situacao: 'invalidado_pelo_gate', voltaSozinho: false, motivo: invalidacao.motivo },
      filtro && !filtro.aprovado && { evento: filtro, situacao: 'reprovado_no_filtro', voltaSozinho: false, motivo: filtro.motivo },
      contagem && { evento: contagem, situacao: 'teto_de_contagem', voltaSozinho: true, motivo: `9ª posição ou além (${contagem.posicao}ª)` },
      filtro && filtro.aprovado && { evento: filtro, situacao: 'elegivel', voltaSozinho: null, motivo: filtro.motivo },
    ].filter(Boolean);

    if (candidatos.length === 0) return ausente(`nenhum registro de filtro, contagem ou invalidação para ${ativo}`);
    const vigente = candidatos.reduce((a, b) => (a.evento.data >= b.evento.data ? a : b));
    return presente({ situacao: vigente.situacao, voltaSozinho: vigente.voltaSozinho, motivo: vigente.motivo, desde: vigente.evento.data });
  }

  /** Todo ativo que já passou pelo filtro, com a situação corrente de cada um. */
  universo(carteira) {
    const ativos = new Set();
    for (const t of [TIPOS.FILTRO_HORIZONTE, TIPOS.TETO_CONTAGEM, TIPOS.GATE_INVALIDAR]) {
      for (const e of this.eventos({ carteira, tipo: t })) ativos.add(e.ativo);
    }
    return new Map([...ativos].sort().map((a) => [a, this.situacaoDoAtivo(carteira, a)]));
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
