import pg from 'pg';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const exists = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'certificates'
    `);

    if (exists.rows.length > 0) {
      console.log('certificates table already exists — skipping');
      return;
    }

    await client.query(`
      CREATE TABLE certificates (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        cert_id TEXT UNIQUE NOT NULL,
        owner_name TEXT NOT NULL,
        owner_email TEXT,
        subdomain_id TEXT NOT NULL REFERENCES subdomains(id),
        subdomain_name TEXT NOT NULL,
        domain TEXT NOT NULL,
        full_domain TEXT NOT NULL,
        target TEXT,
        status TEXT NOT NULL,
        dns_mode TEXT NOT NULL,
        signature TEXT NOT NULL,
        issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('certificates table created successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
