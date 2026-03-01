"""Service d'embeddings — génère des vecteurs via Gemini gemini-embedding-001."""

from google import genai
from google.genai import types
from config import get_settings

_client = None


def _get_client():
    global _client
    if _client is None:
        s = get_settings()
        if not s.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY non configurée")
        _client = genai.Client(api_key=s.gemini_api_key)
    return _client


def _embed_config() -> types.EmbedContentConfig:
    """Config commune : tronque à embedding_dimension (768 par défaut)."""
    s = get_settings()
    return types.EmbedContentConfig(output_dimensionality=s.embedding_dimension)


def embed_text(text: str) -> list[float]:
    """Embed un seul texte, retourne un vecteur."""
    client = _get_client()
    s = get_settings()
    result = client.models.embed_content(
        model=s.embedding_model,
        contents=text,
        config=_embed_config(),
    )
    return result.embeddings[0].values


def embed_query(query: str) -> list[float]:
    """Embed une requête utilisateur."""
    return embed_text(query)


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed un batch de textes."""
    client = _get_client()
    s = get_settings()
    result = client.models.embed_content(
        model=s.embedding_model,
        contents=texts,
        config=_embed_config(),
    )
    return [e.values for e in result.embeddings]
