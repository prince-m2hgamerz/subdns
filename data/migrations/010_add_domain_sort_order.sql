ALTER TABLE root_domains ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE root_domains SET sort_order = 0 WHERE sort_order IS NULL;
