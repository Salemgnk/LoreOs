"""Universes — modèles Pydantic."""

from pydantic import BaseModel
from datetime import datetime


class UniverseCreate(BaseModel):
    name: str
    description: str = ""
    genre: str = "fantasy"  # comma-separated tags: "fantasy,dark romance,horreur"


class UniverseUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    genre: str | None = None


class UniverseOut(BaseModel):
    id: str
    name: str
    description: str
    genre: str
    user_id: str
    created_at: datetime
    updated_at: datetime
