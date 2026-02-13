-- Crear función para búsqueda por similaridad de vectores
CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  concepts text[],
  emotional_depth int,
  breakthrough_moment boolean,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    content,
    created_at,
    concepts,
    emotional_depth,
    breakthrough_moment,
    1 - (embedding <=> query_embedding) as similarity
  FROM conversations
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;