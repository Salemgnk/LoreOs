"""LangForge — modèles (V2 — à implémenter).

Construction de langues fictives : phonologie, grammaire, vocabulaire, dialectes.
"""

from pydantic import BaseModel


class LanguageCreate(BaseModel):
    name: str
    description: str = ""
    phonology: str = ""  # système phonologique
    grammar_rules: str = ""
    vocabulary_roots: list[dict] = []  # [{"root": "kaz", "meaning": "pierre"}]
    writing_system_id: str | None = None
