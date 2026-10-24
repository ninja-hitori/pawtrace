import uuid

from app import config


def save_image(data: bytes, ext: str, content_type: str) -> str:
    """Store the photo locally; return a URL path usable by the frontend."""
    name = f"{uuid.uuid4().hex}{ext}"
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (config.UPLOAD_DIR / name).write_bytes(data)
    return f"/uploads/{name}"
