"""ChronicleForge — modèles Pydantic.

Module V1 : Timeline historique avec conséquences logiques.
"""

from pydantic import BaseModel
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: str = ""
    date_label: str = ""  # "An 342", "3e ère, printemps"...
    sort_order: int = 0
    importance: str = "normal"  # minor, normal, major, cataclysmic
    tags: list[str] = []


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date_label: str | None = None
    sort_order: int | None = None
    importance: str | None = None
    tags: list[str] | None = None


class EventOut(BaseModel):
    id: str
    universe_id: str
    title: str
    description: str
    date_label: str
    sort_order: int
    importance: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime
