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
import { VALIDADE_DIAS, MARCO_INDICE, MARCO_DIAS, RECUPERACAO_DIAS, TIPOS } from './registro/registro.mjs';
import { historicoComAnulacao, CARTEIRA, ILUSTRATIVO } from './registro/historico-exemplo.mjs';
import { LIMIAR_LIQUIDEZ, EXCHANGES_MINIMAS, PESOS, varrer, TRAVA_AUSENCIA_NA_CAMADA } from './torre/torre.mjs';
import { VARREDURA_29_08_2026 as VARREDURA } from './torre/leitura-29-08-2026.mjs';

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

test('D44 A · D46: cada peso do briefing está ligado à SUA camada, não só presente', () => {
  // O briefing publica os pesos já renormalizados sobre 0,88, porque a camada 5 está
  // fora (D5). São número derivado escrito à mão — o caso da D44 A.
  //
  // ⚠️ A versão anterior perguntava se cada peso EXISTIA no briefing. Trocar dois de
  // lugar teria passado: os dois números continuam lá. A ligação aqui é POSICIONAL —
  // a ordem da lista é a ordem das camadas — e é isso que precisa ser provado (D46).
  const m = doc('00-BRIEFING-CODE.md').match(/renormalizados por (\d+) \(([^)]+)\)/);
  assert.ok(m, 'a linha dos pesos renormalizados sumiu do briefing');
  const soma = [1, 2, 3, 4].reduce((s, c) => s + PESOS[c], 0);
  assert.equal(Number(m[1]), Math.round(soma * 100), 'o divisor escrito é a soma das quatro camadas');
  const escritos = m[2].split('·').map((x) => x.trim());
  assert.equal(escritos.length, 4, 'quatro pesos na lista');
  escritos.forEach((escrito, i) => {
    const camada = i + 1;
    const esperado = (PESOS[camada] / soma * 100).toFixed(1).replace('.', ',');
    assert.equal(escrito, esperado,
      `na posição ${camada} o briefing diz ${escrito} e a camada ${camada} pesa ${esperado}`);
  });
});

