"""Maps — modèles Pydantic."""

from pydantic import BaseModel
from datetime import datetime


class MapCreate(BaseModel):
    name: str
    description: str = ""
    image_url: str = ""  # URL Supabase Storage


class MapUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image_url: str | None = None


class MapOut(BaseModel):
    id: str
    universe_id: str
    name: str
    description: str
    image_url: str
    created_at: datetime
    updated_at: datetime


class MarkerCreate(BaseModel):
    map_id: str
    name: str
    description: str = ""
    marker_type: str = "location"  # location, city, landmark, region, battle
    x: float
    y: float
    linked_entity_type: str | None = None  # character, faction, event
    linked_entity_id: str | None = None


class MarkerUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    marker_type: str | None = None
    x: float | None = None
    y: float | None = None
    linked_entity_type: str | None = None
    linked_entity_id: str | None = None


class MarkerOut(BaseModel):
    id: str
    map_id: str
    name: str
    description: str
    marker_type: str
    x: float
    y: float
    linked_entity_type: str | None
    linked_entity_id: str | None
