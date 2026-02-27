"""EcosystemBuilder — modèles (V2 — à implémenter).

Faune, flore, écosystèmes cohérents avec la géographie.
"""

from pydantic import BaseModel


class CreatureCreate(BaseModel):
    name: str
    description: str = ""
    species_type: str = "fauna"  # fauna, flora
    habitat: str = ""
    ecological_role: str = ""
    interactions_with_civilizations: str = ""
    region_id: str | None = None
