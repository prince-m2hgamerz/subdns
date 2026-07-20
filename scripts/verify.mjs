import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
const { count, error: cntErr } = await supabase.from('subdomain_chunks').select('*', { count: 'exact', head: true });
if (cntErr) { console.log('Count error:', cntErr.message); process.exit(1); }
console.log('Chunk count:', count);
const { data: sample } = await supabase.from('subdomain_chunks').select('id, subdomain_id, chunk_text, metadata').limit(2);
console.log('Sample:', JSON.stringify(sample, null, 2));
