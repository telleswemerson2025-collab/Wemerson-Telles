#!/usr/bin/env python3
"""
validate.py — valida os artefatos de um ciclo contra os JSON Schemas (VantageNode-X).

Reutilizado pelos scripts de orquestração (run_cycle.sh / publish.sh / collect.sh) para
garantir que cada artefato está conforme o contrato antes de o pipeline avançar.

Usa `jsonschema` se instalado (validação completa); se não, cai numa checagem mínima dos
campos obrigatórios de topo — o pipeline continua rodável sem dependências externas.

Uso:
    python lib/validate.py <cycle_id>            # valida todos os artefatos presentes
    python lib/validate.py <cycle_id> 03_copy.json   # valida um artefato específico
Saída: código 0 se tudo válido; 1 se algum artefato falhar (ou não existir, quando pedido explicitamente).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import List, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEMAS_DIR = REPO_ROOT / "schemas"
CYCLES_DIR = REPO_ROOT / "cycles"

# Artefato -> schema. A ordem reflete o fluxo 00->06.
SCHEMA_MAP = {
    "00_data.json": "data.schema.json",
    "00_brief.json": "brief.schema.json",
    "03_copy.json": "copy.schema.json",
    "04_review.json": "review.schema.json",
    "05_published.json": "published.schema.json",
    "06_metrics.json": "metrics.schema.json",
}
# 02_chart.png (imagem) e 02_chart_meta.json (sem schema formal) não entram aqui.


class ValidationError(Exception):
    pass


def _validate_one(data: dict, schema: dict) -> None:
    try:
        import jsonschema  # type: ignore
        jsonschema.validate(instance=data, schema=schema)
    except ImportError:
        missing = [k for k in schema.get("required", []) if k not in data]
        if missing:
            raise ValidationError(f"campos obrigatórios ausentes: {', '.join(missing)}")
    except Exception as exc:  # jsonschema.ValidationError
        msg = getattr(exc, "message", str(exc))
        raise ValidationError(msg) from exc


def validate_artifact(cycle_id: str, name: str) -> None:
    """Valida um artefato. Lança ValidationError se inválido ou ausente."""
    if name not in SCHEMA_MAP:
        raise ValidationError(f"'{name}' não tem schema mapeado.")
    path = CYCLES_DIR / cycle_id / name
    if not path.exists():
        raise ValidationError(f"{path} não existe.")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValidationError(f"JSON inválido em {name}: {exc}") from exc
    schema = json.loads((SCHEMAS_DIR / SCHEMA_MAP[name]).read_text(encoding="utf-8"))
    _validate_one(data, schema)


def validate_cycle(cycle_id: str) -> List[Tuple[str, bool, str]]:
    """Valida todos os artefatos presentes do ciclo. Retorna [(nome, ok, msg)]."""
    results: List[Tuple[str, bool, str]] = []
    cdir = CYCLES_DIR / cycle_id
    if not cdir.exists():
        raise ValidationError(f"ciclo '{cycle_id}' não existe em {CYCLES_DIR}.")
    for name in SCHEMA_MAP:
        if not (cdir / name).exists():
            continue
        try:
            validate_artifact(cycle_id, name)
            results.append((name, True, "ok"))
        except ValidationError as exc:
            results.append((name, False, str(exc)))
    return results


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv:
        print("uso: python lib/validate.py <cycle_id> [artefato.json]", file=sys.stderr)
        return 2
    cycle_id = argv[0]
    try:
        if len(argv) >= 2:
            validate_artifact(cycle_id, argv[1])
            print(f"ok: {argv[1]}")
            return 0
        results = validate_cycle(cycle_id)
    except ValidationError as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1

    if not results:
        print(f"(nenhum artefato validável presente em cycles/{cycle_id}/)")
        return 0
    ok = True
    for name, good, msg in results:
        print(f"  {'ok ' if good else 'FALHA'}  {name}" + ("" if good else f"  — {msg}"))
        ok = ok and good
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
