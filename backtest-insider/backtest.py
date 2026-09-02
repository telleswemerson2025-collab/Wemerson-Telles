#!/usr/bin/env python3
"""Backtest da tese insider, regras pré-registradas no README.

Lê out/signals.csv + prices/*.csv, calcula o componente de contexto, o Índice
de Convicção final e os retornos em 30/90/180/365 dias contra o SPY.
Emite out/trades.csv e out/report.md.
"""
import pathlib

import numpy as np
import pandas as pd

HERE = pathlib.Path(__file__).parent
OUT = HERE / "out"
PRICES = HERE / "prices"
WINDOWS = (30, 90, 180, 365)
BANDS = [(60, 70), (70, 80), (80, 90), (90, 101)]


class PriceSeries:
    def __init__(self, df: pd.DataFrame):
        df = df.dropna(subset=["Close"]).sort_values("Date")
        self.dates = df["Date"].values.astype("datetime64[D]")
        self.close = df["Close"].values.astype(float)
        self.volume = pd.to_numeric(df["Volume"], errors="coerce").values

    def idx_after(self, d):
        """primeiro pregão com data > d (entrada)."""
        i = np.searchsorted(self.dates, np.datetime64(d, "D"), side="right")
        return i if i < len(self.dates) else None

    def idx_at_or_after(self, d):
        i = np.searchsorted(self.dates, np.datetime64(d, "D"), side="left")
        return i if i < len(self.dates) else None

    def idx_at_or_before(self, d):
        i = np.searchsorted(self.dates, np.datetime64(d, "D"), side="right") - 1
        return i if i >= 0 else None

    def window_slice(self, d0, d1):
        """fechamentos com d0 <= data <= d1."""
        a = np.searchsorted(self.dates, np.datetime64(d0, "D"), side="left")
        b = np.searchsorted(self.dates, np.datetime64(d1, "D"), side="right")
        return slice(a, b)


def load_prices():
    prices = {}
    for p in PRICES.glob("*.csv"):
        df = pd.read_csv(p, parse_dates=["Date"])
        if len(df) >= 30:
            prices[p.stem] = PriceSeries(df)
    return prices


def context_points(ps: PriceSeries, filing_date) -> tuple[float, bool]:
    """(pontos 0-10, neutro?) — posição do último fechamento antes do filing
    no min–max dos 90 dias corridos anteriores."""
    d1 = filing_date - pd.Timedelta(days=1)
    sl = ps.window_slice(filing_date - pd.Timedelta(days=90), d1)
    closes = ps.close[sl]
    if len(closes) < 30:
        return 5.0, True
    px = closes[-1]
    lo, hi = closes.min(), closes.max()
    if hi <= lo:
        return 5.0, True
    pos = (px - lo) / (hi - lo)
    return float((1.0 - pos) * 10.0), False


def trade_returns(ps: PriceSeries, spy: PriceSeries, filing_date):
    """entrada no 1º pregão após o filing; saídas nas 4 janelas; excesso vs SPY."""
    ei = ps.idx_after(filing_date)
    if ei is None:
        return None
    entry_date = ps.dates[ei]
    entry_px = ps.close[ei]
    si = spy.idx_at_or_before(entry_date)
    if si is None:
        return None
    out = {"entry_date": entry_date, "entry_px": entry_px}
    for w in WINDOWS:
        xi = ps.idx_at_or_after(entry_date + np.timedelta64(w, "D"))
        if xi is None:
            out[f"ret_{w}"] = np.nan
            out[f"exc_{w}"] = np.nan
            continue
        exit_date = ps.dates[xi]
        ret = ps.close[xi] / entry_px - 1.0
        sxi = spy.idx_at_or_before(exit_date)
        spy_ret = spy.close[sxi] / spy.close[si] - 1.0
        out[f"ret_{w}"] = ret
        out[f"exc_{w}"] = ret - spy_ret
    # proxy de tamanho/liquidez: volume financeiro mediano 90d antes da entrada
    sl = ps.window_slice(pd.Timestamp(entry_date) - pd.Timedelta(days=90),
                         pd.Timestamp(entry_date) - pd.Timedelta(days=1))
    dv = ps.close[sl] * ps.volume[sl]
    dv = dv[~np.isnan(dv)]
    out["dollar_vol_90d"] = float(np.median(dv)) if len(dv) else np.nan
    return out


