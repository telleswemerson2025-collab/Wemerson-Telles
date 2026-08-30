# COMO ABRIR AS TELAS
*Item 9 do Gate 2 — nenhuma tela é dada por pronta sem ser aberta e lida.*

## ⚠️ PRIMEIRO, O QUE DÁ ERRADO
**Não abra os arquivos com dois cliques.** Quatro das cinco telas carregam módulos com
`<script type="module">`, e o navegador **bloqueia módulo em `file://`** por política de origem. A
página abre, o desenho aparece, e **os números não** — fica tudo em travessão, sem erro visível
para quem não abriu o console.

Elas precisam ser **servidas** por um servidor local. É uma linha.

## O COMANDO
Abra o terminal **na pasta que contém `carteira-semente`** e rode:

```bash
python3 -m http.server 8765
```

Deixe rodando. Enquanto essa janela estiver aberta, o servidor está de pé.

*Se não houver Python:* `npx serve -l 8765` funciona igual (pede confirmação na primeira vez).

## OS ENDEREÇOS
Com o servidor de pé, abra no navegador:

| Tela | Endereço | O que ela mostra |
|---|---|---|
| **Simulador** | http://localhost:8765/carteira-semente/simulador.html | a projeção, a capa, a deriva e o salto |
| **Índice Semente** | http://localhost:8765/carteira-semente/indice-semente.html | o composto de 0 a 100 e a fila de extremos |
| **Aporte do mês** | http://localhost:8765/carteira-semente/aporte-do-mes.html | a modulação e as sete travas do Reforço |
| **Registro de ciclo** | http://localhost:8765/carteira-semente/registro-de-ciclo.html | o marco, os acionamentos e o log inteiro |
| Linha d'Água | http://localhost:8765/carteira-semente/linha-dagua-mercado.html | o gráfico de estado (não usa módulo) |

Para encerrar: **Ctrl+C** na janela do terminal.

## O QUE OLHAR EM CADA UMA
Não é "ver se abre" — é conferir o que a tela afirma.

**Simulador.** O número de capa é o **piso** (R$ 75.335), não a leitura do dia; a leitura do dia
está em segunda linha, **rotulada**. O bloco do topo mostra o par inteiro: estado, índice, fase e
mês de entrada. Clique em *"Ver a tela sem leitura da Linha d'Água"* — a projeção tem de
**desaparecer**, com o motivo nomeado, e não virar um valor padrão. Mude a partida no seletor: a
tela tem de marcar **simulação hipotética** e a segunda linha continuar sendo a do dia.

**Índice Semente.** O número grande é o **exibido** (51) e o valor interno (50,7536) aparece embaixo.
A camada 5 tem de estar rotulada **fora**, nunca desenhada valendo 50.

**Aporte do mês.** As sete travas aparecem **todas**, passem ou não. A sétima é o Gate, em cor
própria, e **nunca passa**.

**Registro de ciclo.** O log inteiro, em ordem, **sem filtro**. O exemplo é rotulado como ilustrativo.

## SE OS NÚMEROS NÃO APARECEREM
É quase sempre uma destas três:

1. **Abriu por dois cliques** (`file://` na barra) em vez de `http://localhost:8765`.
2. **O terminal foi aberto na pasta errada.** O endereço tem `/carteira-semente/` no meio: o
   servidor precisa estar na pasta **acima** dela.
3. **A porta 8765 já estava ocupada.** Troque o número nos dois lugares — no comando e no endereço.

As fontes vêm da internet; sem conexão a página fica com a fonte do sistema e **os números
continuam certos**. Isso não é defeito.
