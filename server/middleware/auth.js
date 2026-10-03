// Verifies the Supabase access token the React app sends. getClaims() checks
// the signature against the project's public keys (JWKS, fetched once and
// cached) plus expiry — the same job aws-jwt-verify did for Cognito, and
// firebase-admin's verifyIdToken before that.
const { createClient } = require('@supabase/supabase-js');
const pool = require('../db');
const { SUPPORTED_CURRENCIES } = require('../constants');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// uid → the claims last written to the DB by this server instance. Lets us
// skip the provisioning write (a DB round trip) on every request after the
// first, and only write again when the email/name actually changed. Per warm
// instance only — a cold start just re-runs the idempotent upsert once.
const provisioned = new Map();
const MAX_PROVISIONED = 1000;

module.exports = async function requireAuth(req, res, next) {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase.auth.getClaims(accessToken);
    // The anon key is itself a validly-signed JWT (role "anon", no user) —
    // only a signed-in user's token may reach the API.
    if (error || data?.claims?.role !== 'authenticated' || !data.claims.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { claims } = data;
    req.uid = claims.sub;

    // Supabase Auth keeps its users in its own `auth` schema; expenses and
    // categories have a foreign key to our `users` table. Just-in-time
    // provisioning here means any newly confirmed user works immediately,
    // on their very first API call. The same statement seeds their settings
    // row from the home currency picked at signup — only if they don't have
    // one yet, so it never overrides a later change made in Settings.
    const displayName = claims.user_metadata?.name || null;
    const homeCurrency = SUPPORTED_CURRENCIES.includes(claims.user_metadata?.home_currency)
      ? claims.user_metadata.home_currency
      : null;
    const signature = JSON.stringify([claims.email, displayName, homeCurrency]);
    if (provisioned.get(req.uid) === signature) return next();

    await pool.query(
      `WITH u AS (
         INSERT INTO users (id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name
         RETURNING id
       )
       INSERT INTO settings (user_id, currency, home_currency)
       SELECT id, $4, $4 FROM u WHERE $4::text IS NOT NULL
       ON CONFLICT (user_id) DO NOTHING`,
      [claims.sub, claims.email, displayName, homeCurrency]
    );
    if (provisioned.size >= MAX_PROVISIONED) provisioned.clear();
    provisioned.set(req.uid, signature);

    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
