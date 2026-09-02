#!/usr/bin/env python3
"""Monta os sinais de compra de insider a partir dos zips form345 da SEC.

Filtro pré-registrado: DOCUMENT_TYPE=4, TRANS_CODE=P, TRANS_ACQUIRED_DISP_CD=A,
preço e quantidade > 0, valor por filing >= US$5.000.

Saídas: out/signals.csv (1 linha por filing, com componentes do índice exceto
contexto) e out/tickers.txt.
"""
import io
import pathlib
import re
import sys
import zipfile

import numpy as np
import pandas as pd

HERE = pathlib.Path(__file__).parent
SEC = HERE / "sec"
OUT = HERE / "out"

ROLE_CEO_CFO = 25
ROLE_OFFICER = 18
ROLE_DIRECTOR = 12
ROLE_TENPCT = 8
ROLE_OTHER = 6
GROUP_PTS = {1: 5, 2: 10, 3: 13}  # >=4 -> 15
NATURE_PTS = 30
MIN_VALUE = 5000.0


def read_tsv(zf: zipfile.ZipFile, name_part: str) -> pd.DataFrame:
    """Lê um TSV do zip pelo pedaço do nome, colunas normalizadas p/ UPPER."""
    for n in zf.namelist():
        if name_part.lower() in n.lower():
            with zf.open(n) as f:
                df = pd.read_csv(
                    io.TextIOWrapper(f, encoding="utf-8", errors="replace"),
                    sep="\t", dtype=str, low_memory=False,
                )
            df.columns = [c.strip().upper() for c in df.columns]
            return df
    raise KeyError(f"{name_part} não encontrado em {zf.filename}")


def col(df: pd.DataFrame, *candidates: str) -> str:
    for c in candidates:
        if c in df.columns:
            return c
    raise KeyError(f"nenhuma coluna {candidates} em {list(df.columns)[:20]}...")


def parse_dates(s: pd.Series) -> pd.Series:
    # DERA usa DD-MON-YYYY; aceita também ISO.
    d = pd.to_datetime(s, format="%d-%b-%Y", errors="coerce")
    iso = pd.to_datetime(s[d.isna()], errors="coerce")
    return d.fillna(iso)


def role_points(is_off, title, is_dir, is_ten, is_other) -> int:
    t = (title or "").upper()
    officer = str(is_off) in ("1", "TRUE", "YES")
    if officer and re.search(r"\bCEO\b|CHIEF EXEC|\bCFO\b|CHIEF FIN|PRINCIPAL FIN", t):
        return ROLE_CEO_CFO
    if officer:
        return ROLE_OFFICER
    if str(is_dir) in ("1", "TRUE", "YES"):
        return ROLE_DIRECTOR
    if str(is_ten) in ("1", "TRUE", "YES"):
        return ROLE_TENPCT
    return ROLE_OTHER


def load_quarter(path: pathlib.Path):
    with zipfile.ZipFile(path) as zf:
        sub = read_tsv(zf, "SUBMISSION")
        trans = read_tsv(zf, "NONDERIV_TRANS")
        owner = read_tsv(zf, "REPORTINGOWNER")
    acc = col(sub, "ACCESSION_NUMBER")
    doc = col(sub, "DOCUMENT_TYPE")
    sub = sub[sub[doc].str.strip() == "4"]
    sub = sub[[acc, col(sub, "FILING_DATE"), col(sub, "PERIOD_OF_REPORT"),
               col(sub, "ISSUERTRADINGSYMBOL"), col(sub, "ISSUERNAME"),
               col(sub, "ISSUERCIK")]]
    sub.columns = ["acc", "filing_date", "period", "ticker", "issuer", "issuer_cik"]

    tc = col(trans, "TRANS_CODE")
    ad = col(trans, "TRANS_ACQUIRED_DISP_CD")
    trans = trans[(trans[tc].str.strip() == "P") & (trans[ad].str.strip() == "A")]
    trans = trans[[col(trans, "ACCESSION_NUMBER"), col(trans, "TRANS_DATE"),
                   col(trans, "TRANS_SHARES"), col(trans, "TRANS_PRICEPERSHARE")]]
    trans.columns = ["acc", "trans_date", "shares", "price"]
    trans["shares"] = pd.to_numeric(trans["shares"], errors="coerce")
    trans["price"] = pd.to_numeric(trans["price"], errors="coerce")
    trans = trans[(trans["shares"] > 0) & (trans["price"] > 0)]
    trans["value"] = trans["shares"] * trans["price"]
    trans["trans_date"] = parse_dates(trans["trans_date"])

    ocols = {c: c for c in owner.columns}
    o_acc = col(owner, "ACCESSION_NUMBER")
    o_cik = col(owner, "RPTOWNERCIK", "RPTOWNER_CIK")
    o_dir = next((c for c in ocols if "ISDIRECTOR" in c), None)
    o_off = next((c for c in ocols if "ISOFFICER" in c), None)
    o_ten = next((c for c in ocols if "ISTENPERCENT" in c), None)
    o_oth = next((c for c in ocols if "ISOTHER" in c), None)
    o_tit = next((c for c in ocols if "OFFICER_TITLE" in c or "OFFICERTITLE" in c), None)
    keep = [o_acc, o_cik] + [c for c in (o_dir, o_off, o_ten, o_oth, o_tit) if c]
    owner = owner[keep]
    owner.columns = (["acc", "owner_cik"]
                     + [n for n, c in zip(["is_dir", "is_off", "is_ten", "is_oth", "title"],
                                          (o_dir, o_off, o_ten, o_oth, o_tit)) if c])
    for c in ("is_dir", "is_off", "is_ten", "is_oth", "title"):
        if c not in owner.columns:
            owner[c] = ""
    owner = owner.fillna("")
    owner["role_pts"] = [
        role_points(r.is_off, r.title, r.is_dir, r.is_ten, r.is_oth)
        for r in owner.itertuples()
    ]
    # 1 linha por filing: papel mais alto entre os owners do filing
    owner = (owner.sort_values("role_pts", ascending=False)
                  .groupby("acc", as_index=False)
                  .agg(owner_cik=("owner_cik", "first"),
                       role_pts=("role_pts", "max"),
                       title=("title", "first")))
    return sub, trans, owner


