# APPROVAL: Ciclo 2026-07-28-medo-exagerado-01

STATUS: pending

<!--
  GATE 2: INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
  Em caso de dúvida, o ciclo para aqui (regra de segurança do CLAUDE.md).
  Veredito do GATEKEEPER: PASS (apos correcao da copy, ver abaixo). Aguarda o Gate 2 do Mr. G.
-->

## Resumo
- **Formato:** thread educativa contrarian (4 tweets + reply). Tese 1, 28/07.
- **Indicador:** MVRV por coorte (MVRV-STH âncora, MVRV-LTH contexto). Sem indicador externo.
- **Ângulo:** o medo da rua está exagerado frente aos dados onchain. Há medo (mood qualitativo), mas o estrago é leve: STH ~6% abaixo do custo (MVRV-STH 0,937) e LTH no lucro sem vender (MVRV-LTH 1,28). O medo é do pequeno, não das mãos fortes.
- **Número-chave:** MVRV-STH 0,937 (27/07) · MVRV-LTH 1,28
- **Correção aplicada (28/07):** removida a citação ao Fear & Greed (era indicador externo sem definição em indicators.md). Mesma tese; o medo fica qualitativo e só indicadores onchain definidos são citados. Instrução do operador: usar a mesma tese, corrigir para ser aprovado.
- **Fonte dos números:** 00_data.json (leitura manual do terminal VantageNode)

## Thread (corpo, sem link)

**T1** (91)
```
Todo mundo está com medo hoje. Mas olha o que os donos do Bitcoin estão fazendo de verdade.
```
**T2** (148)
```
O preço caiu e bateu medo. Só que o estrago é pequeno: quem comprou faz pouco tempo está só uns 6% abaixo do que pagou. Um tropeço, não um desastre.
```
**T3** (140)
```
E quem segura Bitcoin há muito tempo? Continua no lucro e não vendeu nada. O medo está na cabeça do pequeno investidor, não nas mãos fortes.
```
**T4** (167)
```
Resumo: a rua com medo, os dados só de ressaca leve. Nem todo susto no preço é fundo do poço. Você acha que é exagero ou tem mais chão pela frente? Não é recomendação.
```

## Primeiro reply (com o link)
```
MVRV dos short-term holders em 0,937 (abaixo de 1 = novatos no leve prejuízo), MVRV dos long-term holders em 1,28 (veteranos no lucro). Leitura no terminal: vantagenode.io
```

## Veredito do GATEKEEPER: PASS (após correção da copy)

> Auditoria inicial deu BLOCK na invariante 9 (Fear & Greed citado sem definição em `indicators.md`). O operador optou por **corrigir a copy** (mesma tese, sem citar o indicador externo) em vez de expandir o rulebook. Com a correção, a invariante 9 fica **ok** e o veredito passa a **PASS**. Segue para o Gate 2 humano.

Checklist dos 9 invariantes:

| # | Invariante | Status | Nota |
|---|---|---|---|
| 1 | 1 post = 1 ideia | ok | Uma tese (medo vs dados). Medo qualitativo + MVRV-STH/LTH servem à mesma ideia. |
| 2 | KPI = bookmark | ok | Leitura de referência. Ressalva: T4 fecha com pergunta de engajamento (retail). |
| 3 | Link fora do corpo | ok | Corpo sem link; vantagenode.io só no reply. |
| 4 | Gráfico com leitura | ok | Copy interpreta o MVRV-STH. Print pendente de captura. |
| 5 | Contra-consenso sem irresponsabilidade | ok (cautela) | Sem previsão/promessa; "Não é recomendação" presente. "tem mais chão pela frente?" beira preço, mas é pergunta ao leitor, não afirmação. |
| 6 | Número texto = gráfico = fonte | ok (condicional) | Texto = fonte confere (0,937 / 1,28 / ~6%). **Conferir o print:** último ponto deve ler ~0,937 (27/07), não 0,969 (26/07). |
| 7 | Gate humano intacto | ok | STATUS pending; nenhuma auto-aprovação. |
| 8 | Sem emoji/hype/jargão/travessão | ok | Zero de tudo, verificado. Voz acessível forte. |
| 9 | Indicador válido/definido | ok | **Resolvido:** citação ao Fear & Greed removida; só MVRV-STH/LTH (definidos). Ver abaixo. |

### Correção da invariante 9 (era o bloqueio)
A copy original citava **Fear & Greed** (parêntese do T2 e prefixo do reply), um índice de **sentimento externo (off-chain)** sem definição em `knowledge/indicators.md`. Por decisão do operador ("não podemos violar, usar a mesma tese e corrigir para ser aprovado"), a citação foi **removida**: o medo passa a ser **mood qualitativo** (T1/T2/T4) e os únicos números citados são **MVRV-STH (0,937)** e **MVRV-LTH (1,28)**, ambos definidos em `indicators.md`. A tese contrarian segue idêntica. Nada foi adicionado ao `indicators.md` (marca segue onchain-pura).

### Reconciliação de números (texto = gráfico = fonte)
- uns 6%: = 1 − 0,937 = 6,3% ✅ (aprox. honesta com "uns").
- MVRV-STH 0,937: texto = fonte ✅ · **gráfico: pendente (~0,937 a conferir no print)**.
- MVRV-LTH 1,28: texto = fonte ✅.
- (Fear & Greed 29: removido da copy, não há mais número externo a reconciliar.)

### Teste da amiga (linguagem acessível)
**Passa com folga.** Traduz tudo sem jargão: "os donos do Bitcoin", "quem comprou faz pouco tempo está uns 6% abaixo do que pagou", "mãos fortes", "a rua com medo, os dados só de ressaca leve". Uma pessoa leiga entende a tese sem saber o que é MVRV.

### Conferência do print (visual-identity.md)
`02_chart.png` **ainda não está no repo** (pendente de captura). Ao anexar, deve seguir o FORMATO OFICIAL (visual-identity.md + data-sourcing.md): print real do terminal, breadcrumb `MVRV · STH` visível, gráfico completo no quadro, marca d'água VANTAGENODE, sem toolbar de desenho nem aba lateral, range 5Y/ALL. **Além do formato, o último ponto tem de ler ~0,937** (fechamento 27/07), não 0,969.

## Decisão do Mr. G
Edite o campo `STATUS:` no topo:
- `approved` → libera o BROADCAST a publicar.
- `revise`   → devolve ao pipeline; escreva a nota abaixo.
- `rejected` → descarta o ciclo.

**Nota (opcional):**

---
_Gráfico do ciclo: 02_chart.png = print real da série MVRV-STH (último ponto ~0,937), a capturar. Ver 02_chart_meta.json._
