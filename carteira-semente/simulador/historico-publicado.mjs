// O QUE CADA VERSÃO PUBLICOU — registro, não cálculo.
//
// A trava de salto da D54 compara uma versão com a SEGUINTE, e o número da versão
// anterior é fato histórico: ele não sai do motor de hoje, porque o motor mudou. Tem
// de estar escrito. É a mesma categoria da referência v1.3 — coisa que se registra,
// não coisa que se deriva.
//
// APPEND-ONLY, como o Registro: linha publicada não se corrige nem se apaga. Se um
// número aqui estiver errado, entra linha nova de retificação, com a razão — nunca
// edição silenciosa da antiga. Sobrescrever o histórico é apagar exatamente a prova
// que a trava existe para ler.
//
// ⚠️ AS LINHAS ANTIGAS SÓ TÊM A CAPA. As quinze células por versão passaram a ser
// registradas na v1.10, que é a primeira que a trava de célula consegue comparar. De
// v1.3 a v1.9 só existe publicado o piso e o dono dele (documento-mãe), e por isso o
// salto por célula não é calculável para trás. Limite dito, não escondido.

export const HISTORICO_PUBLICADO = Object.freeze([
  Object.freeze({ versao: 'v1.3', decisao: '—', capa: 67725, donoDoPiso: 'Prejuízo do mercado' }),
  Object.freeze({ versao: 'v1.4', decisao: 'D8', capa: 81316, donoDoPiso: 'Capitulação + Prejuízo' }),
  Object.freeze({ versao: 'v1.5', decisao: 'D10', capa: 67725, donoDoPiso: 'Mercado saudável · Índice ≥ 65' }),
  Object.freeze({ versao: 'v1.6', decisao: 'D11', capa: 67725, donoDoPiso: 'Mercado saudável · Índice ≥ 65' }),
  Object.freeze({ versao: 'v1.7', decisao: 'D12', capa: 67725, donoDoPiso: 'Mercado saudável · Índice ≥ 65' }),
  Object.freeze({ versao: 'v1.8', decisao: 'D13', capa: 67725, donoDoPiso: 'Mercado saudável · Índice ≥ 65' }),
  Object.freeze({ versao: 'v1.9', decisao: 'D51', capa: 67725, donoDoPiso: 'Mercado saudável · Índice ≥ 65' }),
  Object.freeze({
    versao: 'v1.10', decisao: 'D52', capa: 67725, donoDoPiso: 'Mercado saudável · Índice ≥ 65',
    // A grade inteira, como publicada. Motor da v1.10: alvo do ano, sem modulação.
    celulas: Object.freeze({
      'Capitulação profunda': Object.freeze({ Conservador: 94071, Moderado: 297492, Forte: 1051848 }),
      'Prejuízo do mercado': Object.freeze({ Conservador: 85820, Moderado: 259084, Forte: 869200 }),
      'Estresse de curto prazo': Object.freeze({ Conservador: 97384, Moderado: 311730, Forte: 1115616 }),
      'Mercado saudável · Índice < 65': Object.freeze({ Conservador: 87561, Moderado: 262311, Forte: 867667 }),
      'Mercado saudável · Índice ≥ 65': Object.freeze({ Conservador: 67725, Moderado: 185653, Forte: 557020 }),
    }),
  }),
]);

/** A última versão publicada — é contra ela que o salto é medido. */
export const ultimaPublicada = () => HISTORICO_PUBLICADO[HISTORICO_PUBLICADO.length - 1];
