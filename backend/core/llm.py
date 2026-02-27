"""Client LLM — abstraction autour de Gemini (google-genai SDK)."""

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


async def generate_stream(prompt: str, system: str = ""):
    """Génère une réponse en streaming."""
    client = _get_client()
    s = get_settings()

    config = types.GenerateContentConfig()
    if system:
        config.system_instruction = system

    response = client.models.generate_content_stream(
        model=s.chat_model,
        contents=prompt,
        config=config,
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text
