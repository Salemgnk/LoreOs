"""Configuration centralisée — charge le .env et expose les settings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Gemini
    gemini_api_key: str = ""

    # App
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    # Embeddings
    embedding_model: str = "gemini-embedding-001"
    embedding_dimension: int = 3072

    # LLM
    chat_model: str = "gemini-2.0-flash"

    # Chunking
    chunk_size: int = 500
    chunk_overlap: int = 50

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
