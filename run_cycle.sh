#!/usr/bin/env bash
# run_cycle.sh — orquestra 01→04 e para no Gate 2 (VantageNode-X).
#
# Idempotente: avança até onde os artefatos do ciclo permitem, valida cada um
# contra seu schema, impõe os gates e para dizendo o próximo passo (qual comando
# de agente rodar, ou qual gate está aguardando). Rode quantas vezes quiser.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

CYCLE="${1:-}"
if [ -z "$CYCLE" ]; then
  echo "uso: ./run_cycle.sh <cycle_id>" >&2
  exit 2
fi
CDIR="cycles/$CYCLE"

stop()  { echo "→ $*"; exit 0; }         # aguardando algo — não é erro
fail()  { echo "✗ $*" >&2; exit 1; }
okmsg() { echo "✓ $*"; }

validate() {
  if ! python3 lib/validate.py "$CYCLE" "$1" >/tmp/vn_val 2>&1; then
    cat /tmp/vn_val >&2
    fail "validação de $1 falhou — corrija antes de avançar."
  fi
}

echo "== run_cycle: $CYCLE =="

# --- 00 dados (fonte-de-verdade, transferência manual da VantageNode) ---
if [ ! -f "$CDIR/00_data.json" ]; then
  stop "Sem dados. Rode: python lib/fetch_data.py scaffold $CYCLE --indicator <NOME> e preencha com os valores da VantageNode."
fi
validate 00_data.json
okmsg "00_data.json válido"

# --- 01 SCOUT ---
if [ ! -f "$CDIR/00_brief.json" ]; then
  stop "Rode o SCOUT:  /scout $CYCLE   (propõe o ângulo, para no Gate 1)"
fi
validate 00_brief.json
okmsg "00_brief.json válido"

# --- GATE 1 (direção editorial) ---
G1="$(python3 -c "import json;print(json.load(open('$CDIR/00_brief.json'))['gate1']['status'])")"
if [ "$G1" != "approved" ]; then
  stop "GATE 1 ($G1): aguardando o Mr. G aprovar a direção (gate1.status: approved em 00_brief.json)."
fi
okmsg "Gate 1 aprovado"

# --- 02 PLOT ---
if [ ! -f "$CDIR/02_chart.png" ]; then
  stop "Rode o PLOT:  /plot $CYCLE   (gera 02_chart.png via lib/render_chart.py)"
fi
okmsg "02_chart.png presente"
if [ -f "$CDIR/02_chart_meta.json" ]; then
  python3 - "$CDIR" <<'PY' || fail "02_chart_meta.json diverge de 00_data.json (invariante 6)."
import json, sys
c = sys.argv[1]
d = json.load(open(c + "/00_data.json")); m = json.load(open(c + "/02_chart_meta.json"))
src = {p["t"]: float(p["v"]) for p in d["series"]}
plotted = {p["t"]: float(p["v"]) for p in m["numbers_plotted"]}
assert float(m["latest_value"]) == float(d["latest_value"]), "latest_value diverge"
assert all(plotted.get(t) == v for t, v in src.items()), "ponto plotado diverge da fonte"
PY
  okmsg "gráfico reconciliado com a fonte (invariante 6)"
fi

# --- 03 VOICE ---
if [ ! -f "$CDIR/03_copy.json" ]; then
  stop "Rode o VOICE:  /voice $CYCLE   (escreve post + primeiro reply)"
fi
validate 03_copy.json
okmsg "03_copy.json válido"

# --- 04 GATEKEEPER ---
if [ ! -f "$CDIR/04_review.json" ]; then
  stop "Rode o GATEKEEPER:  /gatekeeper $CYCLE   (revisão de risco + APPROVAL.md)"
fi
validate 04_review.json
V="$(python3 -c "import json;print(json.load(open('$CDIR/04_review.json'))['verdict'])")"
if [ "$V" = "block" ]; then
  echo "✗ GATEKEEPER: verdict=block. Motivos:" >&2
  python3 -c "import json;[print(' -',b) for b in json.load(open('$CDIR/04_review.json'))['blocks']]" >&2
  fail "Ciclo bloqueado no GATEKEEPER — volte ao VOICE/PLOT/SCOUT conforme o motivo."
fi
okmsg "04_review.json válido (verdict=$V)"

# --- GATE 2 (aprovação de publicação) ---
if [ ! -f "$CDIR/APPROVAL.md" ]; then
  stop "GATEKEEPER passou, mas falta APPROVAL.md — rode /gatekeeper $CYCLE para gerá-lo."
fi
STATUS="$(grep -m1 '^STATUS:' "$CDIR/APPROVAL.md" | awk '{print $2}')"
echo ""
echo "== 01→04 concluído. GATE 2: STATUS=$STATUS =="
echo "→ Ciclo aguardando decisão humana em $CDIR/APPROVAL.md"
echo "  approved → ./publish.sh $CYCLE    |    revise/rejected → ajustar ou descartar"
