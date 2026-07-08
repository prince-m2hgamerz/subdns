CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_on_subdomain_created BOOLEAN DEFAULT true,
  notify_on_dns_created BOOLEAN DEFAULT true,
  notify_on_dns_updated BOOLEAN DEFAULT true,
  notify_on_subdomain_down BOOLEAN DEFAULT true,
  notify_on_account_banned BOOLEAN DEFAULT true,
  notify_on_plan_changed BOOLEAN DEFAULT true,
  notify_on_report_status BOOLEAN DEFAULT true,
  notify_on_api_key_created BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  last_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_prefs_user ON user_notification_preferences(user_id);
CREATE INDEX idx_webhooks_user ON webhooks(user_id);
