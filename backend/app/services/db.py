import json
import threading
from typing import Optional
from app import config

_lock = threading.Lock()


def _sb_headers(extra=None):
    h = {"Authorization": f"Bearer {config.SUPABASE_SERVICE_ROLE_KEY}", "apikey": config.SUPABASE_SERVICE_ROLE_KEY}
    h.update(extra or {})
    return h


def _read_local() -> list:
    if not config.DB_FILE.exists():
        return []
    return json.loads(config.DB_FILE.read_text())


def insert_sighting(row: dict) -> dict:
    """Persist a sighting; raises on failure so callers never report false success."""
    if config.DB_MODE == "supabase":
        import httpx
        r = httpx.post(f"{config.SUPABASE_URL}/rest/v1/sightings", json=row, timeout=30,
                       headers=_sb_headers({"Prefer": "return=representation"}))
        r.raise_for_status()
        return r.json()[0]
    with _lock:
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        rows = _read_local()
        rows.append(row)
        tmp = config.DB_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(rows, indent=2))
        tmp.replace(config.DB_FILE)
    return row


def list_sightings(status: Optional[str] = None) -> list:
    if config.DB_MODE == "supabase":
        import httpx
        params = {"select": "*", "order": "reported_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        r = httpx.get(f"{config.SUPABASE_URL}/rest/v1/sightings", params=params, timeout=30, headers=_sb_headers())
        r.raise_for_status()
        return r.json()
    rows = _read_local()
    if status:
        rows = [r for r in rows if r.get("status") == status]
    return sorted(rows, key=lambda r: r["reported_at"], reverse=True)


def get_sighting(sid: str) -> Optional[dict]:
    if config.DB_MODE == "supabase":
        import httpx
        r = httpx.get(f"{config.SUPABASE_URL}/rest/v1/sightings", params={"select": "*", "id": f"eq.{sid}"},
                      timeout=30, headers=_sb_headers())
        r.raise_for_status()
        data = r.json()
        return data[0] if data else None
    return next((r for r in _read_local() if r["id"] == sid), None)
