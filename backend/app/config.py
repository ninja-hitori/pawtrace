import os
from pathlib import Path

DATA_DIR = Path(os.getenv("LOCAL_DATA_DIR", Path(__file__).resolve().parent.parent / "local_data"))
UPLOAD_DIR = DATA_DIR / "uploads"
DB_FILE = DATA_DIR / "sightings.json"

DB_MODE = os.getenv("DB_MODE", "local")
STORAGE_MODE = os.getenv("STORAGE_MODE", "local")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "dog-photos")

MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
