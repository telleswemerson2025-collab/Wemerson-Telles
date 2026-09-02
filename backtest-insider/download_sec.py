#!/usr/bin/env python3
"""Baixa os Insider Transactions Data Sets (form345) trimestrais da SEC.

A SEC exige User-Agent com nome e e-mail de contato (senão 403).
Uso: python3 download_sec.py --ua "Nome Sobrenome email@dominio.com"
"""
import argparse
import pathlib
import sys
import time

import requests

BASE = "https://www.sec.gov/files/dera/data/form-345/{q}_form345.zip"
DEST = pathlib.Path(__file__).parent / "sec"


def quarters(start_year=2024):
    import datetime
    today = datetime.date.today()
    for y in range(start_year, today.year + 1):
        for q in range(1, 5):
            yield f"{y}q{q}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ua", required=True, help="User-Agent: nome e e-mail de contato")
    args = ap.parse_args()
    DEST.mkdir(parents=True, exist_ok=True)
    headers = {"User-Agent": args.ua, "Accept-Encoding": "gzip, deflate"}
    got, missing = [], []
    for q in quarters():
        path = DEST / f"{q}_form345.zip"
        if path.exists() and path.stat().st_size > 1_000_000:
            got.append(q)
            continue
        url = BASE.format(q=q)
        try:
            r = requests.get(url, headers=headers, timeout=120)
        except requests.RequestException as e:
            print(f"{q}: ERRO de rede: {e}", file=sys.stderr)
            missing.append(q)
            continue
        if r.status_code == 200 and len(r.content) > 1_000_000:
            path.write_bytes(r.content)
            print(f"{q}: OK ({len(r.content)/1e6:.1f} MB)")
            got.append(q)
        else:
            # 404 = trimestre ainda não publicado (esperado para o mais recente)
            print(f"{q}: HTTP {r.status_code} — pulando")
            missing.append(q)
        time.sleep(0.5)  # cortesia com a SEC
    print(f"\nBaixados: {len(got)} trimestres: {', '.join(got)}")
    if not got:
        sys.exit("Nenhum trimestre baixado — verifique rede/User-Agent.")


if __name__ == "__main__":
    main()
