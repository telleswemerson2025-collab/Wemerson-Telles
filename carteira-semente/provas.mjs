#!/usr/bin/env node
// D45 · TESTE NOVO NASCE PROVADO
//
// Todo teste de conferência — redação, âncora, invariante — só entra no pacote depois
// de ser VISTO reprovando. Este arquivo é o registro do que foi quebrado para provar
// cada um, e ele é executável: a prova não é uma frase num documento, é uma coisa que
// se roda de novo.
//
//   node carteira-semente/provas.mjs
//
// Cada prova quebra um arquivo de propósito, confirma que o teste acusa, e desfaz.
// O `finally` restaura mesmo se algo explodir no meio — nenhuma prova deixa rastro.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const arq = (f) => join(AQUI, f);

/**
 * teste  — o nome, como o node --test o encontra
 * quebra — arquivo, o trecho e o que ele vira
 * acusa  — o que a mensagem de falha tem de dizer; sem isso o teste podia estar
 *          quebrando por outro motivo, e a prova não provaria nada
 * todas  — D47 A: quando o trecho não é único no arquivo, muta TODAS as ocorrências.
 *          Sem isso a mutação deixa um gêmeo de pé, o teste passa, e a prova falha por
 *          MIRA ERRADA — não por fraqueza do teste. O harness recusa mira ambígua.
 *
 * D47 B: a prova diz qual asserção deve acusar (`acusa`), e o harness mostra a que
 * acusou de fato. Se outra asserção do mesmo teste pega a mutação primeiro, a regra
 * que se queria demonstrar segue sem prova, com aparência de provada.
 */
