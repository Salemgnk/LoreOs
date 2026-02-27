"""Auth — logique métier (Supabase Auth)."""

from database import get_supabase
from modules.auth.models import SignUpRequest, SignInRequest


async def sign_up(data: SignUpRequest) -> dict:
    db = get_supabase()
    result = db.auth.sign_up({"email": data.email, "password": data.password})
    return {
        "access_token": result.session.access_token,
        "user_id": result.user.id,
        "email": result.user.email,
    }


async def sign_in(data: SignInRequest) -> dict:
    db = get_supabase()
    result = db.auth.sign_in_with_password(
        {"email": data.email, "password": data.password}
    )
    return {
        "access_token": result.session.access_token,
        "user_id": result.user.id,
        "email": result.user.email,
    }


async def get_current_user(access_token: str) -> dict | None:
    """Vérifie un JWT Supabase et retourne le user."""
    db = get_supabase()
    try:
        result = db.auth.get_user(access_token)
        return {"user_id": result.user.id, "email": result.user.email}
    except Exception:
        return None
