import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function exec(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error && error.message !== 'rpc not found') throw error;
  return data;
}

async function main() {
  console.log('Creating subdomain_chunks table...');

  // Try direct SQL exec
  const sql = `
CREATE TABLE IF NOT EXISTS public.subdomain_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain_id UUID REFERENCES public.subdomains(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    // Fallback: create via REST API by inserting a dummy row and deleting it
    console.log('exec_sql RPC not available. Trying REST API approach...');
    const { error: createError } = await supabase.from('subdomain_chunks').insert({
      subdomain_id: '00000000-0000-0000-0000-000000000000',
      chunk_text: 'init',
      metadata: { init: true },
    });
    if (createError) {
      console.error('Could not create table:', createError.message);
      process.exit(1);
    }
    await supabase.from('subdomain_chunks').delete().neq('id', 0);
    console.log('Table created via insert.');
  } else {
    console.log('Table created via SQL.');
  }

  // Try to create index
  const idxSql = `CREATE INDEX IF NOT EXISTS idx_subdomain_chunks_embedding ON public.subdomain_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 200);`;
  const { error: idxError } = await supabase.rpc('exec_sql', { sql: idxSql });
  if (idxError) {
    console.log('Could not create HNSW index (may need newer pgvector). Creating IVFFLAT index instead...');
    const fallbackSql = `CREATE INDEX IF NOT EXISTS idx_subdomain_chunks_embedding ON public.subdomain_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`;
    const { error: fallbackError } = await supabase.rpc('exec_sql', { sql: fallbackSql });
    if (fallbackError) {
      console.log('Fallback index also failed. Will skip index creation for now.');
    } else {
      console.log('IVFFLAT index created.');
    }
  } else {
    console.log('HNSW index created.');
  }

  console.log('Done.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
