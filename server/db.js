// Connection pool for the Express API. Reads standard PG* env vars
// (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD) automatically — no
// config needed here beyond SSL, which RDS requires.
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

const pool = new Pool({
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
