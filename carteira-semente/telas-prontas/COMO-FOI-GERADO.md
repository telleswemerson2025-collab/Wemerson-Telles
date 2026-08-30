# COMO ESTA PASTA É GERADA
*Não edite os `.html` daqui. Eles são saída, não fonte.*

As telas do pacote carregam módulos (`<script type="module">`), e o navegador **bloqueia módulo em
`file://`**: por dois cliques a página abre com o desenho certo e os **números vazios**, sem erro
visível. Servir resolve — e é o que `COMO-ABRIR.md` explica —, mas exige terminal.

Esta pasta existe para quem não vai abrir terminal. Cada tela vira **um arquivo só**, com o módulo
embutido e sem `type="module"`, e passa a funcionar por dois cliques.

```bash
npx esbuild --version          # qualquer versão recente serve
node ferramentas/empacota.mjs  # regenera telas-prontas/ a partir das telas
```

**O HTML não é reescrito** — só o bloco do script é trocado pelo pacote embutido. Fonte e saída
mostram exatamente a mesma coisa, e isso foi conferido abrindo as cinco pelos dois caminhos:
servidas e por `file://`, com o mesmo conteúdo renderizado e **zero erro de página** nos dois.

⚠️ **Toda vez que uma tela ou um módulo mudar, esta pasta precisa ser regenerada.** Ela é uma cópia
congelada, e cópia congelada envelhece calada — o mesmo risco que o histórico publicado tem, e que
lá é resolvido por registro. Aqui é resolvido regerando.
