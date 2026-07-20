import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'subdomain_chunks'`);
console.log('Indexes:', JSON.stringify(result.rows, null, 2));

const idxExists = await pool.query(`SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'subdomain_chunks' AND indexname = 'idx_subdomain_chunks_embedding') as exists`);
console.log('HNSW index exists:', idxExists.rows[0].exists);
await pool.end();
