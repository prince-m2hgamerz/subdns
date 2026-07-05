CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings (key, value) VALUES
  ('siteName', 'SubDNS'),
  ('siteDescription', 'Subdomain Management Platform'),
  ('registrationOpen', 'true'),
  ('defaultSubdomainLimit', '10'),
  ('maxSubdomainLength', '63'),
  ('payment_mode', 'test')
ON CONFLICT (key) DO NOTHING;
