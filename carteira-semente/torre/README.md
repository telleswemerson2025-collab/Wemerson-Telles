# PEÇA 2 — TORRE DE CONTROLE
Conferência. Versão 1.0 · 29/08/2026

**Não é aprovação de código. É conferir se o que foi escrito é o que a decisão diz.**

- `torre.mjs` — o módulo. Sem dependências. Lê o registro da peça 1, não guarda nada.
- `leitura-29-08-2026.mjs` — as catorze leituras reais do documento 07, transcritas.
- `torre.test.mjs` — 29 testes da Torre (78 no pacote inteiro). `node --test` na raiz.

## ⭐ ITEM 5 — O TESTE QUE PROVA A LEITURA DE 29/08/2026
Entrada: as catorze leituras reais do `07-leituras-29-08-2026.md`, com mínimas e
máximas do range ALL. Saída do módulo:

```
índice 50.7540 · exibido 51 · Equilíbrio · Mercado saudável
  camada 1: 44.41 · peso 38.6%
  camada 2: 60.27 · peso 29.5%
  camada 3: 50.88 · peso 18.2%
  camada 4: 47.94 · peso 13.6%
  fora: 5 (sem carteira ativa)
  ETF: 54.97 -> 52.61 · confiança 0.526
```

Bate com o `03-indice-semente.md` em todos os números: **50,75 · Equilíbrio**, as
quatro camadas, os quatro pesos renormalizados e o amortecimento do ETF.

Testes: *"as catorze leituras reais devolvem 50,75"* · *"cada camada bate com o
documento 03"* · *"a camada 5 fica fora e os pesos renormalizam sobre 0,88"*.

## ITEM 1 — NORMALIZAÇÃO POR FAIXA PRÓPRIA
`normalizar(valor, min, max, escala, invertido)`, com a escala declarada em
`SERIES` por indicador.

| Prova | Teste |
|---|---|
| Log na multiplicativa: MVRV 1,465 dá **44,4**; linear daria **14,5** | *"log para série multiplicativa, linear para aditiva"* |
| Linear na aditiva: Supply in Profit 67,4 dá 49,4 | idem |
| DXY e Fed Funds invertidos: 63,7 vira **36,3** | *"DXY e Fed Funds entram invertidos"* |
| Valor fora da faixa é **limitado**, não extrapolado | *"valor fora da faixa histórica é limitado"* |
| Confiança amortece só a série curta — hoje só o ETF | *"o fator de confiança amortece só a série curta"* |

A diferença entre log e linear no MVRV é de **30 pontos** na mesma leitura. É o
lugar onde a Torre erraria em silêncio e ninguém veria.

## ITEM 2 — RENORMALIZAÇÃO E AUSÊNCIAS
| Prova | Teste |
|---|---|
| Ausência nomeada uma a uma, com a camada de cada uma | *"ausência é nomeada uma a uma"* |
| Indicador zerado ou com traço é **ausência**, não zero | *"indicador zerado ou com traço é ausência"* |
| Camada incompleta sai inteira; pesos renormalizam sobre o que voltou | *"camada incompleta sai inteira"* |
| A entrega diz quais camadas entraram e quais ficaram fora, com motivo | idem, e `camadasForaDaConta` |
| Sem nenhuma camada inteira, não há índice — e o motivo vem junto | *"sem nenhuma camada inteira, não há índice"* |

**Camada incompleta sai inteira, e isso é escolha.** O `09-ritual-operacional.md`
diz "o Índice é calculado só sobre as **camadas** que voltaram". Tirar a média só
do que voltou dentro de uma camada substituiria o indicador que falta pela média
do resto — o default silencioso que a invariante 3 proíbe. **Esta questão foi
levantada na conferência do 09 e nunca decidida**; implementei a leitura literal
e a não-presumidora. Segue sendo sua.

## ITEM 3 — CAMADA 5 SUSPENSA POR INTEIRO (D21 B)
| Prova | Teste |
|---|---|
| BTC ou ETH **vencido** suspende, com ativo e data no texto | *"BTC vencido suspende a camada 5 inteira"* |
| BTC **nunca atribuído** suspende igual — não é ausência diluída | *"BTC sem degrau nenhum também suspende"* |
| A suspensão entra como camada fora, e os pesos renormalizam | *"a suspensão entra no índice como camada fora"* |
| Com degraus vigentes: média ponderada pela posição (D17 B) | *"a camada 5 é média ponderada pela posição"* |
| Trava dos 30%, contando só quem não é BTC nem ETH (D17 C · D21 B) | *"a trava dos 30% derruba a camada"* |
| 24% sem degrau ainda cabe | *"três ativos sem degrau ainda cabem na trava"* |

## ITEM 4 — COMPOSIÇÃO DA CRM ILEGÍVEL CONGELA O UNIVERSO
| Prova | Teste |
|---|---|
| Congela no último estado conhecido, com `desatualizadaDesde` | *"ilegível congela o universo no último estado"* |
| A ilegibilidade **também é gravada** — não é silêncio | idem, `evento.legivel === false` |
| Sem leitura anterior nenhuma, não inventa universo | *"ilegível sem nenhuma leitura anterior"* |
| Incluídos e removidos, com o filtro aplicado na hora | *"incluídos e removidos, com o filtro"* |
| "Nada mudou" sai como nada mudou | *"nada mudou sai como nada mudou"* |

## O QUE APARECEU AO ESCREVER

### 1. O Filtro de Horizonte não é automatizável — três das quatro alíneas são julgamento
A D16 B manda cada incluído passar pelo Filtro "na hora". Das quatro alíneas da
D15, **só a (b)** é mecânica — atravessou um ciclo, ou é BTC ou ETH. As outras
três são julgamento:

| Alínea | Por quê |
|---|---|
| (a) liquidez suficiente para sair sem derrubar preço | não há limiar definido |
| (c) tese que não dependa de evento datado | leitura de tese |
| (d) não alavancado, sintético, nem contraparte concentrada | classificação |

Implementado assim: o ativo fica **PENDENTE** até haver julgamento, e **nenhum
evento de filtro nasce**. Aprovar por omissão seria o default silencioso; reprovar
por omissão barraria ativo bom sem razão. A Torre entrega o pendente nomeado, com
as alíneas que faltam, para o humano decidir.

**Consequência:** a varredura da CRM não fecha sozinha. Todo ativo novo trava até
alguém julgar três alíneas — o que está certo, mas significa que o ritual diário
tem um passo humano que o documento 09 não descreve.

### 2. A confiança é medida até hoje, não até a data do indicador
O ETF fecha com dois dias de atraso. Medindo a janela até `hoje` (29/08) em vez de
até a data do dado (27/08), a confiança sai 0,5262 em vez de 0,5250 — e o
ajustado, 52,617 em vez de 52,609. **Diferença de 0,008 ponto**, nula no índice.
Escolhi `hoje` por ser um relógio só para as catorze séries. Fica dito.

### 3. A Torre não classifica estação, e há teste disso
`r.estacao` é `undefined` por construção, e `semRecomendacao` sai `true` em toda
entrega. A estação vem do Índice de Plantio, que é peça 3.

## NENHUM PARÂMETRO NOVO NASCEU
Todos os números vêm das decisões: pesos 34·26·16·12·12 (D03), faixas de 20 em 20
(D03 · D02), confiança sobre 5 anos (D7), trava de 30% (D17 C), validade de 180
dias (D18), 65 como limiar (D9 · D10). Nada a submeter aos quatro critérios.
