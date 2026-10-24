"""EXIF extraction. Never raises: any problem yields empty metadata."""
from datetime import datetime
from io import BytesIO
from typing import Optional

from PIL import Image

GPS_IFD = 0x8825
EXIF_IFD = 0x8769
TAG_DATETIME_ORIGINAL = 36867
TAG_DATETIME_DIGITIZED = 36868
TAG_DATETIME = 306


def _dms_to_deg(dms, ref) -> Optional[float]:
    try:
        d, m, s = (float(x) for x in dms)
        deg = d + m / 60.0 + s / 3600.0
        if isinstance(ref, bytes):
            ref = ref.decode(errors="ignore")
        if str(ref).strip().upper() in ("S", "W"):
            deg = -deg
        return deg
    except Exception:
        return None


def _parse_dt(value) -> Optional[str]:
    if isinstance(value, bytes):
        value = value.decode(errors="ignore")
    if not isinstance(value, str):
        return None
    value = value.strip().strip("\x00")
    for fmt in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(value, fmt).isoformat()
        except ValueError:
            continue
    return None


def extract_exif(image_bytes: bytes) -> dict:
    """Return {exif_latitude, exif_longitude, exif_captured_at, exif_status}.

    exif_status: 'gps_and_time' | 'time_only' | 'gps_only' | 'no_metadata' | 'unreadable'.
    Values that cannot be read are None; nothing is fabricated.
    """
    result = {"exif_latitude": None, "exif_longitude": None, "exif_captured_at": None, "exif_status": "no_metadata"}
    try:
        with Image.open(BytesIO(image_bytes)) as img:
            exif = img.getexif()
            if not exif:
                return result

            try:
                sub = exif.get_ifd(EXIF_IFD)
            except Exception:
                sub = {}
            for tag, src in ((TAG_DATETIME_ORIGINAL, sub), (TAG_DATETIME_DIGITIZED, sub), (TAG_DATETIME, exif)):
                parsed = _parse_dt(src.get(tag)) if src else None
                if parsed:
                    result["exif_captured_at"] = parsed
                    break

            try:
                gps = exif.get_ifd(GPS_IFD)
            except Exception:
                gps = {}
            if gps and 2 in gps and 4 in gps:
                lat = _dms_to_deg(gps[2], gps.get(1, "N"))
                lon = _dms_to_deg(gps[4], gps.get(3, "E"))
                if lat is not None and lon is not None and -90 <= lat <= 90 and -180 <= lon <= 180:
                    result["exif_latitude"] = lat
                    result["exif_longitude"] = lon
    except Exception:
        result["exif_status"] = "unreadable"
        return result

    has_gps = result["exif_latitude"] is not None
    has_time = result["exif_captured_at"] is not None
    result["exif_status"] = (
        "gps_and_time" if has_gps and has_time else "time_only" if has_time else "gps_only" if has_gps else "no_metadata"
    )
    return result
