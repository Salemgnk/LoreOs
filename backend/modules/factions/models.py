"""FactionEngine — modèles Pydantic.

Module V1 : Factions, alliances, conflits, équilibres des pouvoirs.
"""

from pydantic import BaseModel
from datetime import datetime


class FactionCreate(BaseModel):
    name: str
    description: str = ""
    ideology: str = ""
    leader_id: str | None = None  # character_id
    territory: str = ""
    power_level: int = 5  # 1-10


class FactionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    ideology: str | None = None
    leader_id: str | None = None
    territory: str | None = None
    power_level: int | None = None


class FactionOut(BaseModel):
    id: str
    universe_id: str
    name: str
    description: str
    ideology: str
    leader_id: str | None
    territory: str
    power_level: int
    created_at: datetime
    updated_at: datetime