def build_trades(signals: pd.DataFrame, prices: dict) -> tuple[pd.DataFrame, dict]:
    spy = prices["SPY"]
    rows, skipped = [], {"sem_cotacao": 0, "sem_entrada": 0}
    for r in signals.itertuples():
        ps = prices.get(r.ticker)
        if ps is None:
            skipped["sem_cotacao"] += 1
            continue
        fd = pd.Timestamp(r.filing_date)
        ctx, ctx_neutral = context_points(ps, fd)
        tr = trade_returns(ps, spy, fd)
        if tr is None:
            skipped["sem_entrada"] += 1
            continue
        rows.append({
            "acc": r.acc, "ticker": r.ticker, "issuer": r.issuer,
            "filing_date": fd, "value": r.value, "title": getattr(r, "title", ""),
            "role_pts": r.role_pts, "size_pts": r.size_pts,
            "group_n": r.group_n, "group_pts": r.group_pts,
            "ctx_pts": ctx, "ctx_neutral": ctx_neutral,
            "score": r.score_partial + ctx, **tr,
        })
    return pd.DataFrame(rows), skipped


def win_stats(df: pd.DataFrame, w: int) -> dict:
    exc = df[f"exc_{w}"].dropna()
    ret = df[f"ret_{w}"].dropna()
    if len(exc) == 0:
        return {"n": 0}
    return {
        "n": len(exc),
        "ret_medio": ret.mean(), "ret_mediano": ret.median(),
        "exc_medio": exc.mean(), "exc_mediano": exc.median(),
        "pct_bate_spy": (exc > 0).mean(),
    }


def longest_neg_streak(df: pd.DataFrame, w: int):
    s = df.sort_values("entry_date")[f"exc_{w}"].dropna()
    best = cur = 0
    start = best_start = None
    dates = df.sort_values("entry_date").loc[s.index, "entry_date"]
    for d, v in zip(dates, s):
        if v < 0:
            if cur == 0:
                start = d
            cur += 1
            if cur > best:
                best, best_start = cur, start
        else:
            cur = 0
    return best, best_start


def fmt_pct(x):
    return "—" if pd.isna(x) else f"{x*100:+.1f}%"


def stats_table(title, df, f):
    lines = [f"### {title}", "",
             "| Janela | N | Ret. médio | Ret. mediano | Excesso médio | Excesso mediano | % bate SPY |",
             "|---|---|---|---|---|---|---|"]
    for w in WINDOWS:
        s = win_stats(df, w)
        if s["n"] == 0:
            lines.append(f"| {w}d | 0 | — | — | — | — | — |")
        else:
            lines.append(
                f"| {w}d | {s['n']} | {fmt_pct(s['ret_medio'])} | {fmt_pct(s['ret_mediano'])} "
                f"| **{fmt_pct(s['exc_medio'])}** | {fmt_pct(s['exc_mediano'])} "
                f"| {s['pct_bate_spy']*100:.0f}% |")
    f.extend(lines + [""])


