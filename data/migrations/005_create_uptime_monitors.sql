CREATE TABLE IF NOT EXISTS uptime_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subdomain_id TEXT NOT NULL REFERENCES subdomains(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  check_interval INTEGER NOT NULL DEFAULT 5,
  timeout INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_status TEXT CHECK (last_status IN ('UP','DOWN','UNKNOWN')),
  last_checked_at TIMESTAMPTZ,
  uptime_percentage REAL NOT NULL DEFAULT 100.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uptime_monitors_user_id ON uptime_monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_uptime_monitors_subdomain_id ON uptime_monitors(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_uptime_monitors_is_active ON uptime_monitors(is_active);

CREATE TABLE IF NOT EXISTS uptime_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES uptime_monitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('UP','DOWN')),
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uptime_checks_monitor_id ON uptime_checks(monitor_id);
CREATE INDEX IF NOT EXISTS idx_uptime_checks_checked_at ON uptime_checks(checked_at DESC);

