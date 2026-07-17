# Pendências exclusivas do Gui — VantageNode-X

_Registro do que depende **exclusivamente de decisão do Gui** (dono do produto/dados) e que nem o Mr. G
nem o Claude Code conseguem resolver ou contornar. Última atualização: 2026-07-17._

## Escopo (o que NÃO entra aqui)

- **API real / token da VantageNode e bug no endpoint de MVRV:** parados **por opção nossa**. Na fase de
  teste não usamos a API — os dados entram por **transferência manual** da aba VantageNode (Mr. G), que é a
  fonte-de-verdade. Portanto não são decisão pendente do Gui agora; entram só na Fase 2.
- Ajustes editoriais (voz, cadência, handle, identidade visual) → alçada do Mr. G, não do Gui.
- Definição **pública** do MVRV → resolvida do nosso lado em `knowledge/indicators.md`.

---

## Pendência única: definição técnica dos 2 indicadores proprietários

Não existem em fonte pública nem na plataforma VantageNode (verificado no terminal). Sem a definição do
Gui, o agente de risco (GATEKEEPER) **barra automaticamente** qualquer post que os cite — o pipeline não
pode publicar sobre eles.

Para **cada** indicador (**EIPI** e **Whale-to-Book Lag**), precisamos de:

1. **Conceito + nome por extenso** — o que o indicador mede.
2. **Fórmula / método de cálculo** — inputs, janela temporal, unidade, normalização.
3. **Fonte dos dados de entrada** + frequência de atualização.
4. **Faixa de valores e interpretação** — o que é "alto"/"baixo", zonas de atenção.
5. **Cuidados de linguagem** — o que se pode e o que não se pode afirmar ao citá-lo (respeitando o
   invariante 5: nada de certeza sobre preço nem promessa de retorno).

Quando o Gui responder, o conteúdo entra em `knowledge/indicators.md` (seção "Indicadores proprietários")
e destrava o uso desses indicadores no pipeline.
