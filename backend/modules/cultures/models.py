"""CultureWeaver — modèles (V2 — à implémenter).

Civilisations, coutumes, cuisine, architecture, art, hiérarchies.
"""

from pydantic import BaseModel


class CultureCreate(BaseModel):
    name: str
    description: str = ""
    customs: str = ""
    cuisine: str = ""
    architecture: str = ""
    art: str = ""
    social_hierarchy: str = ""
    environment_id: str | None = None  # lien vers une région de la carte
