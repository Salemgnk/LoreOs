"""Universes — endpoints CRUD."""

from fastapi import APIRouter, HTTPException
from modules.universes.models import UniverseCreate, UniverseUpdate, UniverseOut
from modules.universes import service

router = APIRouter()


@router.post("/", response_model=UniverseOut)
async def create(data: UniverseCreate):
    # TODO: récupérer user_id depuis le token auth
    user_id = "temp-user-id"
    return await service.create_universe(user_id, data)


@router.get("/", response_model=list[UniverseOut])
async def list_all():
    user_id = "temp-user-id"
    return await service.list_universes(user_id)


@router.get("/{universe_id}", response_model=UniverseOut)
async def get_one(universe_id: str):
    result = await service.get_universe(universe_id)
    if not result:
        raise HTTPException(status_code=404, detail="Univers introuvable")
    return result


@router.patch("/{universe_id}", response_model=UniverseOut)
async def update(universe_id: str, data: UniverseUpdate):
    return await service.update_universe(universe_id, data)


@router.delete("/{universe_id}", status_code=204)
async def delete(universe_id: str):
    await service.delete_universe(universe_id)
