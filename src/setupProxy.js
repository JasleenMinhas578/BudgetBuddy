const express = require('express');

// CRA dev server proxy — mirrors api/ai.js so local `npm start` can reach Gemini.
// In production (Vercel), api/ai.js handles this route instead.
module.exports = function (app) {
  app.use(express.json());

  app.post('/api/ai', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI service not configured — set GEMINI_API_KEY in .env' });

    const { model, contents, generationConfig } = req.body;
    if (!model || !contents) return res.status(400).json({ error: 'Missing required fields' });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
  });
};
