CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  owner_email TEXT,
  subdomain_id UUID NOT NULL REFERENCES public.subdomains(id) ON DELETE CASCADE,
  subdomain_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  full_domain TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL,
  dns_mode TEXT NOT NULL,
  signature TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow anon SELECT for certificate verification
CREATE POLICY "anon_certificates_select"
  ON public.certificates FOR SELECT
  USING (true);

-- Allow service role full access
CREATE POLICY "service_certificates_all"
  ON public.certificates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Grant anon SELECT
GRANT SELECT ON public.certificates TO anon;
