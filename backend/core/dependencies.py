"""Dépendances d'authentification — extraction du user depuis le JWT Supabase."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_supabase

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Extrait et vérifie le JWT Supabase depuis le header Authorization.

    Retourne {"user_id": str, "email": str}.
    Lève 401 si le token est invalide ou expiré.
    """
    token = credentials.credentials
    try:
        sb = get_supabase()
        result = sb.auth.get_user(token)
        user = result.user
        if not user:
            raise ValueError("User not found")
        return {"user_id": user.id, "email": user.email or ""}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
