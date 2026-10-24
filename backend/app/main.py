from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import config
from app.routes import sightings

app = FastAPI(title="Smart Urban Animal Management Platform")
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")
app.include_router(sightings.router)


@app.get("/health")
def health():
    return {"status": "ok", "db_mode": config.DB_MODE, "storage_mode": config.STORAGE_MODE}