def main():
    signals = pd.read_csv(OUT / "signals.csv", parse_dates=["filing_date", "trans_date"])
    prices = load_prices()
    print(f"sinais: {len(signals)} | séries de preço: {len(prices)}")
    trades, skipped = build_trades(signals, prices)
    trades.to_csv(OUT / "trades.csv", index=False)

    hi = trades[trades["score"] > 60]
    lo = trades[trades["score"] < 40]

    f = ["# Backtest — Tese Insider (Dinheiro de Dentro)", "",
         f"Gerado em {pd.Timestamp.today():%Y-%m-%d}. Regras pré-registradas no README; "
         "pesos e período fixados antes do teste.", "",
         "## 1. Amostra", "",
         f"- Filings Form 4 com compra P (código de mercado aberto) e valor ≥ US$5k: **{len(signals)}**",
         f"- Descartados sem cotação disponível: {skipped['sem_cotacao']} · sem pregão de entrada: {skipped['sem_entrada']}",
         f"- Operações avaliadas: **{len(trades)}**",
         f"- Universo do teste (Índice > 60): **{len(hi)}**",
         f"- Grupo de controle (Índice < 40): **{len(lo)}**",
         f"- Componente 'tamanho relativo' estimado por percentil histórico (remuneração "
         f"não consta nos arquivos da SEC): 100% das operações.",
         f"- Contexto neutro por falta de histórico (<30 pregões): "
         f"{int(trades['ctx_neutral'].sum())} operações.", "",
         "## 2–3. Retornos do universo (Índice > 60)", ""]
    stats_table("Índice > 60", hi, f)

    f.append("## 4. Por faixa do Índice")
    f.append("")
    for a, b in BANDS:
        band = trades[(trades["score"] >= a) & (trades["score"] < b)]
        label = f"{a}–{b if b <= 100 else '100'}" if b <= 100 else f">{a}"
        stats_table(f"Faixa {label} (n={len(band)})", band, f)

    f.append("## 5. Grupo de controle (Índice < 40)")
    f.append("")
    stats_table("Índice < 40", lo, f)

    f.append("## 6. Por tamanho de empresa (proxy: volume financeiro mediano 90d, tercis)")
    f.append("")
    hi_dv = hi.dropna(subset=["dollar_vol_90d"])
    if len(hi_dv) >= 30:
        terc = hi_dv["dollar_vol_90d"].quantile([1 / 3, 2 / 3]).values
        cuts = [("Pequenas (tercil inferior)", hi_dv[hi_dv["dollar_vol_90d"] <= terc[0]]),
                ("Médias (tercil do meio)", hi_dv[(hi_dv["dollar_vol_90d"] > terc[0])
                                                  & (hi_dv["dollar_vol_90d"] <= terc[1])]),
                ("Grandes (tercil superior)", hi_dv[hi_dv["dollar_vol_90d"] > terc[1]])]
        for label, part in cuts:
            stats_table(f"{label} (n={len(part)})", part, f)
    else:
        f.append("Amostra insuficiente para tercis.\n")

    f.append("## 7. Pior sequência")
    f.append("")
    for w in WINDOWS:
        n, start = longest_neg_streak(hi, w)
        s = "—" if start is None else pd.Timestamp(start).strftime("%Y-%m-%d")
        f.append(f"- Janela {w}d: **{n} operações seguidas** abaixo do SPY "
                 f"(começando em {s}).")
    # coortes mensais (excesso 90d)
    hi2 = hi.dropna(subset=["exc_90"]).copy()
    if len(hi2):
        hi2["mes"] = pd.to_datetime(hi2["entry_date"]).dt.to_period("M")
        coh = hi2.groupby("mes")["exc_90"].agg(["count", "mean"])
        f.append("")
        f.append("Coortes mensais (excesso médio 90d por mês de entrada):")
        f.append("")
        f.append("| Mês | N | Excesso médio 90d |")
        f.append("|---|---|---|")
        for m, row in coh.iterrows():
            f.append(f"| {m} | {int(row['count'])} | {fmt_pct(row['mean'])} |")
        neg = (coh["mean"] < 0).astype(int)
        streak = best = 0
        for v in neg:
            streak = streak + 1 if v else 0
            best = max(best, streak)
        f.append("")
        f.append(f"Pior sequência de meses negativos (excesso 90d): **{best} meses**.")

    (OUT / "report.md").write_text("\n".join(f) + "\n")
    print("out/report.md e out/trades.csv gerados.")


if __name__ == "__main__":
    main()
