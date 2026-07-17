#!/usr/bin/env python3
"""
fetch_data.py — acesso aos dados de um ciclo (VantageNode-X).

Fase de teste: MODO MANUAL. Não integramos a API real da VantageNode ainda
(bloqueadores: token e bug no endpoint de MVRV, ambos dependem do Gui). Em vez
disso, Mr. G transfere os valores da aba da VantageNode para
`cycles/<id>/00_data.json`, e este módulo apenas carrega e valida esse arquivo —
que é a fonte-de-verdade dos números do ciclo (invariante 6 do CLAUDE.md).

O caminho da API real existe como stub (`fetch_from_api`) e só liga quando um
token estiver presente — deliberadamente desligado por ora.

Uso (CLI):
    python lib/fetch_data.py scaffold <cycle_id> [--indicator MVRV]
        Cria cycles/<cycle_id>/00_data.json em branco para preencher à mão.
    python lib/fetch_data.py load <cycle_id>
        Carrega e valida o 00_data.json do ciclo; imprime o resumo.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

# Raiz do repo = pasta pai de lib/
REPO_ROOT = Path(__file__).resolve().parent.parent
CYCLES_DIR = REPO_ROOT / "cycles"
SCHEMA_PATH = REPO_ROOT / "schemas" / "data.schema.json"

DATA_FILENAME = "00_data.json"


class DataError(Exception):
    """Problema ao carregar/validar o dado de entrada do ciclo."""


def cycle_dir(cycle_id: str) -> Path:
    return CYCLES_DIR / cycle_id


def data_path(cycle_id: str) -> Path:
    return cycle_dir(cycle_id) / DATA_FILENAME


# --------------------------------------------------------------------------- #
# MODO MANUAL (ativo na fase de teste)
# --------------------------------------------------------------------------- #

def load_cycle_data(cycle_id: str) -> Dict[str, Any]:
    """
    Carrega cycles/<id>/00_data.json (preenchido à mão) e valida.
    Esta é a fonte-de-verdade dos números do ciclo.
    """
    path = data_path(cycle_id)
    if not path.exists():
        raise DataError(
            f"{path} não existe. Rode `scaffold {cycle_id}` e preencha os valores "
            f"trazidos da VantageNode antes de rodar o ciclo."
        )
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise DataError(f"{path} não é JSON válido: {exc}") from exc

    validate_against_schema(data)
    _sanity_checks(cycle_id, data)
    return data


def _sanity_checks(cycle_id: str, data: Dict[str, Any]) -> None:
    """Checagens leves que não dependem de biblioteca de schema."""
    if data.get("cycle_id") not in (None, cycle_id):
        raise DataError(
            f"cycle_id no arquivo ('{data.get('cycle_id')}') difere da pasta ('{cycle_id}')."
        )
    series = data.get("series") or []
    if any(pt.get("v") is None for pt in series):
        raise DataError("Há ponto na série sem valor 'v' — preencha ou remova.")


def validate_against_schema(data: Dict[str, Any]) -> None:
    """
    Valida contra schemas/data.schema.json usando `jsonschema` se instalado.
    Se a lib não existir, faz uma validação mínima dos campos obrigatórios —
    o pipeline continua rodável sem dependências externas na fase de teste.
    """
    try:
        import jsonschema  # type: ignore
    except ImportError:
        _minimal_required_check(data)
        return

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    try:
        jsonschema.validate(instance=data, schema=schema)
    except jsonschema.ValidationError as exc:  # type: ignore
        raise DataError(f"00_data.json fora do schema: {exc.message}") from exc


def _minimal_required_check(data: Dict[str, Any]) -> None:
    required = ["cycle_id", "indicator", "source", "as_of", "unit", "latest_value", "series"]
    missing = [k for k in required if k not in data]
    if missing:
        raise DataError(f"Campos obrigatórios ausentes no 00_data.json: {', '.join(missing)}")


def scaffold_cycle_data(cycle_id: str, indicator: str = "") -> Path:
    """Cria um 00_data.json em branco para o Mr. G preencher à mão."""
    path = data_path(cycle_id)
    if path.exists():
        raise DataError(f"{path} já existe — não vou sobrescrever.")
    path.parent.mkdir(parents=True, exist_ok=True)

    today = datetime.now(timezone.utc).date().isoformat()
    template = {
        "cycle_id": cycle_id,
        "indicator": indicator or "<NOME_DO_INDICADOR>",
        "source": {
            "name": "VantageNode",
            "url": "",
            "captured_by": "Mr. G — transferência manual da aba VantageNode",
            "captured_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        },
        "as_of": today,
        "unit": "<unidade, ex.: ratio>",
        "latest_value": 0,
        "series": [
            {"t": today, "v": 0},
            {"t": today, "v": 0},
        ],
        "notes": "Preencha com os valores lidos na VantageNode. Substitua os placeholders.",
    }
    path.write_text(json.dumps(template, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


# --------------------------------------------------------------------------- #
# MODO API (stub — Fase 2, desligado por ora)
# --------------------------------------------------------------------------- #

def fetch_from_api(indicator: str, *, days: int = 90) -> Dict[str, Any]:
    """
    Busca a série de um indicador na API da VantageNode.

    STUB — desligado na fase de teste. Só liga quando VANTAGENODE_API_TOKEN
    estiver no ambiente. Bloqueadores conhecidos antes de implementar de verdade:
      - token da API (depende do Gui);
      - bug conhecido no endpoint de MVRV (depende do Gui).
    Enquanto isso, use o MODO MANUAL (load_cycle_data / scaffold_cycle_data).
    """
    token = os.environ.get("VANTAGENODE_API_TOKEN")
    base_url = os.environ.get("VANTAGENODE_API_BASE_URL")
    if not token or not base_url:
        raise NotImplementedError(
            "Modo API desligado: faltam VANTAGENODE_API_TOKEN/VANTAGENODE_API_BASE_URL. "
            "Na fase de teste, transfira os dados à mão para 00_data.json e use o modo manual."
        )
    # TODO(Fase 2): montar requisição real, tratar o bug do endpoint de MVRV,
    # normalizar para o formato de data.schema.json, cachear resposta.
    raise NotImplementedError("Integração real com a API da VantageNode ainda não implementada (Fase 2).")


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

def _cmd_scaffold(args: argparse.Namespace) -> int:
    path = scaffold_cycle_data(args.cycle_id, args.indicator or "")
    print(f"Criado: {path}")
    print("Preencha os valores trazidos da VantageNode e rode `load` para validar.")
    return 0


def _cmd_load(args: argparse.Namespace) -> int:
    data = load_cycle_data(args.cycle_id)
    print(f"OK — {data['indicator']} @ {data['as_of']}")
    print(f"  latest_value: {data['latest_value']} {data.get('unit', '')}")
    print(f"  pontos na série: {len(data.get('series', []))}")
    print(f"  fonte: {data['source'].get('captured_by', '?')}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Dados de um ciclo VantageNode-X (modo manual).")
    sub = parser.add_subparsers(dest="command", required=True)

    p_scaffold = sub.add_parser("scaffold", help="cria um 00_data.json em branco para preencher à mão")
    p_scaffold.add_argument("cycle_id")
    p_scaffold.add_argument("--indicator", default="", help="nome do indicador (opcional)")
    p_scaffold.set_defaults(func=_cmd_scaffold)

    p_load = sub.add_parser("load", help="carrega e valida o 00_data.json do ciclo")
    p_load.add_argument("cycle_id")
    p_load.set_defaults(func=_cmd_load)

    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except DataError as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
