# 🌍 LoreOS

> Le système d'exploitation de l'écrivain fantasy — worldbuilding, langues, religions, cultures, personnages et histoire dans une seule app.

## Architecture

```
LoreOS/
├── docker-compose.yml              ← Orchestre backend + frontend
├── backend/                        ← FastAPI + Python
│   ├── Dockerfile
│   ├── main.py                     ← Point d'entrée, enregistre les routers
│   ├── config.py                   ← Settings (.env)
│   ├── database.py                 ← Client Supabase
│   ├── schema.sql                  ← Schéma BDD complet
│   ├── requirements.txt
│   ├── core/                       ← Services partagés
│   │   ├── llm.py                  ← Client Gemini
│   │   ├── embeddings.py           ← Génération de vecteurs
│   │   ├── chunking.py             ← Découpage de texte
│   │   └── rag.py                  ← Pipeline RAG complet
│   └── modules/                    ← Un dossier par module
│       ├── auth/               ← 🔐 Supabase Auth
│       ├── universes/          ← 🌍 CRUD univers
│       ├── characters/         ← 👥 Personnages + relations  ← MVP
│       ├── maps/               ← 🗺️ Cartes + marqueurs      ← MVP
│       ├── lorechat/           ← 🧠 Chat RAG (SSE)          ← MVP
│       ├── chronicles/         ← 📜 Timeline                 ← V1
│       ├── factions/           ← ⚔️ Factions                 ← V1
│       ├── pantheon/           ← ⛪ Religions                ← V1
│       ├── cultures/           ← 🏛️ Civilisations            ← V2
│       ├── langforge/          ← 🗣️ Langues fictives         ← V2
│       ├── scriptforge/        ← ✍️ Systèmes d'écriture      ← V2
│       └── ecosystem/          ← 🌿 Faune et flore           ← V2
│
├── frontend/                   ← Next.js 15 + Tailwind
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx                    ← Landing page
│   │   │   ├── (auth)/login/page.jsx       ← Connexion
│   │   │   ├── (auth)/register/page.jsx    ← Inscription
│   │   │   └── universe/[id]/             ← App principale
│   │   │       ├── layout.jsx              ← Sidebar modules
│   │   │       ├── page.jsx                ← Dashboard univers
│   │   │       ├── characters/page.jsx
│   │   │       ├── map/page.jsx
│   │   │       ├── chat/page.jsx
│   │   │       └── ... (un dossier par module)
│   │   ├── lib/
│   │   │   ├── api.js          ← Client API (fetch vers FastAPI)
│   │   │   └── supabase.js     ← Client Supabase côté front
│   │   ├── components/         ← Composants React par module
│   │   └── hooks/              ← Custom hooks
│   └── package.json
│
└── docs/
    └── 09-LoreOS.md            ← Spec complète du projet
```

## Stack

| Couche      | Techno                           |
|-------------|----------------------------------|
| Backend     | FastAPI + Python                 |
| Frontend    | Next.js 15 + Tailwind            |
| BDD         | Supabase (PostgreSQL + pgvector) |
| LLM         | Gemini 2.0 Flash                 |
| Embeddings  | text-embedding-004               |
| Cartes      | Leaflet.js (à venir)            |
| Graphes     | XY Flow (React Flow v12)         |
| Auth        | Supabase Auth                    |
| Infra       | Docker Compose                   |

## Démarrage rapide

### Prérequis

- Docker + Docker Compose v2
- Un projet [Supabase](https://supabase.com)
- Une clé API [Gemini](https://ai.google.dev)

### 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Exécute `backend/schema.sql` dans l'éditeur SQL
3. Récupère tes clés dans Settings > API

### 2. Config

```bash
# Backend
cp backend/.env.example backend/.env
# → Remplir SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY

# Frontend
cp frontend/.env.example frontend/.env.local
# → Remplir NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Lancer

```bash
docker compose up
```

→ Backend : `http://localhost:8000` (Swagger : `/docs`)
→ Frontend : `http://localhost:3000`

Le hot reload fonctionne pour les deux services. Tu modifies le code, ça se met à jour automatiquement.

### Sans Docker (optionnel)

```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd frontend && npm install --legacy-peer-deps && npm run dev
```

## Modules — chaque module suit le même pattern

### Backend : `modules/<nom>/`

| Fichier       | Rôle                                          |
|---------------|-----------------------------------------------|
| `models.py`   | Schémas Pydantic (Create, Update, Out)       |
| `service.py`  | Logique métier + accès BDD + indexation RAG  |
| `router.py`   | Endpoints FastAPI                             |

### Frontend : `app/universe/[id]/<nom>/`

Chaque module a sa page, ses composants dans `components/<nom>/`, et utilise le client `lib/api.js`.

## Roadmap

### ✅ MVP — En cours
- [x] Structure projet modulaire
- [ ] Auth (Supabase Auth)
- [ ] CRUD univers + sélecteur
- [ ] Fiches personnages + graphe de relations
- [ ] Carte (upload + annotations)
- [ ] LoreChat (RAG sur personnages + lieux)
- [ ] Landing page

### 🔜 V1
- [ ] ChronicleForge (timeline interactive)
- [ ] FactionEngine (factions + alliances)
- [ ] PantheonForge (religions + mythologie)
- [ ] LoreChat étendu (RAG sur tout l'univers)
- [ ] Stripe

### 🔮 V2
- [ ] CultureWeaver (civilisations)
- [ ] LangForge (langues fictives)
- [ ] ScriptForge (systèmes d'écriture)
- [ ] EcosystemBuilder (faune et flore)
- [ ] MapLore avancé (régions liées aux données)
- [ ] Mode Studio (collaboration temps réel)
