-- Migration : Extend characters table with new fields
-- Exécuter dans Supabase SQL Editor

-- 1. Add new columns with defaults (backward compatible)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS occupation TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS appearance TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS powers TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS objectives TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS quotes TEXT[] DEFAULT '{}';

-- 2. Enable RLS on new columns (already covered by existing row policies)
-- No additional RLS policies needed — existing universe-level policies cover all columns.
