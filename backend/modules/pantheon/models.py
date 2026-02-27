"""PantheonForge — modèles (V1 — à implémenter).

Mythologies, panthéons, cosmologies, rites, tabous, clergé.
"""

from pydantic import BaseModel
from datetime import datetime


class DeityCreate(BaseModel):
    name: str
    domain: str = ""  # guerre, mort, nature, amour...
    description: str = ""
    alignment: str = ""  # bienveillant, neutre, maléfique
    symbols: list[str] = []
    worship_style: str = ""


class ReligionCreate(BaseModel):
    name: str
    description: str = ""
    cosmology: str = ""
    main_deities: list[str] = []  # deity_ids
    rites: str = ""
    taboos: str = ""