const PROVAS = [
  {
    teste: 'todo número escrito nos documentos bate com a constante',
    porque: 'o documento diverge da constante depois de uma decisão mudar o número',
    quebra: ['01-documento-mae.md', '**Começa a 4 anos da entrega**', '**Começa a 3 anos da entrega**'],
    acusa: /o texto diz 3 e a constante é 4/,
  },
  {
    teste: 'a matriz do aporte publicada continua sendo a que o código produz',
    porque: 'a matriz publicada deixa de ser o que base × M produz',
    quebra: ['02-agentes.md', '| **Mercado saudável** (estado de hoje) | **39,9%**', '| **Mercado saudável** (estado de hoje) | **45,0%**'],
    acusa: /documento diz 45/,
  },
  {
    teste: 'cada peso do briefing está ligado à SUA camada',
    porque: 'o peso renormalizado escrito à mão descola do PESOS do código',
    quebra: ['00-BRIEFING-CODE.md', 'renormalizados por 88 (38,6', 'renormalizados por 88 (39,6'],
    acusa: /na posição 1 o briefing diz 39,6/,
  },
  {
    // ⚠️ A PROVA QUE SÓ A D46 TORNA POSSÍVEL. Trocar dois pesos de lugar não tira
    // número nenhum do documento: a versão de PRESENÇA passava, porque os dois
    // continuam lá. Só um teste de LIGAÇÃO pega.
    teste: 'cada peso do briefing está ligado à SUA camada',
    porque: 'dois pesos trocados de lugar — o erro que a asserção de presença deixava passar',
    quebra: ['00-BRIEFING-CODE.md', '(38,6 · 29,5 ·', '(29,5 · 38,6 ·'],
    acusa: /na posição 1 o briefing diz 29,5/,
  },
  {
    teste: 'cada peso do briefing está ligado à SUA camada',
    porque: 'o divisor da renormalização descola da soma das quatro camadas',
    quebra: ['00-BRIEFING-CODE.md', 'renormalizados por 88 (', 'renormalizados por 90 ('],
    acusa: /o divisor escrito é a soma das quatro camadas/,
  },
  {
    // A outra ligação que a D46 pediu: nome importado não é nome usado.
    teste: 'os números que já foram escritos à mão não voltam para a tela',
    porque: 'uma constante fica só importada, sem gerar rótulo nenhum',
    quebra: ['aporte-do-mes.html', 'nem fica abaixo de ${pct(PISO_APORTE, 0)}', 'nem fica abaixo do piso'],
    acusa: /PISO_APORTE não gera texto nenhum na tela — está só importado/,
  },
  {
    teste: 'os fatores de velocidade da D25 B estão escritos como o código os usa',
    porque: 'um fator de velocidade é recalibrado no código e o documento não acompanha',
    quebra: ['01-documento-mae.md', 'Mercado saudável **1,50**', 'Mercado saudável **1,60**'],
    acusa: /não liga Mercado saudável ao fator 1,50/,
  },
  {
    // D47 A, o outro lado: quando NÃO há ponto único, mutam-se todos de uma vez.
    // "3 pontos" aparece três vezes no documento 01 — a banda da glidepath e duas
    // menções em prosa. Mutar uma só deixaria as outras, e o teste que confere a
    // banda continuaria passando pela ocorrência que sobrou.
    teste: 'todo número escrito nos documentos bate com a constante',
    porque: 'a banda de tolerância descola da âncora, e o número aparece em três lugares',
    quebra: ['01-documento-mae.md', '3 pontos', '5 pontos'],
    todas: true,
    acusa: /o texto diz 5 e a constante é 3/,
  },
  {
    teste: 'toda tela declara charset',
    porque: 'uma tela nasce sem charset, e todo acento dela corrompe no primeiro servidor',
    quebra: ['simulador.html', '<meta charset="utf-8">\n', ''],
    acusa: /simulador\.html sem charset/,
  },
  {
    teste: 'os números que já foram escritos à mão não voltam para a tela',
    porque: 'um rótulo volta a ser escrito à mão em vez de sair da constante',
    quebra: ['aporte-do-mes.html', '±${pct(BANDA_MODULACAO * 100, 0)} no máximo', '±20% no máximo'],
    acusa: /devia sair de BANDA_MODULACAO/,
  },
  {
    teste: 'o mesmo vale para os rótulos que o módulo manda para a tela',
    porque: 'é literalmente o erro da trava 3 voltando — rótulo fixo com a regra em outro número',
    quebra: ['alocador/alocador.mjs', 'o: `mais de ${ABRIGO_ATIVO_ANOS} anos até a entrega`',
      "o: 'mais de 3 anos até a entrega'"],
    acusa: /tem número escrito à mão|mais de \$\{ABRIGO_ATIVO_ANOS\}/,
  },
  // ── A TELA DO REGISTRO DE CICLO (item 2 da peça 4) ─────────────────────
  {
    teste: 'os números da tela do ciclo saem da constante, e ligados',
    porque: 'o limiar do marco volta a ser escrito à mão no subtítulo',
    quebra: ['registro-de-ciclo.html', 'em <b>${MARCO_INDICE} ou mais</b>', 'em <b>65 ou mais</b>'],
    acusa: /devia sair de MARCO_INDICE/,
  },
  {
    teste: 'os números da tela do ciclo saem da constante, e ligados',
    porque: 'uma constante do registro fica só importada, sem gerar rótulo',
    quebra: ['registro-de-ciclo.html', 'de ${ACIONAMENTOS_POR_CICLO} usados', 'de três usados'],
    acusa: /ACIONAMENTOS_POR_CICLO não gera texto nenhum na tela do ciclo/,
  },
  {
    teste: 'a tela do ciclo lê o registro, e não recalcula nada por conta própria',
    porque: 'o log ganha um filtro por padrão e a leitura crua deixa de ser a primeira coisa',
    quebra: ['registro-de-ciclo.html', "$('log').tBodies[0].innerHTML = eventos.map",
      "$('log').tBodies[0].innerHTML = eventos.filter((e) => e.tipo !== TIPOS.LEITURA).map"],
    acusa: /o log tem de renderizar a lista inteira/,
  },
  {
    teste: 'o histórico de exemplo exercita as seis seções',
    porque: 'o exemplo deixa de produzir a anulação de marco, e a seção 5 fica sem caso',
    quebra: ['registro/historico-exemplo.mjs', 'valorAntigo: 71.2, valorNovo: 61.5',
      'valorAntigo: 71.2, valorNovo: 71.9'],
    acusa: /o exemplo não produz nenhum evento do tipo anulacao_marco/,
  },
  // ── A TELA DO ÍNDICE (item 3 da peça 4) ────────────────────────────────
  {
    teste: 'critério de aceite: a tela exibe 51',
    porque: 'o exibido deixa de sair do índice da Torre e vira número solto',
    quebra: ['indice-semente.html', '$('+"'exibido'"+').innerHTML = `${num(r.indice)}`',
      '$('+"'exibido'"+').innerHTML = `51`'],
    acusa: /o exibido sai de r\.indice/,
  },
  {
    teste: 'a tela não tem régua própria — ela pergunta à Torre',
    porque: 'a tela volta a normalizar por conta própria, como a versão anterior fazia',
    quebra: ['indice-semente.html', 'const r = varrer({ varredura: V, hoje: HOJE });',
      'const r = varrer({ varredura: V, hoje: HOJE }); const x = Math.log(2);'],
    acusa: /a tela voltou a calcular/,
  },
  {
    teste: 'a tela diz, onde o número aparece, que o Índice não dispara decisão',
    porque: 'a faixa volta a trazer recomendação de aporte, como na versão anterior',
    quebra: ['indice-semente.html', 'intensidade dentro do estado', 'Plantio · aporte integral'],
    acusa: /a tela voltou a disparar decisão/,
  },
  {
    teste: 'as duas contagens de extremo aparecem separadas',
    porque: 'a tela passa a mostrar só o total, e some com "os que importam"',
    quebra: ['indice-semente.html', 'card('+"'Que importam'"+', num(e.provisoriosQueImportam)',
      'card('+"'Que importam'"+', num(e.provisorios)'],
    acusa: /a tela não mostra provisoriosQueImportam/,
  },
  {
    teste: 'os números da tela do Índice saem da constante',
    porque: 'a trava do terço volta a ser escrita à mão',
    quebra: ['indice-semente.html', 'passarem de <b>${num(TRAVA_AUSENCIA_NA_CAMADA * 100)}%</b>',
      'passarem de <b>33%</b>'],
    acusa: /devia sair de TRAVA_AUSENCIA_NA_CAMADA/,
  },
  {
    teste: 'a suspensão da camada 5 nomeia o ativo e a data',
    porque: 'o prefixo duplicado "por tese tese vencida" volta ao módulo',
    quebra: ['torre/torre.mjs', 'camada 5 suspensa: degrau de ${suspensao.ativo} ${suspensao.razao}',
      'camada 5 suspensa por tese ${suspensao.razao} em ${suspensao.ativo}'],
    acusa: /o prefixo duplicado voltou/,
  },
];

