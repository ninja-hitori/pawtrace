import uuid
from datetime import datetime, timezone
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image

from app import config
from app.services import db, storage
from app.services.exif import extract_exif
from app.services.location import resolve_location
from app.services.risk import risk_score

router = APIRouter(prefix="/api/sightings")


def _validate_image(data: bytes) -> str:
    if not data:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(data) > config.MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image is too large (max 10 MB).")
    try:
        with Image.open(BytesIO(data)) as img:
            fmt = img.format
            img.verify()
    except Exception:
        raise HTTPException(400, "The uploaded file is not a valid image. Please upload a JPEG, PNG or WebP photo.")
    if fmt not in config.ALLOWED_FORMATS:
        raise HTTPException(400, f"Unsupported image type ({fmt}). Please upload a JPEG, PNG or WebP photo.")
    return fmt


@router.post("", status_code=201)
async def create_sighting(
    image: UploadFile = File(...),
    landmark_description: str = Form(""),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    injured_or_distressed: bool = Form(False),
    attack_reported: bool = Form(False),
    concerning_behaviour: bool = Form(False),
    high_pedestrian_activity: bool = Form(False),
):
    data = await image.read()
    fmt = _validate_image(data)

    landmark = landmark_description.strip()
    if (latitude is None) != (longitude is None):
        raise HTTPException(422, "Provide both latitude and longitude, or neither.")
    if latitude is not None and not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise HTTPException(422, "Latitude must be between -90 and 90 and longitude between -180 and 180.")

    exif = extract_exif(data)
    eff_lat, eff_lon, source = resolve_location(exif["exif_latitude"], exif["exif_longitude"], latitude, longitude)
    if source == "none" and not landmark:
        raise HTTPException(422, "No location available: the photo has no GPS data, so please enter coordinates or describe a nearby landmark.")

    try:
        image_url = storage.save_image(data, config.ALLOWED_FORMATS[fmt], f"image/{fmt.lower()}")
    except Exception as e:
        raise HTTPException(502, f"Could not store the photograph; the report was not saved. ({type(e).__name__})")

    row = {
        "id": str(uuid.uuid4()),
        "image_url": image_url,
        "landmark_description": landmark or None,
        "latitude": eff_lat,
        "longitude": eff_lon,
        "location_source": source,
        "manual_latitude": latitude,
        "manual_longitude": longitude,
        "exif_latitude": exif["exif_latitude"],
        "exif_longitude": exif["exif_longitude"],
        "exif_captured_at": exif["exif_captured_at"],
        "reported_at": datetime.now(timezone.utc).isoformat(),
        "injured_or_distressed": injured_or_distressed,
        "attack_reported": attack_reported,
        "concerning_behaviour": concerning_behaviour,
        "high_pedestrian_activity": high_pedestrian_activity,
        "risk_score": risk_score(injured_or_distressed, attack_reported, concerning_behaviour, high_pedestrian_activity),
        "status": "open",
        "verified_dog_id": None,
    }
    try:
        saved = db.insert_sighting(row)
    except Exception as e:
        raise HTTPException(502, f"Could not save the report to the database; nothing was submitted. ({type(e).__name__})")

    return {**saved, "exif_status": exif["exif_status"]}


@router.get("")
def list_sightings(status: Optional[str] = None):
    return {"sightings": db.list_sightings(status)}


@router.get("/{sighting_id}")
def get_sighting(sighting_id: str):
    row = db.get_sighting(sighting_id)
    if not row:
        raise HTTPException(404, "Sighting not found.")
    return row
