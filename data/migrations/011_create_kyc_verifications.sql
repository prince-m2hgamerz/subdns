CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('passport', 'driver_license', 'national_id')),
  id_number TEXT NOT NULL,
  id_front_url TEXT,
  id_back_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(verification_status);
