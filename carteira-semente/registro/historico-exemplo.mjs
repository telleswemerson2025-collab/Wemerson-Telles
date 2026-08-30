// Histórico de exemplo para a tela do registro de ciclo.
//
// NÃO é leitura real: é um caso construído para exercitar as seis coisas que a tela
// precisa mostrar — o marco se completando, os acionamentos do Reforço, o reset, uma
// leitura retroativa, uma retificação que anula um marco, e a CRM congelada.
//
// Invariante 8: dado ilustrativo é rotulado como ilustrativo. A tela diz isso no topo.

import { Registro, AdaptadorMemoria, TIPOS, MARCO_INDICE, MARCO_DIAS } from './registro.mjs';

export const ILUSTRATIVO = 'histórico construído para demonstração — não é leitura real';
export const CARTEIRA = 'exemplo';

const DIA = 86400000;
const maisDias = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * DIA).toISOString().slice(0, 10);

export function historicoDeExemplo() {
  const r = new Registro(new AdaptadorMemoria());
  const reg = (e) => r.registrar({ carteira: CARTEIRA, ...e });

  // ── fundo de ciclo: índice baixo, dois acionamentos do Reforço ──────────
  let d = '2025-01-06';
  for (let i = 0; i < 12; i++, d = maisDias(d, 1)) {
    reg({ tipo: TIPOS.LEITURA, data: d, indice: 22 + i * 0.4, estado: 'Capitulação profunda' });
  }
  reg({ tipo: TIPOS.REFORCO_ACIONADO, data: '2025-01-08', indice: 22.8, pctCaixa: 25 });
  reg({ tipo: TIPOS.CRM_COMPOSICAO, data: '2025-01-10', legivel: true, ativos: ['BTC', 'ETH', 'SOL'] });
  reg({ tipo: TIPOS.REFORCO_ACIONADO, data: '2025-02-10', indice: 27.1, pctCaixa: 25 });

  // ── a recuperação: 30 fechamentos em 65 ou mais completam o marco ───────
  d = '2025-03-01';
  for (let i = 0; i < MARCO_DIAS; i++, d = maisDias(d, 1)) {
    reg({ tipo: TIPOS.LEITURA, data: d, indice: MARCO_INDICE + 2 + i * 0.3, estado: 'Mercado saudável' });
  }
  // o reset entra sozinho aqui: o registro grava o marco ao 30º fechamento (D32 B)

  // ── uma leitura retroativa, dentro da janela de recuperação ─────────────
  reg({ tipo: TIPOS.LEITURA, data: '2025-04-02', indice: 71.4, estado: 'Mercado saudável' });
  reg({ tipo: TIPOS.LEITURA, data: '2025-04-03', indice: 70.8, estado: 'Mercado saudável' });

  // ── e a CRM fica ilegível: o universo congela no último estado conhecido ─
  reg({ tipo: TIPOS.CRM_COMPOSICAO, data: '2025-04-04', legivel: false, ativos: [] });

  return r;
}

/**
 * O segundo caso: uma retificação que derruba um dia da sequência e ANULA o marco.
 * Fica separado porque é o caso que a tela precisa mostrar apontando para os dois —
 * o marco desfeito e a retificação que o desfez.
 */
export function historicoComAnulacao() {
  const r = historicoDeExemplo();
  r.registrar({
    carteira: CARTEIRA, tipo: TIPOS.RETIFICACAO, data: '2025-04-10',
    dataRetificada: '2025-03-15', campo: 'indice',
    valorAntigo: 71.2, valorNovo: 61.5,
    motivo: 'tooltip relida: o valor do dia era 61,5 e a leitura registrou o do dia anterior',
    aprovadoEm: '2025-04-10',
  });
  return r;
}
