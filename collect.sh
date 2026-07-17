#!/usr/bin/env bash
# collect.sh — roda o FEEDBACK (06) ~48h após a publicação (VantageNode-X).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

CYCLE="${1:-}"
if [ -z "$CYCLE" ]; then
  echo "uso: ./collect.sh <cycle_id>" >&2
  exit 2
fi
CDIR="cycles/$CYCLE"

fail()  { echo "✗ $*" >&2; exit 1; }
okmsg() { echo "✓ $*"; }

echo "== collect: $CYCLE =="

# --- exige publicação registrada ---
if [ ! -f "$CDIR/05_published.json" ]; then
  fail "Sem 05_published.json. Publique primeiro (./publish.sh $CYCLE)."
fi
PSTATUS="$(python3 -c "import json;print(json.load(open('$CDIR/05_published.json'))['status'])")"
if [ "$PSTATUS" != "published" ]; then
  fail "Publicação com status='$PSTATUS' (esperado: published). Nada a coletar."
fi

# --- janela de +48h (aviso, não bloqueio) ---
python3 - "$CDIR" <<'PY' || true
import json, sys
from datetime import datetime, timezone
p = json.load(open(sys.argv[1] + "/05_published.json"))
ts = p.get("published_at")
if not ts:
    print("   (sem published_at — não dá para checar a janela de 48h)"); raise SystemExit
try:
    pub = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    hrs = (datetime.now(timezone.utc) - pub).total_seconds() / 3600
    if hrs < 48:
        print(f"   AVISO: só se passaram {hrs:.1f}h desde a publicação (< 48h). Métricas podem estar imaturas.")
    else:
        print(f"   {hrs:.1f}h desde a publicação — janela de 48h atingida.")
except ValueError:
    print("   (published_at em formato inesperado — pulei a checagem de 48h)")
PY

# --- 06 FEEDBACK ---
if [ ! -f "$CDIR/06_metrics.json" ]; then
  echo "→ Rode o FEEDBACK:  /feedback $CYCLE"
  echo "  Fase de teste: traga da tela do X bookmarks, likes, replies e impressões (transferência manual)."
  exit 0
fi

if ! python3 lib/validate.py "$CYCLE" 06_metrics.json >/tmp/vn_met 2>&1; then
  cat /tmp/vn_met >&2
  fail "06_metrics.json inválido."
fi
okmsg "06_metrics.json válido"
python3 - "$CDIR" <<'PY'
import json, sys
m = json.load(open(sys.argv[1] + "/06_metrics.json"))
kpi = m["kpi"]
print(f"   KPI (bookmarks): {kpi['value']}  |  analista salvou: {kpi['analyst_saved']}")
print(f"   learning: {m['learning']}")
PY
echo "→ Confirme que o FEEDBACK acrescentou a entrada em memory/learnings.md (append, nunca rewrite)."
