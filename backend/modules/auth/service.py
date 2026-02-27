"""Auth — logique métier (Supabase Auth)."""

from database import get_supabase
from modules.auth.models import SignUpRequest, SignInRequest


async def sign_up(data: SignUpRequest) -> dict:
    sb = get_supabase()
    result = sb.auth.sign_up({"email": data.email, "password": data.password})
    user = result.user
    if not user:
        raise ValueError("Échec de l'inscription")
    session = result.session
    return {
        "access_token": session.access_token if session else "",
        "user_id": user.id,
        "email": user.email,
    }


async def sign_in(data: SignInRequest) -> dict:
    sb = get_supabase()
    result = sb.auth.sign_in_with_password(
        {"email": data.email, "password": data.password}
    )
    user = result.user
    session = result.session
    if not user or not session:
        raise ValueError("Identifiants invalides")
    return {
        "access_token": session.access_token,
        "user_id": user.id,
        "email": user.email,
    }


async def get_current_user(access_token: str) -> dict | None:
    """Vérifie un JWT Supabase et retourne le user."""
    try:
        sb = get_supabase()
        result = sb.auth.get_user(access_token)
        user = result.user
        if not user:
            return None
        return {"user_id": user.id, "email": user.email}
    except Exception:
        return None
