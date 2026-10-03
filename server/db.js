// Connection pool for the Express API. Uses DATABASE_URL if set (Supabase's
// pooler connection string), otherwise the standard PG* env vars (PGHOST,
// PGPORT, PGDATABASE, PGUSER, PGPASSWORD), which `pg` reads automatically.
const { Pool, types } = require('pg');

// pg's default DATE (oid 1082) parser converts to a JS Date using local
// timezone, then JSON serialization shifts it to UTC — corrupting the date
// by a few hours. Returning the raw 'YYYY-MM-DD' string sidesteps this
// entirely, since a DATE column has no time-of-day or timezone to represent.
types.setTypeParser(1082, (val) => val);

// pg leaves NUMERIC (oid 1700) as a string by default, to avoid silent
// float-precision loss on huge values. The app's amounts are always small
// enough that this doesn't matter, and the frontend's currency conversion
// math expects a real number — so parse it here rather than at every call site.
types.setTypeParser(1700, (val) => parseFloat(val));

// Small max: on Vercel this pool is created per warm serverless container,
// not once for the whole process like a traditional long-running server —
// the default of 10 could multiply across concurrent invocations. Pair with
// Supabase's transaction pooler (port 6543), which is built for exactly this.
// SSL without CA verification: Supabase's certificate isn't signed by a CA
// in Node's default trust store. Don't put `sslmode` in DATABASE_URL — pg
// lets it override this setting.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

module.exports = pool;
