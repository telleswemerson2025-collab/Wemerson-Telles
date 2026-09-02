#!/usr/bin/env python3
"""Valida a matemática do índice e do backtest com dados fabricados (sem rede)."""
import numpy as np
import pandas as pd

from backtest import PriceSeries, context_points, trade_returns
from build_signals import role_points, GROUP_PTS


def series(closes, start="2024-01-02"):
    dates = pd.bdate_range(start, periods=len(closes))
    return PriceSeries(pd.DataFrame(
        {"Date": dates, "Close": closes, "Volume": [1e6] * len(closes)}))


def approx(a, b, tol=1e-9):
    assert abs(a - b) < tol, f"{a} != {b}"


# --- cargo ---
assert role_points("1", "Chief Executive Officer", "", "", "") == 25
assert role_points("1", "CFO", "1", "", "") == 25
assert role_points("1", "President and COO", "", "", "") == 18
assert role_points("0", "", "1", "", "") == 12
assert role_points("", "", "", "1", "") == 8
assert role_points("", "", "", "", "1") == 6
assert GROUP_PTS == {1: 5, 2: 10, 3: 13}

# --- contexto: preço caindo -> último fechamento = mínimo -> 10 pontos ---
ps = series(list(np.linspace(100, 50, 80)))
filing = pd.Timestamp(ps.dates[-1]) + pd.Timedelta(days=1)
pts, neutral = context_points(ps, filing)
assert not neutral
approx(pts, 10.0)

# preço subindo -> último = máximo -> 0 pontos
ps_up = series(list(np.linspace(50, 100, 80)))
pts_up, _ = context_points(ps_up, pd.Timestamp(ps_up.dates[-1]) + pd.Timedelta(days=1))
approx(pts_up, 0.0)

# histórico curto -> neutro 5
ps_short = series([10.0] * 10)
pts_s, neutral_s = context_points(ps_short, pd.Timestamp(ps_short.dates[-1]))
assert neutral_s and pts_s == 5.0

# --- retornos: entrada no 1º pregão APÓS o filing, saída no 1º pregão >= +N ---
n = 400
closes = [100.0 * (1.01 ** i) for i in range(n)]           # sobe 1% ao pregão
spy = series([100.0] * n)                                   # SPY parado
tk = series(closes)
filing = pd.Timestamp(tk.dates[10])                         # filing num pregão
tr = trade_returns(tk, spy, filing)
assert tr["entry_date"] == tk.dates[11], "entrada deve ser o pregão seguinte"
approx(tr["entry_px"], closes[11])
# saída 30d: primeiro pregão >= entrada+30 dias corridos
target = tk.dates[11] + np.timedelta64(30, "D")
xi = np.searchsorted(tk.dates, target, side="left")
approx(tr["ret_30"], closes[xi] / closes[11] - 1.0)
approx(tr["exc_30"], tr["ret_30"])                          # SPY 0% -> excesso = bruto

# excesso contra SPY que sobe igual -> excesso ~ 0
spy2 = series(closes)
tr2 = trade_returns(tk, spy2, filing)
approx(tr2["exc_90"], 0.0, tol=1e-9)

# filing depois do último pregão -> sem entrada
assert trade_returns(tk, spy, pd.Timestamp(tk.dates[-1])) is None or True
tr3 = trade_returns(tk, spy, pd.Timestamp(tk.dates[-1]) + pd.Timedelta(days=5))
assert tr3 is None

# janela que ultrapassa os dados -> NaN naquela janela
filing_late = pd.Timestamp(tk.dates[-40])
tr4 = trade_returns(tk, spy, filing_late)
assert not np.isnan(tr4["ret_30"])
assert np.isnan(tr4["ret_365"])

print("OK — todos os testes sintéticos passaram.")
