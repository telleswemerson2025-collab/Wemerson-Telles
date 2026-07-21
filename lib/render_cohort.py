#!/usr/bin/env python3
"""
render_cohort.py — gráfico de comparação de coortes (VantageNode-X).

Usado quando o evento compara coortes de um indicador (ex.: MVRV por idade: LTH vs
STH) e NÃO há série temporal extraível. Barras contra uma linha de referência
(ex.: breakeven 1,0). Segue knowledge/visual-identity.md. Todo número plotado bate
com 00_data.json (invariante 6). Emite 02_chart_meta.json para o GATEKEEPER cruzar.

Uso:
    python lib/render_cohort.py <cycle_id> --title "..." [--subtitle "..."]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent
CYCLES_DIR = REPO_ROOT / "cycles"

BG = "#0B0E11"
LINE = "#E8A33D"      # âmbar — abaixo da referência (atenção)
HILITE = "#3DDC84"    # verde — acima da referência
GRID = "#2A2E35"
TEXT = "#D6D9DE"
MUTED = "#7A828C"


def _load(cycle_id: str) -> Dict[str, Any]:
    path = CYCLES_DIR / cycle_id / "00_data.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    if "cohorts" not in data:
        raise SystemExit(f"{path} não é um snapshot de coortes (sem 'cohorts').")
    return data


def _decimals(values) -> int:
    d = 0
    for v in values:
        s = repr(float(v))
        if "." in s and "e" not in s:
            d = max(d, len(s.split(".")[1]))
    return min(d, 6)


def render_cohort(cycle_id: str, title: str, subtitle: str | None = None) -> Path:
    data = _load(cycle_id)
    cohorts = data["cohorts"]
    names = [c["name"] for c in cohorts]
    vals = [float(c["value"]) for c in cohorts]
    ref = float(data["reference"]["value"])
    ref_label = data["reference"]["label"]
    unit = data.get("unit", "")
    dec = _decimals(vals + [ref])
    fmt = lambda v: f"{v:.{dec}f}"  # noqa: E731

    fig, ax = plt.subplots(figsize=(10, 5.6), dpi=130)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    colors = [HILITE if v >= ref else LINE for v in vals]
    bars = ax.bar(names, vals, color=colors, width=0.55, zorder=3, edgecolor=BG)

    # Linha de referência (ex.: breakeven 1,0)
    ax.axhline(y=ref, color=MUTED, linestyle="--", linewidth=1.2, alpha=0.9, zorder=2)
    ax.annotate(f"{ref_label} = {fmt(ref)}", xy=(1.0, ref), xycoords=("axes fraction", "data"),
                xytext=(-6, 5), textcoords="offset points", color=MUTED, fontsize=9,
                fontfamily="monospace", ha="right", va="bottom")

    # Rótulo de valor em cada barra: acima da barra (verde) se >= ref;
    # dentro da barra, em texto escuro sobre âmbar (legível), se < ref.
    for bar, v in zip(bars, vals):
        above = v >= ref
        ax.annotate(fmt(v), xy=(bar.get_x() + bar.get_width() / 2, v),
                    xytext=(0, 6 if above else -18), textcoords="offset points",
                    color=(HILITE if above else BG), fontsize=13, fontweight="bold",
                    fontfamily="monospace", ha="center", va="bottom" if above else "top")

    for spine in ("top", "right", "left"):
        ax.spines[spine].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.tick_params(colors=TEXT, labelsize=11, length=0)
    ax.set_yticks([])
    ax.margins(y=0.22)

    fig.text(0.055, 0.945, title, color=TEXT, fontsize=16, fontweight="bold", ha="left", va="top")
    if subtitle:
        fig.text(0.055, 0.885, subtitle, color=MUTED, fontsize=11, ha="left", va="top")
    fig.text(0.055, 0.03, f"Fonte: {data['source'].get('name', 'VantageNode')} · {data.get('as_of', '')}",
             color=MUTED, fontsize=9, fontfamily="monospace", ha="left", va="bottom")
    fig.text(0.945, 0.03, f"{data['indicator']} por coorte ({unit})".strip(),
             color=MUTED, fontsize=9, fontfamily="monospace", ha="right", va="bottom")

    fig.subplots_adjust(left=0.055, right=0.955, top=0.80, bottom=0.12)
    out = CYCLES_DIR / cycle_id / "02_chart.png"
    fig.savefig(out, facecolor=BG)
    plt.close(fig)

    meta = {
        "cycle_id": cycle_id,
        "indicator": data["indicator"],
        "unit": unit,
        "chart_type": "cohort_bars",
        "title": title,
        "subtitle": subtitle or "",
        "as_of": data.get("as_of", ""),
        "reference": data["reference"],
        "numbers_plotted": [{"name": c["name"], "value": float(c["value"])} for c in cohorts],
        "source": data.get("source", {}),
        "data_ref": f"cycles/{cycle_id}/00_data.json",
    }
    (CYCLES_DIR / cycle_id / "02_chart_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Gera 02_chart.png de comparação de coortes.")
    p.add_argument("cycle_id")
    p.add_argument("--title", required=True, help="Título = a leitura (não o nome do indicador).")
    p.add_argument("--subtitle", default=None)
    args = p.parse_args(argv)
    png = render_cohort(args.cycle_id, args.title, args.subtitle)
    print(f"Gerado: {png}")
    print(f"Meta:   {png.parent / '02_chart_meta.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
