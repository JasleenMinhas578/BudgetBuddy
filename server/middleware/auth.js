// Verifies the Cognito ID token the React app sends. aws-jwt-verify is the
// AWS-maintained library for this — it fetches the User Pool's public keys
// (JWKS), caches them, and checks signature/expiry/issuer/audience, the same
// job firebase-admin's verifyIdToken did before.
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const pool = require('../db');

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.COGNITO_CLIENT_ID,
});

module.exports = async function requireAuth(req, res, next) {
  const idToken = req.headers.authorization?.replace('Bearer ', '');
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = await verifier.verify(idToken);
    req.uid = payload.sub;

    // Firebase's migration script pre-created every users row; Cognito has
    // no equivalent step, and expenses/categories have a foreign key to
    // users.id. Just-in-time provisioning here means any newly confirmed
    // Cognito user works immediately, on their very first API call.
    await pool.query(
      `INSERT INTO users (id, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name`,
      [payload.sub, payload.email, payload.name || null]
    );

    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
