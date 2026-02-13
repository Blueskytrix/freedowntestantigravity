-- =====================================================
-- Claude Libre - Database Setup (PostgreSQL + pgvector)
-- =====================================================
-- Run this in your Supabase SQL Editor or psql
-- Link: https://supabase.com/dashboard/project/_/sql/new
-- =====================================================

-- 1. Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create memories table for semantic memory storage
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small size
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create HNSW index for fast vector similarity search
-- This enables 90%+ faster searches compared to no index
CREATE INDEX IF NOT EXISTS memories_embedding_idx 
ON public.memories 
USING hnsw (embedding vector_cosine_ops);

-- 4. Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS memories_created_at_idx 
ON public.memories (created_at DESC);

-- 5. Create GIN index on metadata for fast JSONB queries
CREATE INDEX IF NOT EXISTS memories_metadata_idx 
ON public.memories USING GIN (metadata);

-- 6. Function to match memories by semantic similarity
CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    memories.id,
    memories.title,
    memories.content,
    memories.metadata,
    memories.created_at,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE memories.embedding IS NOT NULL
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 7. Function to execute read-only SQL (for execute_query tool)
CREATE OR REPLACE FUNCTION public.execute_readonly_sql(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only allow SELECT queries
  IF query_text !~* '^\s*SELECT' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  -- Block dangerous keywords
  IF query_text ~* '(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE)' THEN
    RAISE EXCEPTION 'Query contains forbidden keywords';
  END IF;
  
  -- Execute query and return as JSON
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query_text) INTO result;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 8. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policy for service role (allows all operations)
CREATE POLICY "Service role can do anything"
ON public.memories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 10. Grant necessary permissions
GRANT ALL ON public.memories TO service_role;
GRANT EXECUTE ON FUNCTION public.match_memories TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_readonly_sql TO service_role;

-- =====================================================
-- Setup Complete! ✅
-- =====================================================
-- Next steps:
-- 1. Verify extension: SELECT * FROM pg_extension WHERE extname = 'vector';
-- 2. Test match_memories: SELECT * FROM match_memories('[0.1, 0.2, ...]'::vector(1536), 5);
-- 3. Test execute_readonly_sql: SELECT execute_readonly_sql('SELECT 1 as test');
-- =====================================================

-- Optional: Create some test data
-- INSERT INTO public.memories (title, content, embedding) VALUES
--   ('Test Memory', 'This is a test memory for semantic search', 
--    array_fill(0.1, ARRAY[1536])::vector(1536));

-- Optional: Performance tuning for large datasets
-- SET maintenance_work_mem = '1GB';
-- SET max_parallel_maintenance_workers = 4;

-- Optional: Monitor index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE tablename = 'memories';

COMMENT ON TABLE public.memories IS 'Semantic memory storage with vector embeddings for Claude Libre';
COMMENT ON COLUMN public.memories.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON FUNCTION public.match_memories IS 'Find semantically similar memories using cosine similarity';
COMMENT ON FUNCTION public.execute_readonly_sql IS 'Execute read-only SQL queries safely (SELECT only)';
