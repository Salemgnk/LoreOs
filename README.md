# LoreOS — MVP

> Le cerveau de ton univers fictif. Pose des questions sur tes notes en langage naturel.

## Stack

- **Backend** : FastAPI + Python
- **Frontend** : Next.js + Tailwind
- **BDD** : Supabase (PostgreSQL + pgvector)
- **LLM** : Gemini 1.5 Flash (chat) + text-embedding-004 (embeddings)

---

## Setup

### 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Dans l'éditeur SQL, exécute le contenu de `backend/schema.sql`
3. Récupère ton `SUPABASE_URL` et `SUPABASE_SERVICE_KEY` dans Settings > API

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Remplis .env avec tes clés

uvicorn main:app --reload
```

L'API tourne sur `http://localhost:8000`
Docs auto : `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app tourne sur `http://localhost:3000`

### 4. Dernière étape

Dans `frontend/src/app/page.jsx`, remplace `your-universe-uuid-here` par l'UUID d'un univers que tu as créé dans Supabase.

---

## Architecture

```
Utilisateur
    │
    ▼
┌─────────────┐     POST /notes/     ┌─────────────────────────────────┐
│  NotePanel  │ ──────────────────▶ │  FastAPI                         │
│  (ajouter   │                     │  1. Sauvegarde la note           │
│   des notes)│                     │  2. Chunk le texte               │
└─────────────┘                     │  3. Embed chaque chunk           │
                                    │  4. Stocke dans pgvector         │
┌─────────────┐     POST /chat/     └─────────────────────────────────┘
│  ChatPanel  │ ──────────────────▶ │  FastAPI RAG                     │
│  (poser des │                     │  1. Embed la question            │
│  questions) │     SSE stream ◀─── │  2. Recherche vectorielle        │
└─────────────┘                     │  3. Injecte les chunks dans      │
                                    │     le prompt Gemini             │
                                    │  4. Stream la réponse            │
                                    └─────────────────────────────────┘
```

## Roadmap

- [ ] Auth (Supabase Auth)
- [ ] Sélecteur d'univers
- [ ] ChronicleForge (timeline)
- [ ] FactionEngine
- [ ] Export PDF de la bible
