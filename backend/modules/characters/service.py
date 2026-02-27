"""Characters — logique métier + indexation vectorielle."""

from database import get_supabase
from core.embeddings import embed_text
from core.chunking import chunk_text
from modules.characters.models import CharacterCreate, CharacterUpdate, RelationCreate


# ── CRUD ─────────────────────────────────────────────────────

async def create_character(universe_id: str, data: CharacterCreate) -> dict:
    db = get_supabase()
    row = {
        "universe_id": universe_id,
        "name": data.name,
        "title": data.title,
        "description": data.description,
        "traits": data.traits,
        "faction_id": data.faction_id,
        "location": data.location,
        "backstory": data.backstory,
        "notes": data.notes,
    }
    result = db.table("characters").insert(row).execute()
    character = result.data[0]

    # Indexer pour le RAG
    await _index_character(universe_id, character)

    return character


async def list_characters(universe_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("characters")
        .select("*")
        .eq("universe_id", universe_id)
        .order("name")
        .execute()
    )
    return result.data


async def get_character(character_id: str) -> dict | None:
    db = get_supabase()
    result = (
        db.table("characters")
        .select("*")
        .eq("id", character_id)
        .single()
        .execute()
    )
    return result.data


async def update_character(character_id: str, universe_id: str, data: CharacterUpdate) -> dict:
    db = get_supabase()
    update_data = data.model_dump(exclude_none=True)
    result = (
        db.table("characters")
        .update(update_data)
        .eq("id", character_id)
        .execute()
    )
    character = result.data[0]

    # Ré-indexer
    await _delete_chunks(character_id)
    await _index_character(universe_id, character)

    return character


async def delete_character(character_id: str) -> None:
    db = get_supabase()
    await _delete_chunks(character_id)
    db.table("characters").delete().eq("id", character_id).execute()


# ── Relations ────────────────────────────────────────────────

async def add_relation(data: RelationCreate) -> dict:
    db = get_supabase()
    result = (
        db.table("character_relations")
        .insert(data.model_dump())
        .execute()
    )
    return result.data[0]


async def get_relations(character_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("character_relations")
        .select("*")
        .or_(f"source_id.eq.{character_id},target_id.eq.{character_id}")
        .execute()
    )
    return result.data


async def delete_relation(relation_id: str) -> None:
    db = get_supabase()
    db.table("character_relations").delete().eq("id", relation_id).execute()


# ── Indexation RAG ───────────────────────────────────────────

async def _index_character(universe_id: str, character: dict):
    """Crée les chunks + embeddings pour un personnage."""
    db = get_supabase()

    # Construire le texte à indexer
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
        db.table("chunks").insert(
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
    """Supprime les chunks associés à un personnage."""
    db = get_supabase()
    db.table("chunks").delete().eq("source_id", source_id).execute()
