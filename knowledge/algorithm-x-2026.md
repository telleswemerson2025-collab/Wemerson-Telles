# algorithm-x-2026.md — Leitura do algoritmo do X (2026)

Editável pelo Mr. G. Guia como a distribuição do X influencia formato e cadência — sem transformar a
plataforma em alicerce (invariante 9).

> **Nota de honestidade:** este arquivo mistura princípios estáveis (que valem independentemente do
> algoritmo do dia) com leituras conjunturais de 2026. As partes conjunturais — inclusive o episódio
> Kaito/jan-2026 — precisam de confirmação factual do Mr. G antes de virarem regra dura. Marcadas com ⚠️.

## Princípios estáveis (não dependem do algoritmo do momento)

1. **O sinal que sobrevive a qualquer mudança de algoritmo é o salvamento.** Bookmark é intenção real de
   voltar ao conteúdo — por isso é o KPI (invariante 2), não o like. Otimizar para bookmark é robusto a
   reviravoltas de distribuição.
2. **Link no corpo penaliza alcance.** Historicamente o X reduz distribuição de posts que mandam o usuário
   para fora. Por isso o link vai no primeiro reply (invariante 3) — regra de produto, não só de estilo.
3. **Densidade retém.** Posts que um analista relê seguram atenção; atenção retida é o que qualquer versão
   do ranking recompensa.
4. **Consistência > viralização.** Uma conta que publica leitura confiável com regularidade constrói
   audiência que não depende de um post estourar.

## Leitura conjuntural de 2026 ⚠️ (confirmar com o Mr. G)

- ⚠️ Peso relativo de reply/quote e tempo-de-permanência no ranking atual.
- ⚠️ Como o X trata posts com imagem (gráfico) vs. só texto na distribuição de 2026.
- ⚠️ Presença/efeito de plataformas de atenção (ex.: Kaito) sobre o alcance orgânico.

## Episódio Kaito / jan-2026 ⚠️ (a documentar com o Mr. G)

O CLAUDE.md cita este episódio como a razão de tratar a **automação de publicação como substituível**
(invariante 9): a camada de distribuição/atenção pode mudar as regras de um mês para o outro, então a
publicação automática via API do X é **conveniência, não fundação**.

_Faltam os detalhes factuais do que ocorreu (o que a Kaito mudou, qual foi o impacto observado). Mr. G:
me passe o relato e eu documento aqui com precisão. Até lá, fica registrado só como princípio: não
acoplar a estratégia editorial a uma dependência frágil._

## Implicações práticas para o pipeline

- **BROADCAST** trata publicação manual como canal de primeira classe (`channel: manual`), não como fallback
  degradado — se a API do X falhar ou mudar, o ciclo publica à mão sem reescrever nada.
- **PLOT** entrega gráfico legível como imagem, porque o dado visual ancora o salvamento.
- **VOICE** mantém o link fora do corpo (invariante 3) por razão algorítmica, não só estética.
