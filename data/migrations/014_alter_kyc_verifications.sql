ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS purpose TEXT;

ALTER TABLE kyc_verifications ALTER COLUMN id_type DROP NOT NULL;
ALTER TABLE kyc_verifications ALTER COLUMN id_number DROP NOT NULL;

DO $$
DECLARE
  con_name text;
BEGIN
  SELECT con.conname INTO con_name
  FROM pg_catalog.pg_constraint con
  INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'kyc_verifications' AND con.contype = 'c'
  LIMIT 1;
  IF con_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE kyc_verifications DROP CONSTRAINT ' || con_name;
  END IF;
END $$;
