const { Pool } = require("pg");
require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env.local") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Public users table
  let r = await pool.query(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' ORDER BY ordinal_position"
  );
  console.log("=== public.users ===");
  console.log(JSON.stringify(r.rows, null, 2));

  // Check what subdomain routes use for user_id
  r = await pool.query(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'subdomains' ORDER BY ordinal_position"
  );
  console.log("\n=== subdomains ===");
  console.log(JSON.stringify(r.rows, null, 2));

  // Check auth.users id type
  r = await pool.query(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id'"
  );
  console.log("\n=== auth.users.id ===");
  console.log(JSON.stringify(r.rows, null, 2));

  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
