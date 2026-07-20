ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS scopes text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description text DEFAULT '',
ADD COLUMN IF NOT EXISTS expires_at timestamptz;
