#!/usr/bin/env bash
# publish.sh — roda o BROADCAST (05), somente com STATUS: approved (VantageNode-X).
#
# Gate 2 é inviolável (invariante 7): sem 'approved' em APPROVAL.md, não publica.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

CYCLE="${1:-}"
if [ -z "$CYCLE" ]; then
  echo "uso: ./publish.sh <cycle_id>" >&2
  exit 2
fi
CDIR="cycles/$CYCLE"

stop()  { echo "→ $*"; exit 0; }
fail()  { echo "✗ $*" >&2; exit 1; }
okmsg() { echo "✓ $*"; }

echo "== publish: $CYCLE =="

# --- Gate 2: exige STATUS: approved ---
if [ ! -f "$CDIR/APPROVAL.md" ]; then
  fail "Sem APPROVAL.md. Rode ./run_cycle.sh $CYCLE até o Gate 2 primeiro."
fi
STATUS="$(grep -m1 '^STATUS:' "$CDIR/APPROVAL.md" | awk '{print $2}')"
if [ "$STATUS" != "approved" ]; then
  fail "GATE 2 bloqueia: STATUS=$STATUS (esperado: approved). Nenhum agente aprova pelo humano (invariante 7)."
fi
okmsg "Gate 2 aprovado (STATUS: approved)"

# --- 05 BROADCAST ---
if [ ! -f "$CDIR/05_published.json" ]; then
  echo "→ Rode o BROADCAST:  /broadcast $CYCLE"
  echo "  Fase de teste: canal 'manual' — publique o post + reply à mão e cole URL/IDs para o 05_published.json."
  exit 0
fi

if ! python3 lib/validate.py "$CYCLE" 05_published.json >/tmp/vn_pub 2>&1; then
  cat /tmp/vn_pub >&2
  fail "05_published.json inválido."
fi

PSTATUS="$(python3 -c "import json;print(json.load(open('$CDIR/05_published.json'))['status'])")"
CHANNEL="$(python3 -c "import json;print(json.load(open('$CDIR/05_published.json')).get('channel','?'))")"
URL="$(python3 -c "import json;print(json.load(open('$CDIR/05_published.json')).get('post_url',''))")"
okmsg "05_published.json válido (status=$PSTATUS, canal=$CHANNEL)"
[ -n "$URL" ] && echo "   post: $URL"
echo "→ Após +48h, colete métricas:  ./collect.sh $CYCLE"
