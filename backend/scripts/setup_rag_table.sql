-- Run this entirely in your Supabase SQL Editor

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the unified knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id text PRIMARY KEY,                   -- A unique ID (e.g., 'course:course_slug' or 'problem:123')
  type text NOT NULL,                    -- The entity type ('course', 'problem', 'route', 'blog', 'hld')
  title text NOT NULL,                   -- Human-readable title
  content text NOT NULL,                 -- The chunked plain-text content to base the vector on
  url text,                              -- Web link relevant to this knowledge entry
  metadata jsonb DEFAULT '{}'::jsonb,    -- Extras like difficulty, tags, author
  embedding vector(768)                  -- The 768-dimensional Google Gemini embedding vector
);

-- 3. Create a function to perform similarity search based on Cosine distance (<=>)
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(768),
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
