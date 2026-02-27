"""Maps — endpoints CRUD + markers."""

from fastapi import APIRouter, HTTPException, Depends
from modules.maps.models import (
    MapCreate, MapUpdate, MapOut,
    MarkerCreate, MarkerUpdate, MarkerOut,
)
from modules.maps import service
from core.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=MapOut)
async def create(universe_id: str, data: MapCreate, _: dict = Depends(get_current_user)):
    return await service.create_map(universe_id, data)


@router.get("/", response_model=list[MapOut])
async def list_all(universe_id: str, _: dict = Depends(get_current_user)):
    return await service.list_maps(universe_id)


@router.get("/{map_id}", response_model=MapOut)
async def get_one(map_id: str):
    result = await service.get_map(map_id)
    if not result:
        raise HTTPException(status_code=404, detail="Carte introuvable")
    return result


@router.patch("/{map_id}", response_model=MapOut)
async def update(map_id: str, data: MapUpdate):
    return await service.update_map(map_id, data)


@router.delete("/{map_id}", status_code=204)
async def delete(map_id: str):
    await service.delete_map(map_id)


# ── Markers ──────────────────────────────────────────────────

@router.post("/{map_id}/markers", response_model=MarkerOut)
async def create_marker(universe_id: str, map_id: str, data: MarkerCreate):
    return await service.create_marker(universe_id, data)


@router.get("/{map_id}/markers", response_model=list[MarkerOut])
async def list_markers(map_id: str):
    return await service.list_markers(map_id)


@router.patch("/{map_id}/markers/{marker_id}", response_model=MarkerOut)
async def update_marker(marker_id: str, data: MarkerUpdate):
    return await service.update_marker(marker_id, data)


@router.delete("/{map_id}/markers/{marker_id}", status_code=204)
async def delete_marker(marker_id: str):
    await service.delete_marker(marker_id)
