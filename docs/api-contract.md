# API contract (starting version)

POST /api/sightings  (multipart/form-data) -> 201
  image: file (JPEG/PNG/WebP, max 10 MB)             required
  landmark_description: text                          optional if coordinates or photo GPS exist
  latitude, longitude: float (both or neither)        optional
  injured_or_distressed, attack_reported,
  concerning_behaviour, high_pedestrian_activity: "true"/"false"
Response: the sighting row (fields below) plus exif_status
  ("gps_and_time" | "time_only" | "gps_only" | "no_metadata" | "unreadable").
Errors: JSON {"detail": "message"} with 400 (bad image), 413 (too large), 422 (bad input/no location), 502 (storage/database failure).

GET /api/sightings?status=open  -> {"sightings": [row, ...]}
GET /api/sightings/{id}         -> row, or 404
GET /health

Sighting row: id, image_url, landmark_description, latitude, longitude, location_source ("exif"|"manual"|"none"),
manual_latitude, manual_longitude, exif_latitude, exif_longitude, exif_captured_at, reported_at,
injured_or_distressed, attack_reported, concerning_behaviour, high_pedestrian_activity,
risk_score (0-100, preliminary), status ("open"|"closed"), verified_dog_id.

Effective location rule: manual coordinates win; otherwise EXIF; otherwise null. Both raw sources are always stored.
Note: manual_latitude / manual_longitude are additions to the minimum field list in the execution plan.
Local mode image_url is relative (/uploads/...); prefix with the backend base URL.
