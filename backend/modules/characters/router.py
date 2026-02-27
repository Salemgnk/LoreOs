"""Characters — endpoints CRUD + relations."""

from fastapi import APIRouter, HTTPException
from modules.characters.models import (
    CharacterCreate, CharacterUpdate, CharacterOut,
    RelationCreate, RelationOut,
)
from modules.characters import service

router = APIRouter()


@router.post("/", response_model=CharacterOut)
async def create(universe_id: str, data: CharacterCreate):
    return await service.create_character(universe_id, data)


@router.get("/", response_model=list[CharacterOut])
async def list_all(universe_id: str):
    return await service.list_characters(universe_id)


@router.get("/{character_id}", response_model=CharacterOut)
async def get_one(character_id: str):
    result = await service.get_character(character_id)
    if not result:
        raise HTTPException(status_code=404, detail="Personnage introuvable")
    return result


@router.patch("/{character_id}", response_model=CharacterOut)
async def update(universe_id: str, character_id: str, data: CharacterUpdate):
    return await service.update_character(character_id, universe_id, data)


@router.delete("/{character_id}", status_code=204)
async def delete(character_id: str):
    await service.delete_character(character_id)


# ── Relations ────────────────────────────────────────────────

@router.post("/{character_id}/relations", response_model=RelationOut)
async def add_relation(character_id: str, data: RelationCreate):
    return await service.add_relation(data)


@router.get("/{character_id}/relations", response_model=list[RelationOut])
async def get_relations(character_id: str):
    return await service.get_relations(character_id)


@router.delete("/{character_id}/relations/{relation_id}", status_code=204)
async def remove_relation(relation_id: str):
    await service.delete_relation(relation_id)
