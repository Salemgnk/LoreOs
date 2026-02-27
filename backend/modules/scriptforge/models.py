"""ScriptForge — modèles (V2 — à implémenter).

Systèmes d'écriture fictifs, alphabets, syllabaires.
"""

from pydantic import BaseModel


class WritingSystemCreate(BaseModel):
    name: str
    description: str = ""
    system_type: str = "alphabet"  # alphabet, syllabary, logographic
    language_id: str | None = None
    glyphs_data: dict = {}  # données des glyphes pour le rendu Canvas
