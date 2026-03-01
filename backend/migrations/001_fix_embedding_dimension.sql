-- Migration : text-embedding-004 → gemini-embedding-001 (dimension reste 768)
-- Le nouveau modèle supporte output_dimensionality=768, pas besoin de changer la table.
-- Exécuter dans Supabase SQL Editor

-- 1. Vider les anciens embeddings (générés par l'ancien modèle, incompatibles)
UPDATE chunks SET embedding = NULL;

-- 2. S'assurer que la fonction match_chunks est bien en vector(768)
--    (normalement déjà le cas depuis le schema initial)
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding     vector(768),
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
