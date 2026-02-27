"""Client LLM — abstraction autour de Gemini."""

import google.generativeai as genai
from config import get_settings


def _configure():
    s = get_settings()
    genai.configure(api_key=s.gemini_api_key)


def get_chat_model():
    """Retourne un modèle Gemini pour le chat."""
    _configure()
    s = get_settings()
    return genai.GenerativeModel(s.chat_model)


async def generate_stream(prompt: str, system: str = ""):
    """Génère une réponse en streaming."""
    model = get_chat_model()
    chat = model.start_chat()

    if system:
        # Gemini gère le system prompt via le premier message
        full_prompt = f"{system}\n\n---\n\n{prompt}"
    else:
        full_prompt = prompt

    response = model.generate_content(full_prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text
