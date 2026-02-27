"""Auth — endpoints."""

from fastapi import APIRouter, HTTPException
from modules.auth.models import SignUpRequest, SignInRequest, AuthResponse
from modules.auth import service

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def signup(data: SignUpRequest):
    try:
        return await service.sign_up(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin", response_model=AuthResponse)
async def signin(data: SignInRequest):
    try:
        return await service.sign_in(data)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Identifiants invalides")
