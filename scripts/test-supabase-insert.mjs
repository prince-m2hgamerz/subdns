import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE;

async function main() {
  // Test inserting via Supabase REST API
  const res = await fetch(`${url}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      name: 'SupabaseTest',
      email: 'supatest@example.com',
      password: '$2b$12$testhashedpassword',
    }),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  try {
    console.log('Response:', JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log('Raw response:', text);
  }
}

main().catch(err => console.error(err));
