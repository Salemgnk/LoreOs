"""LoreChat — endpoints (SSE streaming + historique)."""

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from modules.lorechat.models import ChatRequest, ChatHistoryOut
from modules.lorechat import service

router = APIRouter()


@router.post("/")
async def chat(universe_id: str, data: ChatRequest):
    """Chat avec l'univers — réponse en SSE streaming."""

    async def event_generator():
        async for token in service.chat_stream(universe_id, data.question):
            yield {"data": token}

    return EventSourceResponse(event_generator())


@router.get("/history", response_model=list[ChatHistoryOut])
async def history(universe_id: str, limit: int = 50):
    return await service.get_history(universe_id, limit)
