#!/usr/bin/env python3
"""Baixa cotações diárias ajustadas para os tickers de out/tickers.txt + SPY.

Fonte primária: Stooq (CSV gratuito, ajustado). Fallback: Yahoo Finance chart API.
Grava 1 CSV por ticker em prices/ com colunas Date,Close,Volume.
Reexecutável: pula tickers já baixados.
"""
import csv
import io
import json
import pathlib
import sys
import time

import requests

HERE = pathlib.Path(__file__).parent
OUT = HERE / "out"
PRICES = HERE / "prices"
START = "2023-09-01"  # 90d de histórico antes de 2024-01-01, com folga

UA = {"User-Agent": "Mozilla/5.0 (backtest pessoal; contato do dono da sessão)"}


def from_stooq(t: str):
    d1 = START.replace("-", "")
    url = (f"https://stooq.com/q/d/l/?s={t.lower()}.us&i=d&d1={d1}&d2=20991231")
    r = requests.get(url, headers=UA, timeout=30)
    if r.status_code != 200 or not r.text.startswith("Date"):
        return None
    rows = list(csv.DictReader(io.StringIO(r.text)))
    if len(rows) < 30:
        return None
    return [(x["Date"], x["Close"], x.get("Volume", "")) for x in rows]


def from_yahoo(t: str):
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{t}"
           f"?period1=1693526400&period2=9999999999&interval=1d&events=div%2Csplit")
    r = requests.get(url, headers=UA, timeout=30)
    if r.status_code != 200:
        return None
    try:
        res = r.json()["chart"]["result"][0]
        ts = res["timestamp"]
        adj = res["indicators"]["adjclose"][0]["adjclose"]
        vol = res["indicators"]["quote"][0]["volume"]
    except (KeyError, TypeError, IndexError, json.JSONDecodeError):
        return None
    import datetime
    rows = []
    for i, t_ in enumerate(ts):
        if adj[i] is None:
            continue
        d = datetime.datetime.utcfromtimestamp(t_).date().isoformat()
        rows.append((d, f"{adj[i]:.4f}", vol[i] if vol[i] is not None else ""))
    return rows if len(rows) >= 30 else None


def fetch(t: str) -> bool:
    path = PRICES / f"{t}.csv"
    if path.exists():
        return True
    rows = None
    try:
        rows = from_stooq(t)
    except requests.RequestException:
        pass
    if rows is None:
        try:
            rows = from_yahoo(t)
        except requests.RequestException:
            pass
    if rows is None:
        return False
    with open(path, "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["Date", "Close", "Volume"])
        w.writerows(rows)
    return True


def main():
    PRICES.mkdir(exist_ok=True)
    tickers = ["SPY"] + [
        t for t in (OUT / "tickers.txt").read_text().split() if t
    ]
    ok, fail = 0, []
    for i, t in enumerate(tickers, 1):
        if fetch(t):
            ok += 1
        else:
            fail.append(t)
        if i % 100 == 0:
            print(f"{i}/{len(tickers)} — ok {ok}, sem dados {len(fail)}")
        time.sleep(0.35)  # cortesia / rate limit
    (OUT / "tickers_sem_cotacao.txt").write_text("\n".join(fail) + "\n")
    print(f"\nCotações: {ok}/{len(tickers)} | sem dados: {len(fail)} "
          f"(lista em out/tickers_sem_cotacao.txt)")
    if not (PRICES / "SPY.csv").exists():
        sys.exit("SPY não baixado — sem benchmark o teste não roda.")


if __name__ == "__main__":
    main()
