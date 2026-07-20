import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
const nvidiaKey = process.env.NVIDIA_API_KEY;

if (!supabaseUrl || !supabaseKey || !nvidiaKey) {
  console.error('Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE, NVIDIA_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1';
const EMBEDDING_MODEL = 'nvidia/nv-embedqa-e5-v5';
const EMBEDDING_DIM = 1024;

function chunkText(text, maxTokens = 800) {
  const avgCharsPerToken = 4;
  const maxChars = maxTokens * avgCharsPerToken;
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.substring(i, i + maxChars));
  }
  return chunks;
}

function chunkSubdomain(subdomain) {
  const textFields = [
    subdomain.title, subdomain.description, subdomain.summary,
    subdomain.category, subdomain.tags ? subdomain.tags.join(', ') : '',
    subdomain.content, subdomain.body, subdomain.features,
    subdomain.use_cases, subdomain.target_audience,
    subdomain.similar_projects ? subdomain.similar_projects.join(', ') : '',
    subdomain.competitors ? subdomain.competitors.join(', ') : '',
  ];
  const combined = textFields.filter(Boolean).join(' ').trim();
  if (!combined) return [{ text: `Subdomain: ${subdomain.name || subdomain.subdomain || 'unknown'}`, subdomainId: subdomain.id }];
  return chunkText(combined).map(text => ({ text, subdomainId: subdomain.id }));
}

async function generateEmbedding(text, type = 'passage') {
  const resp = await fetch(`${NVIDIA_API_URL}/embeddings`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, model: EMBEDDING_MODEL, input_type: type, truncate: 'END' }),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`NVIDIA API error ${resp.status}: ${errBody.slice(0, 200)}`);
  }
  const data = await resp.json();
  const vector = data.data[0].embedding;
  return { vector, model: EMBEDDING_MODEL, dimensions: EMBEDDING_DIM };
}

async function rpcSafe(name, args) {
  try {
    return await supabase.rpc(name, args);
  } catch {
    return { data: null, error: new Error('rpc not found') };
  }
}

async function checkSchema() {
  console.log('Checking vector dimension in schema...');
  const { data, error } = await rpcSafe('get_embedding_dimension');
  if (error) {
    const { data: dims } = await supabase.from('subdomain_chunks').select('embedding').limit(1);
    if (dims && dims[0]?.embedding) {
      console.log(`Existing embedding dimension: ${dims[0].embedding.length}`);
      if (dims[0].embedding.length !== EMBEDDING_DIM) {
        console.warn(`Dimension mismatch: existing=${dims[0].embedding.length}, desired=${EMBEDDING_DIM}`);
        console.warn('Will force real index rebuild to handle dimension change.');
        return { needsForceReindex: true, existingDim: dims[0].embedding.length };
      }
    }
  }
  return { needsForceReindex: false };
}

async function checkIndexExists() {
  console.log('Checking if vector index exists...');
  const { data, error } = await rpcSafe('check_vector_index');
  if (error) {
    console.log('Could not check index via RPC, will try SQL directly.');
  }
  // Try querying pg_indexes
  const { data: idxData, error: idxErr } = await supabase.from('pg_indexes')
    .select('indexname')
    .eq('tablename', 'subdomain_chunks')
    .ilike('indexname', '%embedding%');
  if (idxErr) {
    console.log('Could not query pg_indexes either, will create index anyway.');
    return false;
  }
  const exists = idxData && idxData.length > 0;
  console.log(`Vector index exists: ${exists}`);
  return exists;
}

async function clearExistingChunks() {
  console.log('Clearing existing chunks and embeddings...');
  const { error } = await supabase.from('subdomain_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('Error clearing chunks:', error.message);
    throw error;
  }
  console.log('All existing chunks cleared.');
}

async function fetchAllSubdomains() {
  console.log('Fetching all subdomains...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('subdomains')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    page++;
    if (data.length < pageSize) break;
  }
  console.log(`Fetched ${all.length} subdomains.`);
  return all;
}

try {
  const schema = await checkSchema();
  const indexExists = await checkIndexExists();

  let needsForceReindex = schema.needsForceReindex;

  const subdomains = await fetchAllSubdomains();
  await clearExistingChunks();

  // Generate all chunks
  let allChunks = [];
  for (const sub of subdomains) {
    const chunks = chunkSubdomain(sub);
    for (const c of chunks) {
      c.subdomainId = sub.id;
      c.subdomainName = sub.name || sub.subdomain || '';
      allChunks.push(c);
    }
  }
  console.log(`Generated ${allChunks.length} chunks from ${subdomains.length} subdomains.`);

  // Process in batches and insert
  const batchSize = 10;
  const totalBatches = Math.ceil(allChunks.length / batchSize);
  let inserted = 0;

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const batchIdx = i / batchSize + 1;
    try {
      const embeddings = await Promise.all(batch.map(c => generateEmbedding(c.text, 'passage')));
      const records = batch.map((c, idx) => ({
        subdomain_id: c.subdomainId,
        chunk_text: c.text,
        embedding: embeddings[idx].vector,
        metadata: { subdomain_name: c.subdomainName },
      }));
      const { error } = await supabase.from('subdomain_chunks').insert(records);
      if (error) throw error;
      inserted += records.length;
      console.log(`Batch ${batchIdx}/${totalBatches} OK (${inserted}/${allChunks.length} chunks)`);
    } catch (e) {
      console.error(`Batch ${batchIdx} failed: ${e.message}`);
    }
  }

  console.log(`\nDone. Inserted ${inserted} chunks.`);

  // Ensure index
  console.log('Ensuring vector index exists...');
  if (!indexExists || needsForceReindex) {
    console.log('Creating/recreating vector index...');
    const indexSql = needsForceReindex
      ? `DROP INDEX IF EXISTS idx_subdomain_chunks_embedding; CREATE INDEX idx_subdomain_chunks_embedding ON subdomain_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 200);`
      : `CREATE INDEX IF NOT EXISTS idx_subdomain_chunks_embedding ON subdomain_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 200);`;
    const { error: idxError } = await rpcSafe('exec_sql', { sql: indexSql });
    if (idxError) {
      console.warn(`Index creation note: ${idxError.message}`);
      console.log('You may need to create the index manually via SQL console.');
    } else {
      console.log('Vector index created/recreated successfully.');
    }
  } else {
    console.log('Vector index already exists, skipping creation.');
  }

  console.log('\nReindex complete!');
} catch (e) {
  console.error('Fatal error:', e.message);
  process.exit(1);
}
