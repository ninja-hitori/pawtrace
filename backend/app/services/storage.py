import uuid
from app import config


def save_image(data: bytes, ext: str, content_type: str) -> str:
    """Store the photo; return a URL/path usable by the frontend. Raises on failure."""
    name = f"{uuid.uuid4().hex}{ext}"
    if config.STORAGE_MODE == "supabase":
        import httpx
        url = f"{config.SUPABASE_URL}/storage/v1/object/{config.SUPABASE_BUCKET}/{name}"
        r = httpx.post(url, content=data, timeout=30, headers={
            "Authorization": f"Bearer {config.SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": config.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": content_type, "x-upsert": "false"})
        r.raise_for_status()
        return f"{config.SUPABASE_URL}/storage/v1/object/public/{config.SUPABASE_BUCKET}/{name}"
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (config.UPLOAD_DIR / name).write_bytes(data)
    return f"/uploads/{name}"
