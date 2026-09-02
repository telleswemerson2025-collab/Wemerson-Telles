# BACKTEST — Tese Insider ("Dinheiro de Dentro")

Teste da tese antes de construir o produto: compras de insiders em mercado
aberto, pontuadas por um Índice de Convicção, geram excesso de retorno sobre
o SPY?

## PRÉ-REGISTRO (travado ANTES de rodar qualquer número)

Data do pré-registro: 2026-09-02. Nada abaixo muda depois de ver resultado.

### Período
Filings de Form 4 de 2024-01-01 até o último trimestre publicado pela SEC
(2024Q1 em diante). Janela decidida antes do teste.

### Amostra
- Fonte: SEC DERA "Insider Transactions Data Sets" (form345, TSV trimestral).
- Somente `DOCUMENT_TYPE = 4` (amendments 4/A excluídos — corrigem/duplicam).
- Somente tabela não-derivativa, `TRANS_CODE = P` e `TRANS_ACQUIRED_DISP_CD = A`
  (compra em mercado aberto). Códigos A, M, F, G, S e demais: fora.
- Preço e quantidade > 0. Valor agregado por filing ≥ US$ 5.000 (corta ruído).
- Unidade de análise: 1 filing (ACCESSION_NUMBER) = 1 operação. Transações P
  do mesmo filing são somadas.
- Tickers sem cotação disponível (OTC, fundos, símbolo inválido) são
  descartados e a contagem reportada.

### Índice de Convicção (0–100), pesos fixos

1. **Natureza da operação — peso 30.** Compra em mercado aberto = 30.
   (Qualquer outra coisa nem entra na amostra.)
2. **Cargo — peso 25.** Pelo campo relationship/título do Form 4:
   CEO ou CFO = 25 · outro officer (COO, President, EVP...) = 18 ·
   conselho (director/chairman sem cargo executivo) = 12 ·
   acionista ≥10% = 8 · "other" = 6. Vale o maior papel aplicável.
3. **Tamanho relativo — peso 20.** Remuneração anual não existe nos arquivos
   form345, então usa-se o método alternativo previsto na tese, SEMPRE
   MARCADO COMO ESTIMADO: percentil do valor da compra dentro da
   distribuição histórica de compras P da própria empresa no período
   (pontos = percentil × 20). Empresa com < 3 compras no período: percentil
   contra a distribuição global.
4. **Compra em grupo — peso 15.** Nº de insiders distintos (CIK) com compra P
   no mesmo emissor nos 30 dias corridos até a data da transação, inclusive:
   1 = 5 · 2 = 10 · 3 = 13 · ≥4 = 15.
5. **Contexto — peso 10.** Posição do fechamento do dia do filing dentro do
   min–max dos 90 dias corridos anteriores (fechamentos estritamente
   anteriores): pontos = (1 − posição) × 10. Compra no fundo = 10, na máxima
   = 0. Menos de 30 pregões de histórico → 5 (neutro, marcado).

### Execução do teste
- Entrada: fechamento do 1º pregão APÓS a data do filing (nunca o preço do
  dia da compra do insider — esse o cliente não teria).
- Janelas: 30, 90, 180 e 365 dias corridos; saída no fechamento do 1º pregão
  ≥ entrada + N dias. Janela que ultrapassa o último pregão disponível é
  descartada só naquela janela.
- Benchmark: SPY nas MESMAS datas de entrada e saída. Métrica principal:
  excesso = retorno do ticker − retorno do SPY.
- Universo do teste: Índice > 60. Controle: Índice < 40. Faixas: 60–70,
  70–80, 80–90, >90.
- Tamanho de empresa: market cap não está nos arquivos; proxy pré-definido =
  volume financeiro mediano (fech.×volume) dos 90 dias antes da entrada, em
  tercis, rotulado como proxy de tamanho/liquidez.
- Pior sequência: (a) maior sequência consecutiva de operações (ordem de
  entrada) com excesso < 0, por janela; (b) coortes mensais pela data de
  entrada com excesso médio de 90d e a pior sequência de meses negativos.

### Cotações
Diárias ajustadas (Stooq como fonte primária, Yahoo Finance como fallback),
de 2023-09-01 até hoje, para todos os tickers da amostra + SPY.

## Como rodar

```bash
cd backtest-insider
pip install pandas numpy requests
./run_all.sh "Seu Nome seu-email@dominio.com"   # User-Agent exigido pela SEC
```

Etapas (podem ser rodadas separadas):
1. `python3 download_sec.py --ua "Nome email"` — baixa os zips trimestrais.
2. `python3 build_signals.py` — filtra código P, monta o índice parcial,
   emite `out/signals.csv` e `out/tickers.txt`.
3. `python3 download_prices.py` — baixa cotações (tickers + SPY).
4. `python3 backtest.py` — contexto, índice final, retornos, faixas,
   controle, tercis, sequências; emite `out/report.md` e CSVs.

`python3 test_synthetic.py` valida a matemática do índice e do backtest com
dados fabricados (roda sem rede).

## Requisito de rede

O ambiente precisa alcançar `www.sec.gov`, `stooq.com` e
`query1.finance.yahoo.com`. No Claude Code web: Settings → Environments →
(este ambiente) → Network access → liberar esses domínios ou acesso total.

## Referência acadêmica para calibrar expectativa

Cohen, Malloy & Pomorski (JF 2012): compras de insiders oportunistas ≈ 82 bps
de retorno anormal/mês (1986–2007); rotineiros ≈ zero. Estudos recentes:
efeito persiste, previsibilidade decai entre 6 e 12 meses — daí as 4 janelas.
