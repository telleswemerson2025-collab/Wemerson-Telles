// Gera as telas AUTÔNOMAS de `telas-prontas/`: um arquivo por tela, sem módulo e sem
// servidor, para quem não vai abrir terminal.
//
//   node carteira-semente/ferramentas/empacota.mjs [saída] [caminho do esbuild]
//
// O HTML NÃO é reescrito: só o bloco `<script type="module">` é trocado pelo pacote
// embutido. Fonte e saída mostram a mesma coisa, e isso se confere abrindo as cinco
// pelos dois caminhos — servidas e por file://.
//
// ⚠️ Saída é cópia congelada: mudou tela ou módulo, roda de novo.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const SAIDA = process.argv[2] ?? join(RAIZ, 'telas-prontas');
const TMP = join(RAIZ, '.empacota-tmp');   // dentro da raiz: os imports são relativos a ela
mkdirSync(SAIDA, { recursive: true });   // não apaga a pasta: LEIA-ME e COMO-FOI-GERADO moram nela
mkdirSync(TMP, { recursive: true });

const TELAS = ['simulador.html', 'indice-semente.html', 'aporte-do-mes.html',
  'registro-de-ciclo.html', 'linha-dagua-mercado.html'];

for (const tela of TELAS) {
  let html = readFileSync(join(RAIZ, tela), 'utf8');
  const abre = html.indexOf('<script type="module">');
  if (abre === -1) {                       // linha-dagua não usa módulo
    writeFileSync(join(SAIDA, tela), html);
    console.log(tela, '· sem módulo, copiado como está');
    continue;
  }
  const inicio = abre + '<script type="module">'.length;
  const fim = html.indexOf('</script>', inicio);
  const codigo = html.slice(inicio, fim);
  const entrada = join(TMP, tela.replace('.html', '.mjs'));
  // A entrada mora um nível abaixo da raiz; os './' do HTML viram '../'.
  writeFileSync(entrada, codigo.replace(/from '\.\//g, "from '../"));
  const saida = join(TMP, tela.replace('.html', '.bundle.js'));
  execFileSync(process.argv[3] ?? 'esbuild', ['--bundle', entrada, '--format=iife', '--outfile=' + saida,
    '--charset=utf8', '--log-level=warning'], { cwd: RAIZ, stdio: 'inherit' });
  const bundle = readFileSync(saida, 'utf8');
  html = html.slice(0, abre) + '<script>\n' + bundle + '\n' + html.slice(fim);
  writeFileSync(join(SAIDA, tela), html);
  console.log(tela, '·', Math.round(bundle.length / 1024) + ' kB embutidos');
}
rmSync(TMP, { recursive: true, force: true });
