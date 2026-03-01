-- ============================================================
-- LoreOS — Schéma Supabase (PostgreSQL + pgvector)
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ──────────────────────────────────────────────────────────────
-- UNIVERS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE universes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    genre       TEXT DEFAULT 'fantasy',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_universes_user ON universes(user_id);

-- ──────────────────────────────────────────────────────────────
-- PERSONNAGES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE characters (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    title       TEXT DEFAULT '',
    description TEXT DEFAULT '',
    traits      JSONB DEFAULT '[]',
    faction_id  UUID,  -- référence ajoutée après création de factions
    location    TEXT DEFAULT '',
    backstory   TEXT DEFAULT '',
    notes       TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_characters_universe ON characters(universe_id);

CREATE TABLE character_relations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id     UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    target_id     UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,  -- ally, enemy, family, rival, mentor, lover
    description   TEXT DEFAULT '',
    UNIQUE(source_id, target_id, relation_type)
);

-- ──────────────────────────────────────────────────────────────
-- CARTES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE maps (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    image_url   TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_maps_universe ON maps(universe_id);

CREATE TABLE map_markers (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    map_id             UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    name               TEXT NOT NULL,
    description        TEXT DEFAULT '',
    marker_type        TEXT DEFAULT 'location',  -- location, city, landmark, region, battle
    x                  DOUBLE PRECISION NOT NULL,
    y                  DOUBLE PRECISION NOT NULL,
    linked_entity_type TEXT,  -- character, faction, event
    linked_entity_id   UUID
);

CREATE INDEX idx_markers_map ON map_markers(map_id);

-- ──────────────────────────────────────────────────────────────
-- HISTORIQUE CHAT
-- ──────────────────────────────────────────────────────────────

CREATE TABLE chat_history (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,  -- 'user' | 'assistant'
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_universe ON chat_history(universe_id);

-- ──────────────────────────────────────────────────────────────
-- CHUNKS VECTORIELS (RAG)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE chunks (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id  UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    source_type  TEXT NOT NULL,  -- character, map_marker, event, faction, note...
    source_id    UUID NOT NULL,
    source_label TEXT DEFAULT '',
    content      TEXT NOT NULL,
    chunk_index  INTEGER DEFAULT 0,
    embedding    vector(3072),
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chunks_universe ON chunks(universe_id);
CREATE INDEX idx_chunks_source ON chunks(source_id);

-- Index HNSW pour la recherche vectorielle rapide
CREATE INDEX idx_chunks_embedding ON chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ──────────────────────────────────────────────────────────────
-- FONCTION DE RECHERCHE VECTORIELLE
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding     vector(3072),
    match_universe_id   UUID,
    match_count         INTEGER DEFAULT 5,
    match_threshold     DOUBLE PRECISION DEFAULT 0.7
)
RETURNS TABLE (
    id           UUID,
    source_type  TEXT,
    source_id    UUID,
    source_label TEXT,
    content      TEXT,
    similarity   DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.source_type,
        c.source_id,
        c.source_label,
        c.content,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM chunks c
    WHERE c.universe_id = match_universe_id
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- TABLES V1 (préparées, à compléter)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    date_label  TEXT DEFAULT '',
    sort_order  INTEGER DEFAULT 0,
    importance  TEXT DEFAULT 'normal',
    tags        JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE factions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    ideology    TEXT DEFAULT '',
    leader_id   UUID REFERENCES characters(id) ON DELETE SET NULL,
    territory   TEXT DEFAULT '',
    power_level INTEGER DEFAULT 5,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Ajouter la FK characters → factions maintenant que la table existe
ALTER TABLE characters
    ADD CONSTRAINT fk_characters_faction
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE SET NULL;

CREATE TABLE faction_relations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_a_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    faction_b_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    relation_type   TEXT NOT NULL,  -- alliance, war, neutral, vassalage, trade
    description     TEXT DEFAULT '',
    UNIQUE(faction_a_id, faction_b_id)
);

CREATE TABLE deities (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id   UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    domain        TEXT DEFAULT '',
    description   TEXT DEFAULT '',
    alignment     TEXT DEFAULT '',
    symbols       JSONB DEFAULT '[]',
    worship_style TEXT DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE religions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id  UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT DEFAULT '',
    cosmology    TEXT DEFAULT '',
    main_deities JSONB DEFAULT '[]',
    rites        TEXT DEFAULT '',
    taboos       TEXT DEFAULT '',
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- TRIGGER updated_at
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_universes_updated  BEFORE UPDATE ON universes  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_characters_updated BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_maps_updated       BEFORE UPDATE ON maps       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated     BEFORE UPDATE ON events     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_factions_updated   BEFORE UPDATE ON factions   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- RLS (Row Level Security) — à activer par table
-- ──────────────────────────────────────────────────────────────

ALTER TABLE universes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own universes"
    ON universes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TODO: Ajouter les policies RLS pour chaque table liée à un univers
-- (vérifier que l'univers appartient au user via une jointure)