const rodar = (nome) => {
  try {
    execFileSync('node', ['--test', '--test-name-pattern', nome, arq('redacao.test.mjs')],
      { encoding: 'utf8', stdio: 'pipe' });
    return { falhou: false, saida: '' };
  } catch (e) {
    return { falhou: true, saida: (e.stdout ?? '') + (e.stderr ?? '') };
  }
};

/** D47 B: a frase que o assert produziu — é ela que diz QUAL asserção acusou. */
const mensagemDaFalha = (saida) => {
  const m = saida.match(/error: \|-\n((?:\s+.*\n)+)/);
  if (!m) return (saida.match(/error: '([^']+)'/) ?? [, ''])[1].trim();
  return m[1].split('\n').map((l) => l.trim()).filter(Boolean)
    .filter((l) => !/^[+\-]|^actual|^expected|^\.\.\.$/.test(l))[0] ?? '';
};

let ok = 0, ruim = 0;
console.log('D45 · provando que cada teste de conferência reprova quando deve\n');

for (const p of PROVAS) {
  const [ficheiro, de, para] = p.quebra;
  const caminho = arq(ficheiro);
  const original = readFileSync(caminho, 'utf8');
  let veredito;
  try {
    const ocorrencias = original.split(de).length - 1;
    if (ocorrencias === 0) {
      veredito = { ok: false, nota: `o trecho a quebrar não existe mais em ${ficheiro}` };
    } else if (ocorrencias > 1 && !p.todas) {
      // D47 A: mira ambígua. Mutar uma de várias deixa gêmeo de pé.
      veredito = { ok: false, nota:
        `MIRA ERRADA — o trecho aparece ${ocorrencias} vezes em ${ficheiro}. ` +
        'Ou se escolhe um ponto único, ou se declara todas: true e mutam-se todas de uma vez.' };
    } else {
      writeFileSync(caminho, p.todas ? original.replaceAll(de, para) : original.replace(de, para));
      const r = rodar(p.teste);
      const msg = mensagemDaFalha(r.saida);
      veredito = !r.falhou
        ? { ok: false, nota: 'o teste PASSOU com o arquivo quebrado — ele não pega o que devia' }
        : !p.acusa.test(r.saida)
        ? { ok: false, nota: `ACUSOU OUTRA COISA — a asserção que pegou foi «${msg}», e não ${p.acusa}. ` +
            'A regra que esta prova queria demonstrar segue sem prova.' }
        : { ok: true, nota: `acusou: «${msg}»`, mutadas: ocorrencias };
    }
  } finally {
    writeFileSync(caminho, original);   // desfaz sempre, dê no que der
  }
  const antes = readFileSync(caminho, 'utf8');
  if (antes !== original) veredito = { ok: false, nota: 'a prova deixou rastro no arquivo' };
  console.log(`${veredito.ok ? '✅' : '❌'} ${p.teste}`);
  console.log(`   quebrei: ${ficheiro} — ${JSON.stringify(de).slice(0, 68)}` +
    (veredito.mutadas > 1 ? ` (${veredito.mutadas} ocorrências)` : ''));
  console.log(`   porque:  ${p.porque}`);
  console.log(`   ${veredito.nota}\n`);
  veredito.ok ? ok++ : ruim++;
}

console.log(`${ok} provados · ${ruim} sem prova`);
process.exit(ruim ? 1 : 0);
