"""LoreChat — modèles Pydantic."""

from pydantic import BaseModel
from datetime import datetime


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str


class ChatHistoryOut(BaseModel):
    id: str
    universe_id: str
    role: str
    content: str
    created_at: datetime
