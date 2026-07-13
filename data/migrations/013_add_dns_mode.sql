-- Migration: Add dns_mode and nameservers to subdomains
ALTER TABLE subdomains
  ADD COLUMN IF NOT EXISTS dns_mode TEXT NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN IF NOT EXISTS nameservers JSONB;
