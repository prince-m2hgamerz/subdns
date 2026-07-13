CREATE TABLE IF NOT EXISTS user_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL CHECK (agreement_type IN (
    'terms_of_service', 'privacy_policy', 'aup', 'dmca', 'refunds', 'cookies', 'disclaimer'
  )),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_agreements_user_id ON user_agreements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_agreements_type ON user_agreements(agreement_type);
