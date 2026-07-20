SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS public.subdomain_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain_id TEXT REFERENCES public.subdomains(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1024),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subdomain_chunks_embedding
  ON public.subdomain_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

CREATE OR REPLACE FUNCTION public.match_subdomain_chunks(
  query_embedding vector(1024),
  match_threshold DOUBLE PRECISION DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  subdomain_id TEXT,
  chunk_text TEXT,
  metadata JSONB,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.subdomain_id,
    sc.chunk_text,
    sc.metadata,
    1 - (sc.embedding <=> query_embedding) AS similarity
  FROM public.subdomain_chunks sc
  WHERE 1 - (sc.embedding <=> query_embedding) > match_threshold
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_embedding_dimension()
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 1024;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_vector_index()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  idx_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'subdomain_chunks'
    AND indexname = 'idx_subdomain_chunks_embedding'
  ) INTO idx_exists;
  RETURN idx_exists;
END;
$$;
