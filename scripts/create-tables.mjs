import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
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
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

    await client.query('DROP TABLE IF EXISTS dns_records CASCADE');
    await client.query('DROP TABLE IF EXISTS subscriptions CASCADE');
    await client.query('DROP TABLE IF EXISTS plan_configs CASCADE');
    await client.query('DROP TABLE IF EXISTS activities CASCADE');
    await client.query('DROP TABLE IF EXISTS api_keys CASCADE');
    await client.query('DROP TABLE IF EXISTS contact_messages CASCADE');
    await client.query('DROP TABLE IF EXISTS reports CASCADE');
    await client.query('DROP TABLE IF EXISTS reserved_names CASCADE');
    await client.query('DROP TABLE IF EXISTS root_domains CASCADE');
    await client.query('DROP TABLE IF EXISTS subdomains CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await client.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        image TEXT,
        is_banned BOOLEAN NOT NULL DEFAULT false,
        max_subdomains INTEGER NOT NULL DEFAULT 10,
        plan TEXT NOT NULL DEFAULT 'BRONZE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE subdomains (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        domain TEXT NOT NULL DEFAULT 'm2hio.in',
        full_domain TEXT NOT NULL,
        target TEXT,
        type TEXT NOT NULL DEFAULT 'CNAME',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        proxied BOOLEAN NOT NULL DEFAULT true,
        cloudflare_id TEXT,
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE dns_records (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        ttl INTEGER NOT NULL DEFAULT 1,
        priority INTEGER,
        proxied BOOLEAN NOT NULL DEFAULT true,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        cloudflare_id TEXT,
        subdomain_id TEXT NOT NULL REFERENCES subdomains(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE activities (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        ip TEXT,
        user_agent TEXT,
        metadata JSONB,
        user_id TEXT REFERENCES users(id),
        subdomain_id TEXT REFERENCES subdomains(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE api_keys (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        key TEXT UNIQUE NOT NULL,
        last_used TIMESTAMPTZ,
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE contact_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT,
        user_id TEXT REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE reports (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL DEFAULT 'ISSUE',
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT,
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE reserved_names (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE subscriptions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id),
        plan TEXT NOT NULL DEFAULT 'BRONZE',
        order_id TEXT NOT NULL,
        order_amount REAL NOT NULL DEFAULT 0,
        payment_session_id TEXT,
        paid_amount REAL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE plan_configs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        plan_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 0,
        features JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE root_domains (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        domain TEXT NOT NULL,
        zone_id TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      INSERT INTO plan_configs (plan_id, name, description, price, features) VALUES
        ('BRONZE', 'Bronze', 'Your free corner of the internet — no credit card, no catch.', 0, '["Up to 5 subdomains","50 DNS records","All DNS record types","Cloudflare proxy (orange cloud)","REST API access","Community support"]'),
        ('SILVER', 'Silver', 'More corners, more control — for professionals who ship.', 1, '["Up to 30 subdomains","500 DNS records","All DNS record types","Cloudflare proxy (orange cloud)","REST API + CLI access","Activity logs (30-day retention)","Webhook notifications","Email support"]'),
        ('GOLD', 'Gold', 'Collaborate at scale with shared workspaces and priority support.', 10, '["Up to 100 subdomains","2,500 DNS records","All DNS record types","Cloudflare proxy (orange cloud)","REST API + CLI access","Activity logs (90-day retention)","Webhook notifications","Team workspaces","Priority support"]')
      ON CONFLICT (plan_id) DO NOTHING;
    `);

    console.log('All tables created successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
