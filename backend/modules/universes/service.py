"""Universes — logique métier."""

from database import get_supabase
from modules.universes.models import UniverseCreate, UniverseUpdate


async def create_universe(user_id: str, data: UniverseCreate) -> dict:
    db = get_supabase()
    result = (
        db.table("universes")
        .insert({"name": data.name, "description": data.description, "genre": data.genre, "user_id": user_id})
        .execute()
    )
    return result.data[0]


async def list_universes(user_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("universes")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


async def get_universe(universe_id: str) -> dict | None:
    db = get_supabase()
    result = (
        db.table("universes")
        .select("*")
        .eq("id", universe_id)
        .single()
        .execute()
    )
    return result.data


async def update_universe(universe_id: str, data: UniverseUpdate) -> dict:
    db = get_supabase()
    update_data = data.model_dump(exclude_none=True)
    result = (
        db.table("universes")
        .update(update_data)
        .eq("id", universe_id)
        .execute()
    )
    return result.data[0]


async def delete_universe(universe_id: str) -> None:
    db = get_supabase()
    db.table("universes").delete().eq("id", universe_id).execute()
