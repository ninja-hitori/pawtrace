import json
import threading

from app import config

_lock = threading.Lock()


def _read_local() -> list:
    if not config.DB_FILE.exists():
        return []
    return json.loads(config.DB_FILE.read_text())


def insert_sighting(row: dict) -> dict:
    """Persist a sighting locally; raises on failure."""
    with _lock:
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        rows = _read_local()
        rows.append(row)
        tmp = config.DB_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(rows, indent=2))
        tmp.replace(config.DB_FILE)
    return row


def list_sightings(status: str | None = None) -> list:
    rows = _read_local()
    if status:
        rows = [r for r in rows if r.get("status") == status]
    return sorted(rows, key=lambda r: r["reported_at"], reverse=True)


def get_sighting(sid: str) -> dict | None:
    return next((r for r in _read_local() if r["id"] == sid), None)
