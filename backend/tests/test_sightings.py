import importlib
import io
import json

import piexif
import pytest
from fastapi.testclient import TestClient
from PIL import Image


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("LOCAL_DATA_DIR", str(tmp_path))
    monkeypatch.setenv("DB_MODE", "local")
    monkeypatch.setenv("STORAGE_MODE", "local")
    from app import config
    importlib.reload(config)
    for m in ("app.services.storage", "app.services.db", "app.routes.sightings", "app.main"):
        importlib.reload(importlib.import_module(m))
    from app import main
    return TestClient(main.app)


def _img(fmt="JPEG", exif=None):
    buf = io.BytesIO()
    kwargs = {"exif": exif} if exif else {}
    Image.new("RGB", (32, 32), "brown").save(buf, fmt, **kwargs)
    return buf.getvalue()


def _exif(gps=True, dt=True, lat=(12, 30, 0), lon=(77, 36, 0)):
    d = {"0th": {}, "Exif": {}, "GPS": {}}
    if dt:
        d["Exif"][piexif.ExifIFD.DateTimeOriginal] = b"2026:10:20 08:15:30"
    if gps:
        d["GPS"] = {piexif.GPSIFD.GPSLatitudeRef: b"N", piexif.GPSIFD.GPSLatitude: ((lat[0], 1), (lat[1], 1), (lat[2], 1)),
                    piexif.GPSIFD.GPSLongitudeRef: b"W", piexif.GPSIFD.GPSLongitude: ((lon[0], 1), (lon[1], 1), (lon[2], 1))}
    if not dt and not gps:
        d["0th"][piexif.ImageIFD.Make] = b"TestCam"
    return piexif.dump(d)


def post(client, img, **fields):
    return client.post("/api/sightings", files={"image": ("dog.jpg", img, "image/jpeg")}, data=fields)


def test_gps_and_timestamp_extracted(client):
    r = post(client, _img(exif=_exif()), landmark_description="Near bus stop")
    assert r.status_code == 201
    j = r.json()
    assert j["exif_status"] == "gps_and_time"
    assert j["exif_latitude"] == pytest.approx(12.5)
    assert j["exif_longitude"] == pytest.approx(-77.6)  # west ref -> negative
    assert j["exif_captured_at"] == "2026-10-20T08:15:30"
    assert j["location_source"] == "exif" and j["latitude"] == pytest.approx(12.5)
    assert j["reported_at"] and j["reported_at"] != j["exif_captured_at"]
    assert j["id"] and j["image_url"].startswith("/uploads/")


def test_timestamp_without_gps_needs_location(client):
    img = _img(exif=_exif(gps=False))
    r = post(client, img)
    assert r.status_code == 422  # no coords, no landmark
    r = post(client, img, landmark_description="Park gate")
    assert r.status_code == 201
    j = r.json()
    assert j["exif_status"] == "time_only" and j["exif_captured_at"] == "2026-10-20T08:15:30"
    assert j["latitude"] is None and j["location_source"] == "none"


def test_no_exif_submits_with_manual_coordinates(client):
    r = post(client, _img("PNG"), latitude="12.97", longitude="77.59")
    assert r.status_code == 201
    j = r.json()
    assert j["exif_status"] == "no_metadata" and j["exif_captured_at"] is None and j["exif_latitude"] is None
    assert j["location_source"] == "manual" and j["latitude"] == pytest.approx(12.97)


def test_manual_does_not_overwrite_exif(client):
    r = post(client, _img(exif=_exif()), latitude="13.0", longitude="77.0")
    j = r.json()
    assert j["location_source"] == "manual" and j["latitude"] == 13.0
    assert j["exif_latitude"] == pytest.approx(12.5)  # raw EXIF preserved
    assert j["manual_latitude"] == 13.0


def test_malformed_exif_does_not_block(client):
    img = _img()
    bad = img[:2] + b"\xff\xe1\x00\x10Exif\x00\x00garbage!!" + img[2:]
    r = post(client, bad, landmark_description="Corner shop")
    assert r.status_code == 201
    assert r.json()["exif_status"] in ("no_metadata", "unreadable")


def test_invalid_uploads_rejected(client):
    assert post(client, b"not an image", landmark_description="x").status_code == 400
    assert post(client, b"", landmark_description="x").status_code == 400
    gif = io.BytesIO(); Image.new("RGB", (8, 8)).save(gif, "GIF")
    r = post(client, gif.getvalue(), landmark_description="x")
    assert r.status_code == 400 and "Unsupported" in r.json()["detail"]


def test_invalid_input(client):
    img = _img()
    assert post(client, img, latitude="12.0").status_code == 422
    assert post(client, img, latitude="95", longitude="10").status_code == 422
    assert client.post("/api/sightings", data={"landmark_description": "x"}).status_code == 422  # no image


def test_persist_and_retrieve(client):
    a = post(client, _img(), landmark_description="A", attack_reported="true", concerning_behaviour="true").json()
    b = post(client, _img(), landmark_description="B").json()
    assert a["id"] != b["id"]
    assert a["risk_score"] == 60 and b["risk_score"] == 0 and a["status"] == "open"
    got = client.get(f"/api/sightings/{a['id']}")
    assert got.status_code == 200 and got.json()["landmark_description"] == "A"
    assert len(client.get("/api/sightings").json()["sightings"]) == 2
    assert client.get("/api/sightings/nope").status_code == 404
    img_resp = client.get(a["image_url"])
    assert img_resp.status_code == 200 and img_resp.content[:2] == b"\xff\xd8"


def test_db_failure_is_not_success(client, monkeypatch):
    from app.services import db
    def boom(row): raise RuntimeError("db down")
    monkeypatch.setattr(db, "insert_sighting", boom)
    r = post(client, _img(), landmark_description="x")
    assert r.status_code == 502 and "nothing was submitted" in r.json()["detail"]


def test_storage_failure_is_not_success(client, monkeypatch):
    from app.services import storage
    def boom(*a, **k): raise OSError("disk full")
    monkeypatch.setattr(storage, "save_image", boom)
    r = post(client, _img(), landmark_description="x")
    assert r.status_code == 502
    assert client.get("/api/sightings").json()["sightings"] == []