test('D44 A: os fatores de velocidade da D25 B estão escritos como o código os usa', () => {
  // ⚠️ A versão anterior perguntava se o número existia em ALGUM lugar do documento, e
  // "1,50" também aparece três linhas abaixo, em prosa. O teste passava por vazio, e a
  // prova da D45 foi quem denunciou. Agora ele liga ESTADO a FATOR, na linha que define.
  const linha = doc('01-documento-mae.md')
    .match(/\*\*A velocidade é modulada pelo estado da Linha d'Água:\*\*([\s\S]*?)\n\n/)?.[1];
  assert.ok(linha, 'a linha que define os fatores sumiu do documento 01');
  for (const [estado, fator] of Object.entries(VELOCIDADE_POR_ESTADO)) {
    const nome = estado.replace('Mercado saudável', 'Mercado saudável')
      .replace('Estresse de curto prazo', 'Estresse de\n  curto prazo')
      .replace('Prejuízo do mercado', 'Prejuízo do mercado')
      .replace('Capitulação profunda', 'Capitulação profunda');
    const escrito = fator.toFixed(2).replace('.', ',');
    const re = new RegExp(`${nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\*\\*${escrito.replace(',', ',')}\\*\\*`);
    assert.match(linha, re, `o documento 01 não liga ${estado} ao fator ${escrito}`);
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

  // E o outro lado, ligado e não só presente (D46): o nome tem de aparecer DENTRO de
  // uma interpolação. Só estar na lista de import não gera rótulo nenhum.
  const interpolados = new Set([...script.matchAll(/\$\{([^}]*)\}/g)]
    .flatMap((m) => m[1].match(/[A-Z][A-Z0-9_]{2,}/g) ?? []));
  for (const nome of ['TETO_APORTE', 'PISO_APORTE', 'BANDA_MODULACAO', 'TETO_M_EM_ABRIGO',
    'FATOR_NEUTRO', 'MESES_SEM_MODULACAO', 'ACIMA_DO_ALVO', 'ABRIGO_ATIVO_ANOS']) {
    assert.ok(interpolados.has(nome), `${nome} não gera texto nenhum na tela — está só importado`);
  }
  // A data é usada como argumento, não interpolada em rótulo: ligação própria.
  assert.match(script, /hoje: DATA_DA_LEITURA/, 'a data da leitura tem de vir do nome');
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
  const trava3 = bloco.match(/\{ n: 3, o: (['`])(.*?)\1/)?.[2] ?? '';
  assert.match(trava3, /\$\{ABRIGO_ATIVO_ANOS\}/, 'o rótulo da trava 3 interpola a constante');
  assert.ok(!/\b[0-9]+ anos\b/.test(trava3), 'e não traz o número escrito à mão');
});

// ══ A TELA DO REGISTRO DE CICLO — item 2 da peça 4 ════════════════════════
test('D44 A · D46: os números da tela do ciclo saem da constante, e ligados', () => {
  const s = doc('registro-de-ciclo.html');
  const script = s.slice(s.indexOf('<script type="module">'))
    .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

  // Os números que a tela cita são o limiar, a janela do marco, a de recuperação e o
  // número de acionamentos. Nenhum pode estar escrito à mão.
  const proibidos = [
    [/em <b>65 ou mais<\/b>/, 'MARCO_INDICE'],
    [/por <b>30 dias/, 'MARCO_DIAS'],
    [/janela [^`]*é de <b>30 dias/, 'RECUPERACAO_DIAS'],
    [/de 3 usados/, 'ACIONAMENTOS_POR_CICLO'],
    [/abaixo de 65 recomeça/, 'MARCO_INDICE'],
  ];
  const voltaram = proibidos.filter(([re]) => re.test(script)).map(([re, n]) => `${re} — devia sair de ${n}`);
  assert.deepEqual(voltaram, [], `\n  ${voltaram.join('\n  ')}\n`);

  // D46: ligados, não só presentes — cada nome dentro de uma interpolação.
  const interpolados = new Set([...script.matchAll(/\$\{([^}]*)\}/g)]
    .flatMap((m) => m[1].match(/[A-Z][A-Z0-9_]{2,}/g) ?? []));
  for (const nome of ['MARCO_INDICE', 'MARCO_DIAS', 'RECUPERACAO_DIAS', 'ACIONAMENTOS_POR_CICLO']) {
    assert.ok(interpolados.has(nome), `${nome} não gera texto nenhum na tela do ciclo`);
  }
});

test('a tela do ciclo lê o registro, e não recalcula nada por conta própria', () => {
  const s = doc('registro-de-ciclo.html');
  // Toda pergunta sobre o ciclo vai ao módulo da peça 1.
  for (const metodo of ['diasConsecutivosNoMarco', 'cicloReforco', 'composicaoCRM', 'eventos']) {
    assert.match(s, new RegExp(`r\\.${metodo}\\(`), `a tela não chama ${metodo}`);
  }
  // E o log sai sem filtro: a leitura crua é a primeira coisa, não uma opção.
  assert.match(s, /\$\('log'\)\.tBodies\[0\]\.innerHTML = eventos\.map/,
    'o log tem de renderizar a lista inteira, na ordem em que veio');
});

test('o histórico de exemplo exercita as seis seções, e é rotulado como ilustrativo', () => {
  const r = historicoComAnulacao();
  const ev = r.eventos({ carteira: CARTEIRA });
  const tipos = new Set(ev.map((e) => e.tipo));
  // Invariante 8: dado ilustrativo é rotulado como tal, e a tela diz isso no topo.
  // O rótulo é GERADO da constante (D44), então a ligação é: a tela interpola
  // ILUSTRATIVO, e ILUSTRATIVO diz que não é leitura real.
  assert.match(doc('registro-de-ciclo.html'), /\$\{ILUSTRATIVO\}/, 'a tela não usa o rótulo do exemplo');
  assert.match(ILUSTRATIVO, /não é leitura real/);
  assert.match(doc('registro-de-ciclo.html'), /Nenhum\s*\n?\s*número aqui é leitura real/i);
  for (const t of [TIPOS.LEITURA, TIPOS.REFORCO_ACIONADO, TIPOS.CONTADOR_RESET,
    TIPOS.CRM_COMPOSICAO, TIPOS.RETIFICACAO, TIPOS.ANULACAO_MARCO]) {
    assert.ok(tipos.has(t), `o exemplo não produz nenhum evento do tipo ${t}`);
  }
  // A anulação aponta para os dois: o marco e a retificação que o desfez.
  const a = ev.find((e) => e.tipo === TIPOS.ANULACAO_MARCO);
  assert.equal(ev.find((e) => e.seq === a.marcoSeq).tipo, TIPOS.CONTADOR_RESET);
  assert.equal(ev.find((e) => e.seq === a.retificacaoSeq).tipo, TIPOS.RETIFICACAO);
  // E o marco anulado tira o reset da contagem: o ciclo volta a ser o primeiro.
  assert.equal(r.cicloReforco(CARTEIRA).desde, null);
  assert.equal(r.cicloReforco(CARTEIRA).contador, 2, 'os dois acionamentos voltam para o ciclo');
});

// ══ A TELA DO ÍNDICE — item 3 da peça 4 ═══════════════════════════════════
test('critério de aceite: a tela exibe 51, com o valor interno que a Torre produz', () => {
  // O briefing fixou o número que as quatro correções tinham de produzir. Ele é
  // derivado FORA desta tela — é a checagem que não é o código conferindo a si mesmo.
  const r = varrer({ varredura: VARREDURA, hoje: '2026-08-29' });
  assert.equal(Math.round(r.indice), 51, 'exibido');
  assert.equal(r.indice.toFixed(4), '50.7536', 'interno');
  assert.equal(r.faixa, 'Equilíbrio');
  // E a tela exibe o arredondado e o interno, os dois gerados do mesmo objeto.
  const s = doc('indice-semente.html');
  assert.match(s, /\$\{num\(r\.indice\)\}/, 'o exibido sai de r.indice');
  assert.match(s, /valor interno \$\{num\(r\.indice, 4\)\}/, 'e o interno também');
});

test('D1 · D5 · D36 B: a tela não tem régua própria — ela pergunta à Torre', () => {
  const s = doc('indice-semente.html');
  const script = s.slice(s.indexOf('<script type="module">'));
  // A versão anterior desta tela tinha a tabela de indicadores, os pesos e a
  // normalização dentro do HTML. Nada disso pode voltar.
  for (const proibido of [/\bc:\s*[12345]\b/, /Math\.log\(/, /posCamada/, /\bFAIXAS\s*=/, /PESOS\s*=\s*\{/]) {
    assert.ok(!proibido.test(script), `a tela voltou a calcular: ${proibido}`);
  }
  // E chama a Torre para tudo.
  assert.match(script, /varrer\(\{ varredura: V, hoje: HOJE \}\)/);
  assert.match(script, /camada5\(\{/);
});

test('D2: a tela diz, onde o número aparece, que o Índice não dispara decisão', () => {
  const s = doc('indice-semente.html');
  assert.match(s, /não classifica estado e não dispara\s*\n?\s*estação/i);
  assert.match(s, /Quem classifica é a Linha d’Água/);
  // A versão anterior trazia recomendação de aporte nas faixas. Não pode voltar.
  for (const p of [/Plantio · aporte integral/, /aporte integral/, /r:\s*'/]) {
    assert.ok(!p.test(s), `a tela voltou a disparar decisão: ${p}`);
  }
});

test('D41 D · D42 E: as duas contagens de extremo aparecem separadas', () => {
  const s = doc('indice-semente.html');
  for (const campo of ['confirmados', 'confirmadosPorInteiro', 'postoConfirmado',
    'provisorios', 'provisoriosQueImportam', 'inertesPendentes']) {
    assert.match(s, new RegExp(`e\\.${campo}`), `a tela não mostra ${campo}`);
  }
  // Risco e trabalho são contagens diferentes, e a tela diz isso.
  assert.match(s, /Risco e trabalho são contagens diferentes/);
});

test('D44 A · D46: os números da tela do Índice saem da constante, e ligados', () => {
  const s = doc('indice-semente.html');
  const script = s.slice(s.indexOf('<script type="module">'))
    .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
  const proibidos = [
    [/passarem de <b>33%<\/b>/, 'TRAVA_AUSENCIA_NA_CAMADA'],
    [/vale 180 dias|de 180 dias/, 'VALIDADE_DIAS'],
    [/<b>BTC e ETH<\/b>/, 'ANCORAS_DE_TESE'],
  ];
  const voltaram = proibidos.filter(([re]) => re.test(script)).map(([re, n]) => `${re} — devia sair de ${n}`);
  assert.deepEqual(voltaram, [], `\n  ${voltaram.join('\n  ')}\n`);
  const interpolados = new Set([...script.matchAll(/\$\{([^}]*)\}/g)]
    .flatMap((m) => m[1].match(/[A-Z][A-Z0-9_]{2,}/g) ?? []));
  for (const nome of ['TRAVA_AUSENCIA_NA_CAMADA', 'VALIDADE_DIAS', 'ANCORAS_DE_TESE']) {
    assert.ok(interpolados.has(nome), `${nome} não gera texto nenhum na tela do Índice`);
  }
});

test('D21 B: a suspensão da camada 5 nomeia o ativo e a data, sem palavra duplicada', () => {
  const s = doc('indice-semente.html');
  assert.match(s, /c5\.motivo/, 'a tela mostra o motivo que a Torre monta');
  // A frase vem do módulo; aqui se confere que ela não tem o defeito que um teste
  // chegou a congelar — "por tese tese vencida".
  const torre = ler('torre/torre.mjs');
  assert.ok(!/por tese \$\{suspensao\.razao\}/.test(torre), 'o prefixo duplicado voltou');
  // D48: a intenção é que a frase interpole o ativo e a razão, e não repita palavra.
  const frase = torre.match(/motivo: `(camada 5 suspensa[^`]*)`/)?.[1] ?? '';
  assert.match(frase, /\$\{suspensao\.ativo\}/, 'nomeia o ativo');
  assert.match(frase, /\$\{suspensao\.razao\}/, 'e traz a razão');
  assert.ok(!/tese \$\{suspensao\.razao\}/.test(frase), 'sem prefixo que duplique a razão');
});
