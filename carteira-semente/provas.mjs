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
    teste: 'os pesos renormalizados no briefing batem com os do código',
    porque: 'o peso renormalizado escrito à mão descola do PESOS do código',
    quebra: ['00-BRIEFING-CODE.md', 'renormalizados por 88 (38,6', 'renormalizados por 88 (39,6'],
    acusa: /peso renormalizado 38,6 da camada 1 sumiu/,
  },
  {
    teste: 'os fatores de velocidade da D25 B estão escritos como o código os usa',
    porque: 'um fator de velocidade é recalibrado no código e o documento não acompanha',
    quebra: ['01-documento-mae.md', 'Mercado saudável **1,50**', 'Mercado saudável **1,60**'],
    acusa: /não liga Mercado saudável ao fator 1,50/,
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

let ok = 0, ruim = 0;
console.log('D45 · provando que cada teste de conferência reprova quando deve\n');

for (const p of PROVAS) {
  const [ficheiro, de, para] = p.quebra;
  const caminho = arq(ficheiro);
  const original = readFileSync(caminho, 'utf8');
  let veredito;
  try {
    if (!original.includes(de)) {
      veredito = { ok: false, nota: `o trecho a quebrar não existe mais em ${ficheiro}` };
    } else {
      writeFileSync(caminho, original.replace(de, para));
      const r = rodar(p.teste);
      veredito = !r.falhou
        ? { ok: false, nota: 'o teste PASSOU com o arquivo quebrado — ele não pega o que devia' }
        : !p.acusa.test(r.saida)
        ? { ok: false, nota: `falhou, mas não pela razão certa — a mensagem não bate com ${p.acusa}` }
        : { ok: true, nota: 'acusou, com a linha e o valor esperado' };
    }
  } finally {
    writeFileSync(caminho, original);   // desfaz sempre, dê no que der
  }
  const antes = readFileSync(caminho, 'utf8');
  if (antes !== original) veredito = { ok: false, nota: 'a prova deixou rastro no arquivo' };
  console.log(`${veredito.ok ? '✅' : '❌'} ${p.teste}`);
  console.log(`   quebrei: ${ficheiro} — ${JSON.stringify(de).slice(0, 72)}`);
  console.log(`   porque:  ${p.porque}`);
  console.log(`   ${veredito.nota}\n`);
  veredito.ok ? ok++ : ruim++;
}

console.log(`${ok} provados · ${ruim} sem prova`);
process.exit(ruim ? 1 : 0);
