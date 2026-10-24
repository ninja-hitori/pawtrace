def risk_score(injured: bool, attack: bool, behaviour: bool, pedestrians: bool) -> int:
    """Preliminary rule-based score 0-100 from resident answers only; not a confirmed assessment."""
    return min(100, (30 if attack else 0) + (30 if behaviour else 0) + (25 if injured else 0) + (15 if pedestrians else 0))
