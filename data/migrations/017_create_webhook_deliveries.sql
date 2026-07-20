ALTER TABLE webhooks
ADD COLUMN IF NOT EXISTS max_retries integer NOT NULL DEFAULT 3;

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  url text NOT NULL,
  status integer NOT NULL DEFAULT 0,
  ok boolean NOT NULL DEFAULT false,
  request_body text NOT NULL DEFAULT '',
  response_body text NOT NULL DEFAULT '',
  duration_ms integer NOT NULL DEFAULT 0,
  attempt integer NOT NULL DEFAULT 1,
  max_retries integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
