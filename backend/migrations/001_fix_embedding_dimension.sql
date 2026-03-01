-- Migration : text-embedding-004 (768d) → gemini-embedding-001 (3072d)
-- Exécuter dans Supabase SQL Editor

-- 1. Supprimer l'index HNSW (dépend de l'ancienne dimension)
DROP INDEX IF EXISTS idx_chunks_embedding;

-- 2. Modifier la colonne embedding de vector(768) → vector(3072)
ALTER TABLE chunks
    ALTER COLUMN embedding TYPE vector(3072);

-- 3. Supprimer les anciens embeddings (incompatibles, dimension différente)
UPDATE chunks SET embedding = NULL;

-- 4. Recréer l'index HNSW
CREATE INDEX idx_chunks_embedding ON chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- 5. Recréer la fonction match_chunks avec la bonne dimension
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
      AND c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
