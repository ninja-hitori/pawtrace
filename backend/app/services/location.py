from typing import Optional, Tuple


def resolve_location(
    exif_lat: Optional[float], exif_lon: Optional[float],
    manual_lat: Optional[float], manual_lon: Optional[float],
) -> Tuple[Optional[float], Optional[float], str]:
    """Rule: manual coordinates win (the resident can correct a wrong photo location);
    otherwise EXIF coordinates; otherwise none. Both raw sources are always stored untouched,
    and location_source records which one was used."""
    if manual_lat is not None and manual_lon is not None:
        return manual_lat, manual_lon, "manual"
    if exif_lat is not None and exif_lon is not None:
        return exif_lat, exif_lon, "exif"
    return None, None, "none"
