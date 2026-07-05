import pg from 'pg';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const email = "debug@test.com";
    const password = "test123456";
    const name = "Debug";

    // Check if exists
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    console.log('Existing:', existing.rows);

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('Hashed password length:', hashedPassword.length);

      const insertResult = await client.query(
        `INSERT INTO users (name, email, password, id) VALUES ($1, $2, $3, gen_random_uuid()::text) RETURNING id, email, name`,
        [name, email, hashedPassword]
      );
      console.log('Insert result:', insertResult.rows[0]);
    }

    // Now try to read it back
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('Retrieved user:', user.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
