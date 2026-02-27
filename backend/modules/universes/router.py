"""Universes — endpoints CRUD."""

from fastapi import APIRouter, HTTPException, Depends
from modules.universes.models import UniverseCreate, UniverseUpdate, UniverseOut
from modules.universes import service
from core.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=UniverseOut)
async def create(data: UniverseCreate, user: dict = Depends(get_current_user)):
    return await service.create_universe(user["user_id"], data)


@router.get("/", response_model=list[UniverseOut])
async def list_all(user: dict = Depends(get_current_user)):
    return await service.list_universes(user["user_id"])


@router.get("/{universe_id}", response_model=UniverseOut)
async def get_one(universe_id: str, user: dict = Depends(get_current_user)):
    result = await service.get_universe(universe_id)
    if not result:
        raise HTTPException(status_code=404, detail="Univers introuvable")
    # Vérifier que l'univers appartient au user
    if result.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Accès interdit")
    return result


@router.patch("/{universe_id}", response_model=UniverseOut)
async def update(universe_id: str, data: UniverseUpdate, user: dict = Depends(get_current_user)):
    universe = await service.get_universe(universe_id)
    if not universe or universe.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Accès interdit")
    return await service.update_universe(universe_id, data)


@router.delete("/{universe_id}", status_code=204)
async def delete(universe_id: str, user: dict = Depends(get_current_user)):
    universe = await service.get_universe(universe_id)
    if not universe or universe.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Accès interdit")
    await service.delete_universe(universe_id)
