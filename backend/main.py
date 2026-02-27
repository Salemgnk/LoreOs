"""Point d'entrée FastAPI — enregistre chaque module comme un router."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings

# ── Routers MVP ──────────────────────────────────────────────
from modules.auth.router import router as auth_router
from modules.universes.router import router as universes_router
from modules.characters.router import router as characters_router
from modules.maps.router import router as maps_router
from modules.lorechat.router import router as lorechat_router

# ── Routers V1 (décommenter quand prêt) ─────────────────────
# from modules.chronicles.router import router as chronicles_router
# from modules.factions.router import router as factions_router
# from modules.pantheon.router import router as pantheon_router

# ── Routers V2 (décommenter quand prêt) ─────────────────────
# from modules.cultures.router import router as cultures_router
# from modules.langforge.router import router as langforge_router
# from modules.scriptforge.router import router as scriptforge_router
# from modules.ecosystem.router import router as ecosystem_router

settings = get_settings()

app = FastAPI(
    title="LoreOS API",
    version="0.1.0",
    description="Le cerveau de ton univers fictif.",
    swagger_ui_parameters={"persistAuthorization": True},
    openapi_tags=[
        {"name": "Auth", "description": "Inscription, connexion, vérification"},
        {"name": "Universes", "description": "CRUD univers"},
        {"name": "Characters", "description": "CRUD personnages + relations"},
        {"name": "Maps", "description": "CRUD cartes + markers"},
        {"name": "LoreChat", "description": "Chat IA + historique"},
    ],
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes MVP ───────────────────────────────────────────────
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(universes_router, prefix="/universes", tags=["Universes"])
app.include_router(characters_router, prefix="/universes/{universe_id}/characters", tags=["Characters"])
app.include_router(maps_router, prefix="/universes/{universe_id}/maps", tags=["Maps"])
app.include_router(lorechat_router, prefix="/universes/{universe_id}/chat", tags=["LoreChat"])

# ── Routes V1 ────────────────────────────────────────────────
# app.include_router(chronicles_router, prefix="/universes/{universe_id}/chronicles", tags=["Chronicles"])
# app.include_router(factions_router,   prefix="/universes/{universe_id}/factions",   tags=["Factions"])
# app.include_router(pantheon_router,   prefix="/universes/{universe_id}/pantheon",   tags=["Pantheon"])

# ── Routes V2 ────────────────────────────────────────────────
# app.include_router(cultures_router,    prefix="/universes/{universe_id}/cultures",    tags=["Cultures"])
# app.include_router(langforge_router,   prefix="/universes/{universe_id}/langforge",   tags=["LangForge"])
# app.include_router(scriptforge_router, prefix="/universes/{universe_id}/scriptforge", tags=["ScriptForge"])
# app.include_router(ecosystem_router,   prefix="/universes/{universe_id}/ecosystem",   tags=["Ecosystem"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
