# AGENTES DO SISTEMA CARTEIRA SEMENTE
Especificação para implementação. Cada agente tem entrada, saída e limite definidos.
Versão 1.1 · 29/08/2026 — Decisões 1 e 2 aplicadas.

---

## 1. TORRE DE CONTROLE
**Função:** dizer em que mundo estamos operando hoje. Não olha ativo, olha regime.

**Entrada (varredura diária no terminal VantageNode, sempre os mesmos, nesta ordem):**

| # | Camada | Indicador | Pasta/Seção |
|---|---|---|---|
| 1 | Estado do preço | Preço do BTC | — |
| 2 | Estado do preço | Realized Price | RealizedPrice |
| 3 | Estado do preço | Realized Price · STH | RealizedPrice |
| 4 | Estado do preço | Realized Price · LTH | RealizedPrice |
| 5 | Régua da camada 1 | MVRV Ratio (preço ÷ Realized Price) | MVRV |
| 6 | Comportamento | SOPR | SOPR |
| 7 | Comportamento | Supply in Profit (%) | Supply in Profit/Loss |
| 8 | Comportamento | Liveliness | Cointime Statistics |
| 9 | Macro | DXY | Macro |
| 10 | Macro | Fed Funds Rate | Macro |
| 11 | Macro | US M2 | Macro |
| 12 | Macro | Yield Curve 10Y-2Y | Macro |
| 13 | Fluxo | ETF Net Inflow | ETF |
| 14 | Fluxo | Funding Rate | Futuros |

São os mesmos 14 indicadores de sempre (invariante 7). O que mudou na versão 1.1 é **onde o MVRV
entra na conta**: ele é a régua da camada 1 e saiu da média da camada 2 (Decisão 1). A coleta é
idêntica.

**Regras de coleta:** valor de FECHAMENTO do último candle, confirmado pela tooltip.
Registrar também mínima e máxima da série no range ALL (necessário para normalizar).
Se algo vier zerado ou com traço: reportar, NÃO inventar.

**Saída (bloco fixo, todo dia, mesmo formato):**
- Os 14 números com data de fechamento
- Variação de cada um vs. a leitura anterior
- **O ESTADO do mercado**, pela Linha d'Água — é o número de cima do bloco
- O **Índice Semente** (0–100) e a **faixa de intensidade** correspondente
- **A NOTA DE DIVERGÊNCIA**, quando estado e intensidade apontam para lados diferentes
  (ex.: "estado saudável, mas intensidade em equilíbrio"). É nota, não disputa.
- **O que mudou desde ontem** — só o que mudou
- ⚠️ SEM recomendação de compra ou venda

**Limite:** não decide nada. Lê regime. Não classifica estado por conta própria — o estado vem da
Linha d'Água.

---

## 2. GUARDIÕES DAS CARTEIRAS
**Função:** duvidar. Um por carteira.

**Perguntas que ele responde todo dia:**
- O que pode dar errado aqui?
- Qual o cenário de queda e quanto ele custa?
- Onde a tese quebra? Qual nível invalida?
- Que posição está grande demais?
- Alguma posição está perto do stop?

**Saída:** lista de riscos abertos, cada um com o nível que o dispara e o custo estimado.

**Limite:** não vende, não reduz. Aponta.

---

## 3. ALOCADOR
**Função:** propor o destino do aporte do mês.

**Entrada:** **estado do mercado (Linha d'Água)** · Índice Semente e faixa de intensidade ·
anos restantes até a entrega · composição atual da carteira · caixa disponível · zonas publicadas.

**Regra central — o ÍNDICE DE PLANTIO** (percentual do aporte que vai para o ativo).
Quem dispara é o cruzamento do **estado** com o **tempo restante**. O Índice Semente não entra
nesta tabela: ele modula dentro da faixa, e a fórmula da modulação ainda não existe.

| Estado do mercado (Linha d'Água) | Base | × Abrigo (anos restantes) |
|---|---|---|
| Capitulação profunda | 100% | +3a: 1,00 · 3a: 0,66 · 2a: 0,45 · 1a: 0,25 · entrega: 0,15 |
| Prejuízo do mercado | 90% | idem |
| Estresse de curto prazo | 65% | idem |
| Mercado saudável | 40% | idem |

O que sobra vai para o caixa, aguardando zona.

⚠️ **Enquanto a fórmula de modulação não for definida, o Alocador opera só com base × Abrigo**, e
o Índice Semente entra na proposta como nota informativa, não como fator multiplicador. Não
inventar a modulação. Pendência registrada em `03-indice-semente.md`.

**Saída:** proposta com ativo, percentual, faixa de preço e justificativa em uma linha.

**Limite:** PROPÕE. Não executa.

---

## 4. AUDITOR
**Função:** o cão de guarda. Confere a proposta do Alocador.

**Checklist de reprovação (qualquer item falho = REPROVA):**
1. O peso resultante estoura o limite do ativo?
2. O caixa fica abaixo do mínimo?
3. O preço proposto bate com a zona publicada?
4. Todo número citado bate com a fonte (tooltip/terminal)?
5. A proposta respeita o Abrigo dos anos finais?
6. Há promessa de retorno ou previsão de preço em algum texto?
7. A proposta usa o principal na fatia tática? (proibido — só ganho realizado)
8. O estado usado é o da Linha d'Água? (o Índice Semente não classifica estado)
9. Algum número derivado foi digitado à mão em vez de calculado da fonte primária?

**Saída:** CARIMBA ou REPROVA, com o motivo.

**Limite:** não propõe alocação. Só confere.

---

## 5. RESPONSÁVEL PELOS POSTS
**Função:** transformar a decisão aprovada em comunicação ao cliente.

**Regras (herdadas da voz da casa):**
- Uma ideia por post · sem emoji · sem hype
- Nomeia o indicador E traduz na mesma frase (Teste da Amiga)
- Proibido `=` e `≠` no texto
- Sem previsão de preço · sempre "a decisão final é sempre sua"
- Fecha com o "café": laço aberto no começo, retorno e pergunta no fim

**Limite:** monta o rascunho. **Publicar é humano.**

---

## 6. LABORATÓRIO
**Função:** estudar, não mandar.

**O que faz:** testa hipóteses contrafactuais — e se tivéssemos rotacionado capital daqui para ali
naquele momento? Estuda migração de capital entre ativos e carteiras.

**Saída:** aprendizado registrado. Nunca ordem.

**Quando construir:** por último, com a carteira já rodando.
