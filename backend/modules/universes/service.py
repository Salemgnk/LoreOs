"""Universes — logique métier (Supabase PostgREST)."""

from database import get_supabase
from modules.universes.models import UniverseCreate, UniverseUpdate

TABLE = "universes"


async def create_universe(user_id: str, data: UniverseCreate) -> dict:
    sb = get_supabase()
    result = (
        sb.table(TABLE)
        .insert(
            {
                "name": data.name,
                "description": data.description,
                "genre": data.genre,
                "user_id": user_id,
            }
        )
        .execute()
    )
    return result.data[0]


async def list_universes(user_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table(TABLE)
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


async def get_universe(universe_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table(TABLE)
        .select("*")
        .eq("id", universe_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def update_universe(universe_id: str, data: UniverseUpdate) -> dict:
    sb = get_supabase()
    update_data = data.model_dump(exclude_none=True)
    result = (
        sb.table(TABLE)
        .update(update_data)
        .eq("id", universe_id)
        .execute()
    )
    return result.data[0]


async def delete_universe(universe_id: str) -> None:
    sb = get_supabase()
    sb.table(TABLE).delete().eq("id", universe_id).execute()
