"""LoreChat — logique métier (RAG conversationnel)."""

from database import get_supabase
from core.rag import rag_stream


async def save_message(universe_id: str, role: str, content: str) -> dict:
    db = get_supabase()
    result = (
        db.table("chat_history")
        .insert({"universe_id": universe_id, "role": role, "content": content})
        .execute()
    )
    return result.data[0]


async def get_history(universe_id: str, limit: int = 50) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("chat_history")
        .select("*")
        .eq("universe_id", universe_id)
        .order("created_at", desc=False)
        .limit(limit)
        .execute()
    )
    return result.data


async def chat_stream(universe_id: str, question: str):
    """Sauvegarde la question, stream la réponse, sauvegarde la réponse."""
    await save_message(universe_id, "user", question)

    full_response = ""
    async for token in rag_stream(universe_id, question):
        full_response += token
        yield token

    await save_message(universe_id, "assistant", full_response)
