-- Migration: Add plan_configs table for admin-editable plans
CREATE TABLE IF NOT EXISTS plan_configs (
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

INSERT INTO plan_configs (plan_id, name, description, price, features) VALUES
  ('BRONZE', 'Bronze', 'Your free corner of the internet — no credit card, no catch.', 0, '["Up to 10 subdomains","50 DNS records","All DNS record types","Cloudflare proxy (orange cloud)","REST API access","Community support"]'),
  ('SILVER', 'Silver', 'More corners, more control — for professionals who ship.', 99, '["Up to 50 subdomains","500 DNS records","All DNS record types","Cloudflare proxy (orange cloud)","REST API + CLI access","Activity logs (30-day retention)","Webhook notifications","Email support"]'),
  ('GOLD', 'Gold', 'Collaborate at scale with shared workspaces and priority support.', 499, '["Up to 250 subdomains","2,500 DNS records","All DNS record types","Cloudflare proxy (orange cloud)","REST API + CLI access","Activity logs (90-day retention)","Webhook notifications","Team workspaces","Priority support"]')
ON CONFLICT (plan_id) DO NOTHING;
