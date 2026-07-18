#!/usr/bin/env python3
"""
render_chart.py — gera o 02_chart.png de um ciclo (VantageNode-X).

Segue knowledge/visual-identity.md: estética de terminal (fundo escuro, linha
âmbar, sem decoração), título = a LEITURA (não o nome do indicador), latest_value
destacado, rodapé com fonte e data. Todo número plotado bate com 00_data.json
(fonte-de-verdade, invariante 6).

Emite também 02_chart_meta.json listando cada número plotado, para o GATEKEEPER
cruzar texto = gráfico = fonte.

Uso:
    python lib/render_chart.py <cycle_id> --title "MVRV em 1,208 — faixa historicamente baixa" \\
        [--subtitle "mercado ~21% acima do custo-base realizado (16/07/2026)"]
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List

import matplotlib
matplotlib.use("Agg")  # sem display no ambiente
import matplotlib.pyplot as plt  # noqa: E402
import matplotlib.dates as mdates  # noqa: E402

from fetch_data import load_cycle_data, cycle_dir, DataError  # noqa: E402

# --- Paleta / identidade visual (visual-identity.md) ---
BG = "#0B0E11"        # fundo (terminal)
LINE = "#E8A33D"      # linha principal (âmbar)
GRID = "#2A2E35"      # grid/eixos discretos
TEXT = "#D6D9DE"      # texto principal
MUTED = "#7A828C"     # texto secundário / rodapé
HILITE = "#3DDC84"    # destaque do latest_value


def _decimals(values: List[float]) -> int:
    """Casas decimais a usar = o máximo observado nos dados (invariante 6: mesma precisão da fonte)."""
    d = 0
    for v in values:
        s = repr(float(v))
        if "." in s and "e" not in s and "E" not in s:
            d = max(d, len(s.split(".")[1]))
    return min(d, 6)


def _parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def render_chart(cycle_id: str, title: str, subtitle: str | None = None,
                 hline: float | None = None, hline_label: str | None = None) -> Path:
    data = load_cycle_data(cycle_id)  # já valida contra data.schema.json

    series = data["series"]
    xs = [_parse_date(pt["t"]) for pt in series]
    ys = [float(pt["v"]) for pt in series]
    unit = data.get("unit", "")
    as_of = data.get("as_of", "")
    latest = float(data["latest_value"])
    dec = _decimals(ys + [latest])
    fmt = lambda v: f"{v:.{dec}f}"  # noqa: E731

    fig, ax = plt.subplots(figsize=(10, 5.6), dpi=130)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    # Linha de referência opcional (ex.: breakeven em 1,0 para SOPR)
    if hline is not None:
        ax.axhline(y=hline, color=MUTED, linestyle="--", linewidth=1.1, alpha=0.8, zorder=1)
        if hline_label:
            ax.annotate(hline_label, xy=(xs[0], hline), xytext=(0, 4),
                        textcoords="offset points", color=MUTED, fontsize=9,
                        fontfamily="monospace", va="bottom", ha="left")

    # Linha + pontos
    ax.plot(xs, ys, color=LINE, linewidth=2.2, marker="o", markersize=4,
            markerfacecolor=LINE, markeredgecolor=BG, zorder=3)

    # Destaque do último ponto (latest_value)
    ax.scatter([xs[-1]], [ys[-1]], s=90, color=HILITE, zorder=4,
               edgecolor=BG, linewidth=1.5)
    ax.annotate(f"{fmt(ys[-1])} {unit}".strip(),
                xy=(xs[-1], ys[-1]), xytext=(8, 10), textcoords="offset points",
                color=HILITE, fontsize=12, fontfamily="monospace", fontweight="bold")

    # Eixos discretos
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    for spine in ("left", "bottom"):
        ax.spines[spine].set_color(GRID)
    ax.tick_params(colors=MUTED, labelsize=9)
    for lbl in ax.get_xticklabels() + ax.get_yticklabels():
        lbl.set_fontfamily("monospace")
    ax.grid(axis="y", color=GRID, linewidth=0.7, alpha=0.6)
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    ax.margins(x=0.03, y=0.18)

    # Título = a leitura (visual-identity.md)
    fig.text(0.055, 0.945, title, color=TEXT, fontsize=16, fontweight="bold", ha="left", va="top")
    if subtitle:
        fig.text(0.055, 0.885, subtitle, color=MUTED, fontsize=11, ha="left", va="top")

    # Rodapé: fonte + data (crédito e rastreabilidade)
    fig.text(0.055, 0.03, f"Fonte: {data['source'].get('name', 'VantageNode')} · {as_of}",
             color=MUTED, fontsize=9, fontfamily="monospace", ha="left", va="bottom")
    fig.text(0.945, 0.03, f"{data['indicator']} ({unit})".strip(),
             color=MUTED, fontsize=9, fontfamily="monospace", ha="right", va="bottom")

    fig.subplots_adjust(left=0.075, right=0.955, top=0.80, bottom=0.12)

    out_png = cycle_dir(cycle_id) / "02_chart.png"
    fig.savefig(out_png, facecolor=BG)
    plt.close(fig)

    _write_meta(cycle_id, data, title, subtitle, dec)
    return out_png


def _write_meta(cycle_id: str, data: Dict[str, Any], title: str, subtitle: str | None, dec: int) -> Path:
    """02_chart_meta.json: cada número plotado, para o GATEKEEPER cruzar (invariante 6)."""
    meta = {
        "cycle_id": cycle_id,
        "indicator": data["indicator"],
        "unit": data.get("unit", ""),
        "title": title,
        "subtitle": subtitle or "",
        "as_of": data.get("as_of", ""),
        "latest_value": float(data["latest_value"]),
        "decimals": dec,
        "numbers_plotted": [{"t": pt["t"], "v": float(pt["v"])} for pt in data["series"]],
        "source": data.get("source", {}),
        "data_ref": f"cycles/{cycle_id}/00_data.json",
    }
    out = cycle_dir(cycle_id) / "02_chart_meta.json"
    out.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Gera 02_chart.png de um ciclo VantageNode-X.")
    p.add_argument("cycle_id")
    p.add_argument("--title", required=True, help="Título = a leitura (não o nome do indicador).")
    p.add_argument("--subtitle", default=None)
    p.add_argument("--hline", type=float, default=None, help="linha de referência horizontal (ex.: 1.0 = breakeven do SOPR)")
    p.add_argument("--hline-label", default=None, help="rótulo da linha de referência")
    args = p.parse_args(argv)
    try:
        png = render_chart(args.cycle_id, args.title, args.subtitle, args.hline, args.hline_label)
    except DataError as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1
    print(f"Gerado: {png}")
    print(f"Meta:   {png.parent / '02_chart_meta.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
