"""Characters — logique métier + indexation vectorielle (Supabase)."""

import json
from database import get_supabase
from core.embeddings import embed_text
from core.chunking import chunk_text
from modules.characters.models import CharacterCreate, CharacterUpdate, RelationCreate


# ── CRUD ─────────────────────────────────────────────────────

async def create_character(universe_id: str, data: CharacterCreate) -> dict:
    sb = get_supabase()
    result = (
        sb.table("characters")
        .insert(
            {
                "universe_id": universe_id,
                "name": data.name,
                "title": data.title,
                "description": data.description,
                "traits": data.traits if data.traits else [],
                "faction_id": data.faction_id,
                "location": data.location,
                "backstory": data.backstory,
                "notes": data.notes,
            }
        )
        .execute()
    )
    character = result.data[0]
    await _index_character(universe_id, character)
    return character


async def list_characters(universe_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("characters")
        .select("*")
        .eq("universe_id", universe_id)
        .order("name")
        .execute()
    )
    return result.data


async def get_character(character_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("characters")
        .select("*")
        .eq("id", character_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def update_character(character_id: str, universe_id: str, data: CharacterUpdate) -> dict:
    sb = get_supabase()
    result = (
        sb.table("characters")
        .update(data.model_dump(exclude_none=True))
        .eq("id", character_id)
        .execute()
    )
    character = result.data[0]
    await _delete_chunks(character_id)
    await _index_character(universe_id, character)
    return character


async def delete_character(character_id: str) -> None:
    sb = get_supabase()
    await _delete_chunks(character_id)
    sb.table("characters").delete().eq("id", character_id).execute()


# ── Relations ────────────────────────────────────────────────

async def add_relation(data: RelationCreate) -> dict:
    sb = get_supabase()
    result = (
        sb.table("character_relations")
        .insert(data.model_dump())
        .execute()
    )
    return result.data[0]


async def get_relations(character_id: str) -> list[dict]:
    sb = get_supabase()
    as_source = (
        sb.table("character_relations")
        .select("*")
        .eq("source_id", character_id)
        .execute()
    )
    as_target = (
        sb.table("character_relations")
        .select("*")
        .eq("target_id", character_id)
        .execute()
    )
    return as_source.data + as_target.data


async def delete_relation(relation_id: str) -> None:
    sb = get_supabase()
    sb.table("character_relations").delete().eq("id", relation_id).execute()


# ── Indexation RAG ───────────────────────────────────────────

async def _index_character(universe_id: str, character: dict):
    """Crée les chunks + embeddings pour un personnage."""
    sb = get_supabase()

    text_parts = [
        f"Personnage : {character['name']}",
        f"Titre : {character.get('title', '')}",
        f"Description : {character.get('description', '')}",
        f"Traits : {', '.join(character.get('traits', []))}",
        f"Lieu : {character.get('location', '')}",
        f"Backstory : {character.get('backstory', '')}",
        f"Notes : {character.get('notes', '')}",
    ]
    full_text = "\n".join(p for p in text_parts if not p.endswith(": "))
    chunks = chunk_text(full_text, source_label=f"Personnage: {character['name']}")

    for chunk in chunks:
        embedding = embed_text(chunk["content"])
        sb.table("chunks").insert(
            {
                "universe_id": universe_id,
                "source_type": "character",
                "source_id": character["id"],
                "source_label": chunk["source"],
                "content": chunk["content"],
                "chunk_index": chunk["index"],
                "embedding": embedding,
            }
        ).execute()


async def _delete_chunks(source_id: str):
    """Supprime les chunks associés à une source."""
    sb = get_supabase()
    sb.table("chunks").delete().eq("source_id", source_id).execute()
