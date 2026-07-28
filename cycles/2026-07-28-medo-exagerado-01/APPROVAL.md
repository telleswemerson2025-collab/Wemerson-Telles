# APPROVAL: Ciclo 2026-07-28-medo-exagerado-01

STATUS: pending

<!--
  GATE 2: INVIOLÁVEL (invariante 7).
  Somente o Mr. G altera STATUS para: approved | revise | rejected
  Nenhum agente marca 'approved' em nome do humano. O BROADCAST (05) só publica com STATUS: approved.
  Em caso de dúvida, o ciclo para aqui (regra de segurança do CLAUDE.md).
  Veredito do GATEKEEPER: BLOCK (invariante 9). Ver abaixo.
-->

## Resumo
- **Formato:** thread educativa contrarian (4 tweets + reply). Tese 1, 28/07.
- **Indicador:** MVRV por coorte (MVRV-STH âncora, MVRV-LTH contexto) + Fear & Greed (externo, ver bloqueio).
- **Ângulo:** o medo da rua está exagerado frente aos dados onchain. Sentimento em medo (Fear & Greed 29), mas estrago leve: STH ~6% abaixo do custo (MVRV-STH 0,937) e LTH no lucro sem vender (MVRV-LTH 1,28). O medo é do pequeno, não das mãos fortes.
- **Número-chave:** MVRV-STH 0,937 (27/07) · MVRV-LTH 1,28 · Fear & Greed 29
- **Fonte dos números:** 00_data.json (leitura manual do terminal VantageNode)

## Thread (corpo, sem link)

**T1** (91)
```
Todo mundo está com medo hoje. Mas olha o que os donos do Bitcoin estão fazendo de verdade.
```
**T2** (198)
```
O preço caiu e bateu medo (o termômetro do mercado marcou 29, zona de medo). Só que o estrago é pequeno: quem comprou faz pouco tempo está só uns 6% abaixo do que pagou. Um tropeço, não um desastre.
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
Fear & Greed em 29 (medo), MVRV dos short-term holders em 0,937 (abaixo de 1 = novatos no leve prejuízo), MVRV dos long-term holders em 1,28 (veteranos no lucro). Leitura no terminal: vantagenode.io
```

## Veredito do GATEKEEPER: BLOCK

Checklist dos 9 invariantes:

| # | Invariante | Status | Nota |
|---|---|---|---|
| 1 | 1 post = 1 ideia | ok | Uma tese (medo vs dados). Os 3 números servem à mesma ideia. |
| 2 | KPI = bookmark | ok | Leitura de referência. Ressalva: T4 fecha com pergunta de engajamento (retail). |
| 3 | Link fora do corpo | ok | Corpo sem link; vantagenode.io só no reply. |
| 4 | Gráfico com leitura | ok | Copy interpreta o MVRV-STH. Print pendente de captura. |
| 5 | Contra-consenso sem irresponsabilidade | ok (cautela) | Sem previsão/promessa; "Não é recomendação" presente. "tem mais chão pela frente?" beira preço, mas é pergunta ao leitor, não afirmação. |
| 6 | Número texto = gráfico = fonte | ok (condicional) | Texto = fonte confere (29 / 0,937 / 1,28 / ~6%). **Conferir o print:** último ponto deve ler ~0,937 (27/07), não 0,969 (26/07). |
| 7 | Gate humano intacto | ok | STATUS pending; nenhuma auto-aprovação. |
| 8 | Sem emoji/hype/jargão/travessão | ok | Zero de tudo, verificado. Voz acessível forte. |
| 9 | Indicador válido/definido | **VIOLAÇÃO** | **Fear & Greed citado sem definição em indicators.md.** Ver abaixo. |

### Motivo do bloqueio (invariante 9)
A copy cita **Fear & Greed** (T2 como "termômetro do mercado marcou 29" e nomeado no reply). Fear & Greed **não tem definição em `knowledge/indicators.md`** e é um índice de **sentimento externo (off-chain)**, fora do escopo onchain da VantageNode. A regra de `indicators.md` é dura: indicador sem definição no arquivo, o ciclo não passa.

Ressalva importante: F&G **não é** proprietário nem fabricado (é público/auditável, ao contrário das Categorias A/B de `indicators.md`). O bloqueio é de **documentação/escopo**, não de dado inventado.

**Como destravar (o Mr. G decide, eu não reescrevo a copy):**
1. **Adicionar uma entrada de Fear & Greed em `indicators.md`** (definição pública/auditável) + decidir se a marca cita sentimento externo. Isso torna o uso conforme e vira `pass`; ou
2. **Aprovar assumindo a pendência** (marcar `approved` cientes de que F&G ainda não está no `indicators.md`); ou
3. **`revise`** para remover/ajustar a menção a Fear & Greed.

### Reconciliação de números (texto = gráfico = fonte)
- Fear & Greed 29: texto = fonte ✅ (não plotado no gráfico).
- uns 6%: = 1 − 0,937 = 6,3% ✅ (aprox. honesta com "uns").
- MVRV-STH 0,937: texto = fonte ✅ · **gráfico: pendente (~0,937 a conferir no print)**.
- MVRV-LTH 1,28: texto = fonte ✅.

### Teste da amiga (linguagem acessível)
**Passa com folga.** Traduz tudo sem jargão: "os donos do Bitcoin", "termômetro do mercado", "quem comprou faz pouco tempo está uns 6% abaixo do que pagou", "mãos fortes", "a rua com medo, os dados só de ressaca leve". Uma pessoa leiga entende a tese sem saber o que é MVRV.

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
