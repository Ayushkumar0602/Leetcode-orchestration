-- Run this in your Supabase SQL Editor to update the dimensions

-- 1. Drop the old function
DROP FUNCTION IF EXISTS match_knowledge(vector(768), float, int);

-- 2. Alter the embedding column
ALTER TABLE knowledge_base ALTER COLUMN embedding TYPE vector(3072);

-- 3. Recreate the function with 3072 dimensions
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  type text,
  title text,
  content text,
  url text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    id,
    type,
    title,
    content,
    url,
    metadata,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
