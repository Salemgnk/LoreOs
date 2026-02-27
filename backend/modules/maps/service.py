"""Maps — logique métier (Supabase PostgREST)."""

from database import get_supabase
from core.embeddings import embed_text
from modules.maps.models import MapCreate, MapUpdate, MarkerCreate, MarkerUpdate


# ── Maps CRUD ────────────────────────────────────────────────

async def create_map(universe_id: str, data: MapCreate) -> dict:
    sb = get_supabase()
    result = (
        sb.table("maps")
        .insert({"universe_id": universe_id, **data.model_dump()})
        .execute()
    )
    return result.data[0]


async def list_maps(universe_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("maps")
        .select("*")
        .eq("universe_id", universe_id)
        .order("name")
        .execute()
    )
    return result.data


async def get_map(map_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("maps")
        .select("*")
        .eq("id", map_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def update_map(map_id: str, data: MapUpdate) -> dict:
    sb = get_supabase()
    result = (
        sb.table("maps")
        .update(data.model_dump(exclude_none=True))
        .eq("id", map_id)
        .execute()
    )
    return result.data[0]


async def delete_map(map_id: str) -> None:
    sb = get_supabase()
    # Supprimer les markers d'abord (cascade via FK, mais nettoyons les chunks RAG)
    markers = sb.table("map_markers").select("id").eq("map_id", map_id).execute()
    for m in markers.data:
        await delete_marker(m["id"])
    sb.table("maps").delete().eq("id", map_id).execute()


# ── Markers CRUD ──────────────────────────���──────────────────

async def create_marker(universe_id: str, data: MarkerCreate) -> dict:
    sb = get_supabase()
    result = sb.table("map_markers").insert(data.model_dump()).execute()
    marker = result.data[0]

    # Indexer pour le RAG
    text = (
        f"Lieu : {marker['name']}\n"
        f"Type : {marker.get('marker_type', '')}\n"
        f"Description : {marker.get('description', '')}"
    )
    embedding = embed_text(text)
    sb.table("chunks").insert(
        {
            "universe_id": universe_id,
            "source_type": "map_marker",
            "source_id": marker["id"],
            "source_label": f"Lieu: {marker['name']}",
            "content": text,
            "chunk_index": 0,
            "embedding": embedding,
        }
    ).execute()
    return marker


async def list_markers(map_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("map_markers")
        .select("*")
        .eq("map_id", map_id)
        .execute()
    )
    return result.data


async def update_marker(marker_id: str, data: MarkerUpdate) -> dict:
    sb = get_supabase()
    result = (
        sb.table("map_markers")
        .update(data.model_dump(exclude_none=True))
        .eq("id", marker_id)
        .execute()
    )
    return result.data[0]


async def delete_marker(marker_id: str) -> None:
    sb = get_supabase()
    # Supprimer le chunk RAG associé
    sb.table("chunks").delete().eq("source_id", marker_id).execute()
    sb.table("map_markers").delete().eq("id", marker_id).execute()
