// D44 A · TESTE DE REDAÇÃO
//
// Onde a frase NÃO pode ser gerada da constante — texto corrido de documento, legenda
// que explica mecânica — ela leva teste próprio, que quebra se o número escrito
// divergir da constante que o sistema usa.
//
// É o mecanismo que teria pego a trava 3 dizendo "3 anos" com a D43 já em 4, e é o
// que pega a próxima decisão que mudar um número e esquecer um documento.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  ABRIGO_ATIVO_ANOS, EXPOSICAO_ALVO, BANDA_PONTOS, TETO_DEFASAGEM, MESES_SEM_MODULACAO,
  BANDA_MODULACAO, TETO_APORTE, FATIA_DO_CAIXA, PISO_DO_CAIXA, ACIONAMENTOS_POR_CICLO,
  ESPACAMENTO_DIAS, INDICE_MAXIMO_REFORCO, TETO_POR_ATIVO, GATILHO_DE_VENDA,
  PISO_POR_POSICAO, PISO_BTC_ETH, BASES_DO_ESTADO, VELOCIDADE_POR_ESTADO,
} from './alocador/alocador.mjs';
import { VALIDADE_DIAS, MARCO_INDICE, MARCO_DIAS } from './registro/registro.mjs';
import { LIMIAR_LIQUIDEZ, EXCHANGES_MINIMAS, PESOS } from './torre/torre.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ler = (f) => readFileSync(join(AQUI, f), 'utf8');
const cache = new Map();
const doc = (f) => { if (!cache.has(f)) cache.set(f, ler(f)); return cache.get(f); };

/**
 * Cada linha: o arquivo, um trecho com UM grupo de captura no número, e o valor que a
 * constante manda. `todas: true` exige que todas as ocorrências batam.
 */
