"""Service d'embeddings — génère des vecteurs via Gemini text-embedding-004."""

import google.generativeai as genai
from config import get_settings


def _configure():
    s = get_settings()
    genai.configure(api_key=s.gemini_api_key)


def embed_text(text: str) -> list[float]:
    """Embed un seul texte, retourne un vecteur."""
    _configure()
    s = get_settings()
    result = genai.embed_content(
        model=s.embedding_model,
        content=text,
        task_type="retrieval_document",
    )
    return result["embedding"]


def embed_query(query: str) -> list[float]:
    """Embed une requête utilisateur (task_type différent)."""
    _configure()
    s = get_settings()
    result = genai.embed_content(
        model=s.embedding_model,
        content=query,
        task_type="retrieval_query",
    )
    return result["embedding"]


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed un batch de textes."""
    _configure()
    s = get_settings()
    result = genai.embed_content(
        model=s.embedding_model,
        content=texts,
        task_type="retrieval_document",
    )
    return result["embedding"]
