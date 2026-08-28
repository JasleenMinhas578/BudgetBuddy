import { createVerify } from 'crypto';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const ALLOWED_MODELS = new Set(['gemini-3.6-flash']);
const FIREBASE_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// In-process server-side rate limiter: uid → { count, date }
const rateLimitMap = new Map();
const DAILY_LIMIT = 50;

// Cache Firebase public keys using the TTL from their Cache-Control header
let cachedKeys = null;
let keyCacheExpiry = 0;

async function getFirebasePublicKeys() {
  if (cachedKeys && Date.now() < keyCacheExpiry) return cachedKeys;
  const res = await fetch(FIREBASE_KEYS_URL);
  if (!res.ok) throw new Error('Failed to fetch Firebase public keys');
  const cc = res.headers.get('cache-control') || '';
  const maxAgeMatch = cc.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3_600_000;
  cachedKeys = await res.json();
  keyCacheExpiry = Date.now() + maxAge;
  return cachedKeys;
}

async function verifyFirebaseToken(idToken) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID not configured');

  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');

  const [headerB64, payloadB64, sigB64] = parts;

  let header, payload;
  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid token encoding');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) throw new Error('Token expired');
  if (payload.iat > now + 300) throw new Error('Token issued in the future');
  if (payload.aud !== projectId) throw new Error('Wrong audience');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Wrong issuer');
  if (!payload.sub || typeof payload.sub !== 'string') throw new Error('Missing subject');

  const keys = await getFirebasePublicKeys();
  const certPem = keys[header.kid];
  if (!certPem) throw new Error('Unknown signing key');

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  if (!verifier.verify(certPem, sigB64, 'base64url')) throw new Error('Invalid signature');

  return { uid: payload.sub };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const idToken = req.headers['authorization']?.replace('Bearer ', '');
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let uid;
  try {
    ({ uid } = await verifyFirebaseToken(idToken));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Server-side rate limiting per user per day
  const today = new Date().toISOString().slice(0, 10);
  const entry = rateLimitMap.get(uid) ?? { count: 0, date: today };
  if (entry.date !== today) { entry.count = 0; entry.date = today; }
  if (entry.count >= DAILY_LIMIT) {
    return res.status(429).json({ error: 'Daily AI limit reached' });
  }
  entry.count++;
  rateLimitMap.set(uid, entry);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured' });
  }

  const { model, contents, generationConfig } = req.body;
  if (!model || !contents) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: 'Invalid model' });
  }

  const geminiUrl = `${GEMINI_BASE}/${model}:generateContent`;

  try {
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents, generationConfig }),
    });

    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to reach AI service' });
  }
}
