const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const ALLOWED_MODELS = new Set(['gemini-3.6-flash']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  const geminiUrl = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  try {
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    });

    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach AI service' });
  }
}
