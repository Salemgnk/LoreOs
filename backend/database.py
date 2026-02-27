"""Client Supabase partagé."""

from supabase import create_client, Client
from config import get_settings

_client: Client | None = None


def get_supabase() -> Client:
    """Singleton Supabase client."""
    global _client
    if _client is None:
        s = get_settings()
        if not s.supabase_url or not s.supabase_service_key:
            raise RuntimeError(
                "SUPABASE_URL et SUPABASE_SERVICE_KEY doivent être configurées dans .env"
            )
        _client = create_client(s.supabase_url, s.supabase_service_key)
    return _client