const REDACOES = [
  // ── O ABRIGO, que a D43 moveu de 3 para 4 ──────────────────────────────
  ['01-documento-mae.md', /\*\*Começa a (\d+) anos da entrega\*\*/, ABRIGO_ATIVO_ANOS],
  ['01-documento-mae.md', /\| \+(\d+) anos \| 100% \| Carteira cheia/, ABRIGO_ATIVO_ANOS],
  ['01-documento-mae.md', /\| (\d+) anos \| 100% \| A rampa começa a mover/, ABRIGO_ATIVO_ANOS],
  ['01-documento-mae.md', /só com mais de \*\*quatro\*\* anos até a\nentrega/, ABRIGO_ATIVO_ANOS, 'quatro'],
  ['02-agentes.md', /Abrigo estiver ativo \(\*\*(\d+) anos ou menos\*\*/, ABRIGO_ATIVO_ANOS],
  ['02-agentes.md', /\*\*Mais de (\d+) anos até a entrega\*\* \(Decisão 43\)/, ABRIGO_ATIVO_ANOS],
  ['02-agentes.md', /\*\*(\d+)a: 1,00\*\* · 3a: 0,66/, ABRIGO_ATIVO_ANOS],

  // ── A GLIDEPATH ────────────────────────────────────────────────────────
  ['01-documento-mae.md', /\| 3 anos \| (\d+)% \| Defesa sobe/, EXPOSICAO_ALVO[3]],
  ['01-documento-mae.md', /\| 2 anos \| (\d+)% \| Defesa passa/, EXPOSICAO_ALVO[2]],
  ['01-documento-mae.md', /\| 1 ano \| (\d+)% \| Majoritariamente/, EXPOSICAO_ALVO[1]],
  ['01-documento-mae.md', /\| Ano da entrega \| (\d+)% \| Essencialmente/, EXPOSICAO_ALVO[0]],
  ['01-documento-mae.md', /Banda de tolerância de (\d+) pontos percentuais/, BANDA_PONTOS],
  ['01-documento-mae.md', /\*\*Teto de (\d+) pontos\*\*/, TETO_DEFASAGEM],
  ['01-documento-mae.md', /Faltando (\d+) meses ou menos, o fator é sempre 1,00/, MESES_SEM_MODULACAO],

  // ── AS SETE TRAVAS DO REFORÇO ──────────────────────────────────────────
  ['02-agentes.md', /\*\*Índice Semente ≤ (\d+)\.\*\*/, INDICE_MAXIMO_REFORCO],
  ['02-agentes.md', /no máximo \*\*(\d+)% do caixa acumulado\*\*/, FATIA_DO_CAIXA * 100],
  ['02-agentes.md', /No máximo \*\*(\d+) acionamentos por ciclo\*\*/, ACIONAMENTOS_POR_CICLO],
  ['02-agentes.md', /espaçados em pelo menos \*\*(\d+) dias\*\*/, ESPACAMENTO_DIAS],
  ['02-agentes.md', /Nunca deixa o caixa abaixo de \*\*(\d+)% da carteira\*\*/, PISO_DO_CAIXA * 100],

  // ── OS TETOS DE CONCENTRAÇÃO ───────────────────────────────────────────
  ['01-documento-mae.md', /Estouro acima de \*\*(\d+)%\*\* do teto por ativo/, GATILHO_DE_VENDA],
  ['01-documento-mae.md', /Queda abaixo de \*\*(\d+)%\*\* do piso de posição/, PISO_POR_POSICAO],
  ['01-documento-mae.md', /### Os três degraus do teto de (\d+)%/, TETO_POR_ATIVO],
  ['02-agentes.md', /(\d+)% para qualquer um fora de BTC e ETH/, TETO_POR_ATIVO],
  ['02-agentes.md', /BTC\+ETH\n {3}somados em pelo menos (\d+)%/, PISO_BTC_ETH],

  // ── O REGISTRO ─────────────────────────────────────────────────────────
  ['02-agentes.md', /fechar em \*\*(\d+) ou mais\*\* por \*\*30 dias/, MARCO_INDICE],
  ['02-agentes.md', /por \*\*(\d+) dias corridos\n> consecutivos\*\*/, MARCO_DIAS],
  ['02-agentes.md', /a validade de (\d+) dias do degrau/, VALIDADE_DIAS],

  // ── O FILTRO DE HORIZONTE ──────────────────────────────────────────────
  ['09-ritual-operacional.md', /US\$ (\d+) mi ou mais/, LIMIAR_LIQUIDEZ / 1e6],
  ['09-ritual-operacional.md', /(duas) exchanges de primeira linha/, EXCHANGES_MINIMAS, 'duas'],
];

const POR_EXTENSO = { quatro: 4, duas: 2, três: 3, doze: 12 };

test('D44 A: todo número escrito nos documentos bate com a constante do sistema', () => {
  const falhas = [];
  for (const [arquivo, re, esperado, extenso] of REDACOES) {
    const m = doc(arquivo).match(re);
    if (!m) { falhas.push(`${arquivo}: trecho não encontrado — ${re}`); continue; }
    const lido = extenso ? POR_EXTENSO[extenso] : Number(m[1]);
    if (lido !== esperado) {
      falhas.push(`${arquivo}: o texto diz ${extenso ?? m[1]} e a constante é ${esperado} — ${re}`);
    }
  }
  assert.deepEqual(falhas, [], `\n  ${falhas.join('\n  ')}\n`);
});

test('D44 A: a matriz do aporte publicada continua sendo a que o código produz', () => {
  // A matriz é texto de documento e não pode ser gerada. Este teste é a redação dela.
  // A matriz vive logo depois do seu título; ancorar nele evita pegar outras tabelas.
  const bloco = doc('02-agentes.md').split('### MATRIZ DO APORTE')[1].split('###')[0];
  const linhas = bloco.match(/^\|(?! Estado)(?!---)[^|]+\|(?:[^\n|]*\|){5}$/gm) ?? [];
  assert.equal(linhas.length, 4, `as quatro linhas da matriz, achei ${linhas.length}`);
  const bases = Object.values(BASES_DO_ESTADO);
  linhas.forEach((linha, i) => {
    const primeira = Number(linha.split('|')[2].replace(/[\s*%]/g, '').replace(',', '.'));
    // A coluna "+4 anos" é base × M, sem Abrigo. M de hoje é 0,99699.
    assert.ok(Math.abs(primeira - bases[i] * 0.99699) < 0.06,
      `linha ${i}: documento diz ${primeira}, base ${bases[i]} × M daria ${(bases[i] * 0.99699).toFixed(1)}`);
  });
});

test('D44 A: os pesos renormalizados no briefing batem com os do código', () => {
  // O briefing publica os pesos JÁ renormalizados sobre 0,88, porque a camada 5 está
  // fora (D5). São número derivado escrito à mão — exatamente o caso da D44 A.
  const b = doc('00-BRIEFING-CODE.md');
  const soma = [1, 2, 3, 4].reduce((s, c) => s + PESOS[c], 0);
  for (const c of [1, 2, 3, 4]) {
    const escrito = (PESOS[c] / soma * 100).toFixed(1).replace('.', ',');
    assert.ok(b.includes(escrito), `o peso renormalizado ${escrito} da camada ${c} sumiu do briefing`);
  }
  assert.equal(soma.toFixed(2), '0.88', 'a camada 5 fora deixa 0,88');
});

test('D44 A: os fatores de velocidade da D25 B estão escritos como o código os usa', () => {
  const t = doc('01-documento-mae.md');
  for (const [estado, fator] of Object.entries(VELOCIDADE_POR_ESTADO)) {
    const escrito = fator.toFixed(2).replace('.', ',');
    assert.ok(t.includes(escrito), `o fator ${escrito} de ${estado} não aparece no documento 01`);
  }
});

test('D44 D: toda tela declara charset — sistema em português sem charset é bug esperando servidor', () => {
  for (const tela of ['aporte-do-mes.html', 'indice-semente.html', 'linha-dagua-mercado.html', 'simulador.html']) {
    const s = doc(tela);
    assert.match(s.slice(0, 200), /<meta charset="utf-8">/i, `${tela} sem charset`);
    // E o charset tem de vir ANTES de qualquer texto acentuado, senão já foi tarde.
    const acento = s.search(/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/);
    assert.ok(s.indexOf('charset') < acento, `${tela}: charset depois do primeiro acento`);
  }
});

test('D44 A: os números que já foram escritos à mão não voltam para a tela', () => {
  const script = doc('aporte-do-mes.html').slice(doc('aporte-do-mes.html').indexOf('<script type="module">'))
    .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

  // Varredura genérica dá falso positivo em ordinal de regra ("2 · não alcança…"), que
  // é rótulo e não valor. A lista é dos números que ESTIVERAM escritos à mão aqui e do
  // nome que passou a gerá-los: se um voltar como literal, o teste quebra.
  const proibidos = [
    [/nunca passa de 100%/, 'TETO_APORTE'],
    [/fica abaixo de 0%/, 'PISO_APORTE'],
    [/±20%/, 'BANDA_MODULACAO'],
    [/min\(M, 1\)`/, 'TETO_M_EM_ABRIGO'],
    [/travado em 1 pelo/, 'TETO_M_EM_ABRIGO'],
    [/últimos doze meses<\/b>/, 'MESES_SEM_MODULACAO'],
    [/fator é 1,00 em qualquer/, 'FATOR_NEUTRO'],
    [/volta a 1,00 mesmo/, 'FATOR_NEUTRO'],
    [/exposição 5 pontos acima/, 'ACIMA_DO_ALVO'],
    [/mais de 3 anos até a entrega/, 'ABRIGO_ATIVO_ANOS'],
    [/hoje: '2026-08-29'/, 'DATA_DA_LEITURA'],
  ];
  const voltaram = proibidos.filter(([re]) => re.test(script))
    .map(([re, nome]) => `${re} — devia sair de ${nome}`);
  assert.deepEqual(voltaram, [], `\n  ${voltaram.join('\n  ')}\n`);

  // E o outro lado: os nomes têm de estar mesmo lá, senão o teste acima passa por vazio.
  for (const nome of ['TETO_APORTE', 'PISO_APORTE', 'BANDA_MODULACAO', 'TETO_M_EM_ABRIGO',
    'FATOR_NEUTRO', 'MESES_SEM_MODULACAO', 'ACIMA_DO_ALVO', 'ABRIGO_ATIVO_ANOS', 'DATA_DA_LEITURA']) {
    assert.ok(script.includes(nome), `${nome} não é usado na tela`);
  }
});

test('D44 A: o mesmo vale para os rótulos que o módulo manda para a tela', () => {
  // As sete travas viajam do módulo para a tela como texto. Cada uma que cita número
  // tem de citá-lo por interpolação.
  const mod = ler('alocador/alocador.mjs');
  const bloco = mod.slice(mod.indexOf('const travas = ['), mod.indexOf('// D9 regra 5'));
  const comNumero = [...bloco.matchAll(/o: (['`])(.*?)\1/g)].map((m) => m[2]).filter((t) => /\d/.test(t));
  for (const t of comNumero) {
    assert.match(t, /\$\{/, `a trava "${t}" tem número escrito à mão`);
  }
  // A trava 3 é a que já errou uma vez: fica com asserção nominal.
  assert.match(bloco, /o: `mais de \$\{ABRIGO_ATIVO_ANOS\} anos até a entrega`/);
});
