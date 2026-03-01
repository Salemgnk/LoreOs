"""Characters — modèles Pydantic."""

from pydantic import BaseModel
from datetime import datetime


class CharacterCreate(BaseModel):
    name: str
    title: str = ""
    description: str = ""
    traits: list[str] = []
    faction_id: str | None = None
    location: str = ""
    backstory: str = ""
    notes: str = ""
    # Extended fields
    age: str = ""           # "20 ans", "immortel", etc.
    occupation: str = ""    # "Étudiante en informatique"
    appearance: str = ""    # Physical description
    powers: str = ""        # Abilities / supernatural powers
    objectives: str = ""    # Goals & motivations
    quotes: list[str] = []  # Memorable quotes


class CharacterUpdate(BaseModel):
    name: str | None = None
    title: str | None = None
    description: str | None = None
    traits: list[str] | None = None
    faction_id: str | None = None
    location: str | None = None
    backstory: str | None = None
    notes: str | None = None
    # Extended fields
    age: str | None = None
    occupation: str | None = None
    appearance: str | None = None
    powers: str | None = None
    objectives: str | None = None
    quotes: list[str] | None = None


class CharacterOut(BaseModel):
    id: str
    universe_id: str
    name: str
    title: str
    description: str
    traits: list[str]
    faction_id: str | None
    location: str
    backstory: str
    notes: str
    # Extended fields (with defaults for backward compat)
    age: str = ""
    occupation: str = ""
    appearance: str = ""
    powers: str = ""
    objectives: str = ""
    quotes: list[str] = []
    created_at: datetime
    updated_at: datetime


class RelationCreate(BaseModel):
    source_id: str
    target_id: str
    relation_type: str  # ally, enemy, family, rival, mentor, lover, etc.
    description: str = ""


class RelationOut(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str
    description: str