def main():
    zips = sorted(SEC.glob("*_form345.zip"))
    if not zips:
        sys.exit("Nenhum zip em sec/ — rode download_sec.py primeiro.")
    subs, transs, owners = [], [], []
    for z in zips:
        s, t, o = load_quarter(z)
        print(f"{z.name}: {len(s)} filings Form 4, {len(t)} transações P")
        subs.append(s); transs.append(t); owners.append(o)
    sub = pd.concat(subs, ignore_index=True).drop_duplicates("acc")
    trans = pd.concat(transs, ignore_index=True)
    owner = pd.concat(owners, ignore_index=True).drop_duplicates("acc")

    # agrega por filing
    f = (trans.groupby("acc", as_index=False)
              .agg(value=("value", "sum"), shares=("shares", "sum"),
                   trans_date=("trans_date", "min")))
    f = f.merge(sub, on="acc", how="inner").merge(owner, on="acc", how="left")
    f["role_pts"] = f["role_pts"].fillna(ROLE_OTHER)
    f["filing_date"] = parse_dates(f["filing_date"])
    f = f[f["value"] >= MIN_VALUE]
    f = f[f["filing_date"] >= "2024-01-01"]

    # ticker sane
    f["ticker"] = f["ticker"].fillna("").str.strip().str.upper()
    ok = f["ticker"].str.fullmatch(r"[A-Z][A-Z0-9.\-]{0,5}")
    bad_ticker = int((~ok).sum())
    f = f[ok & ~f["ticker"].isin({"NONE", "N/A", "NA"})]

    # tamanho relativo (peso 20) — percentil na própria empresa; <3 compras: global
    f = f.sort_values("trans_date").reset_index(drop=True)
    def pct_rank(v):
        return v.rank(pct=True, method="average")
    counts = f.groupby("issuer_cik")["acc"].transform("count")
    within = f.groupby("issuer_cik")["value"].transform(pct_rank)
    global_ = pct_rank(f["value"])
    f["size_pts"] = np.where(counts >= 3, within, global_) * 20.0
    f["size_estimated"] = True  # remuneração não disponível: sempre estimado

    # compra em grupo (peso 15) — insiders distintos no emissor em 30d até a transação
    f["group_n"] = 1
    for cik, g in f.groupby("issuer_cik"):
        if len(g) == 1:
            continue
        dates = g["trans_date"].values
        owners_ = g["owner_cik"].values
        n = []
        for i in range(len(g)):
            m = (dates <= dates[i]) & (dates >= dates[i] - np.timedelta64(30, "D"))
            n.append(len(set(owners_[m])))
        f.loc[g.index, "group_n"] = n
    f["group_pts"] = f["group_n"].map(lambda n: GROUP_PTS.get(int(n), 15 if n >= 4 else 5))

    f["nature_pts"] = NATURE_PTS
    f["score_partial"] = (f["nature_pts"] + f["role_pts"]
                          + f["size_pts"] + f["group_pts"])

    OUT.mkdir(exist_ok=True)
    f.to_csv(OUT / "signals.csv", index=False)
    tickers = sorted(f["ticker"].unique())
    (OUT / "tickers.txt").write_text("\n".join(tickers) + "\n")
    print(f"\nSinais: {len(f)} filings | emissores: {f['issuer_cik'].nunique()} "
          f"| tickers: {len(tickers)} | descartados por ticker inválido: {bad_ticker}")
    print(f"Valor mediano da compra: US$ {f['value'].median():,.0f}")


if __name__ == "__main__":
    main()
