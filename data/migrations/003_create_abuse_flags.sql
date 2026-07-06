CREATE TABLE IF NOT EXISTS abuse_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain_name TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  signals JSONB NOT NULL DEFAULT '[]',
  verdict TEXT NOT NULL CHECK (verdict IN ('allow','review_async','review_sync','block')),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  review_note TEXT,
  llm_verdict JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_abuse_flags_review_status ON abuse_flags(review_status);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_user_id ON abuse_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_score ON abuse_flags(score DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_created_at ON abuse_flags(created_at DESC);
