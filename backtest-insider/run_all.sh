#!/usr/bin/env bash
# Uso: ./run_all.sh "Seu Nome seu-email@dominio.com"
set -euo pipefail
cd "$(dirname "$0")"
UA="${1:?Passe o User-Agent exigido pela SEC: nome e e-mail de contato}"

python3 test_synthetic.py
python3 download_sec.py --ua "$UA"
python3 build_signals.py
python3 download_prices.py
python3 backtest.py

echo
echo "Relatório: $(pwd)/out/report.md"
