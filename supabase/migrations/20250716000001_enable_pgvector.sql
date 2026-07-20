CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_text TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  embedding VECTOR(1024),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding VECTOR(1024),
  match_threshold DOUBLE PRECISION DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  metadata JSONB,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.chunk_text,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
