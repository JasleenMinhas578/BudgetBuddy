const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { checkAndIncrement } = require('../services/aiUsage');
const { TOOLS, executeTool } = require('../services/aiTools');
const { callGemini } = require('../services/geminiClient');
const { buildChatPrompt, buildSummaryPrompt } = require('../services/aiPrompts');

const router = express.Router();

const FALLBACK = { intent: 'CHAT', message: "Sorry, I couldn't process that. Try rephrasing your question." };
const BUSY_MESSAGE = 'BudgetBuddy AI is busy right now (upstream model overloaded or rate-limited). Please try again in a moment.';

// callGemini's errors are Google's raw upstream text (e.g. "quota exceeded
// ... model: gemini-3.1-pro") — informative for logs, meaningless and
// confusing to a user. Log the real one, surface a plain one.
function sanitizeGeminiError(err) {
  console.error('[ai] Gemini request failed:', err.message);
  const clean = new Error(BUSY_MESSAGE);
  clean.status = err.status === 429 ? 429 : 503;
  return clean;
}

function extractJson(text) {
  const intentIdx = text.indexOf('{"intent"');
  const searchText = intentIdx !== -1 ? text.slice(intentIdx) : text;
  const match = searchText.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

router.post('/chat', asyncHandler(async (req, res) => {
  await checkAndIncrement(req.uid);

  const { message, sessionDateRange, currencyInfo } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const prompt = buildChatPrompt(message, today, sessionDateRange, currencyInfo);
  const contents = [{ role: 'user', parts: [{ text: prompt }] }];

  let finalText = null;
  for (let turn = 0; turn < 5 && finalText === null; turn++) {
    let data;
    try {
      data = await callGemini(contents, TOOLS);
    } catch (err) {
      throw sanitizeGeminiError(err);
    }
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCalls = parts.filter((p) => p.functionCall);

    if (functionCalls.length === 0) {
      finalText = parts.map((p) => p.text || '').join('').trim();
      break;
    }

    // Record the model's own turn (the function call request) verbatim,
    // then run every requested tool and hand the results back as the next turn.
    contents.push({ role: 'model', parts });

    const responseParts = [];
    for (const p of functionCalls) {
      const { name, args } = p.functionCall;
      let result;
      try {
        result = await executeTool(req.uid, name, args);
      } catch (err) {
        result = { error: err.message };
      }
      responseParts.push({ functionResponse: { name, response: { result } } });
    }
    // This model's API rejects role "function" for tool results (the classic
    // Gemini function-calling role name) — it wants the result framed as
    // the next "user" turn instead.
    contents.push({ role: 'user', parts: responseParts });
  }

  if (!finalText) return res.json(FALLBACK);
  res.json(extractJson(finalText) || FALLBACK);
}));

router.post('/summary', asyncHandler(async (req, res) => {
  await checkAndIncrement(req.uid);

  const { expenses = [], filterLabel, currencyInfo } = req.body;
  const trimmed = expenses
    .slice(-200)
    .map((e) => ({ title: e.title, amount: e.amount, category: e.category, date: e.date }));

  const today = new Date().toISOString().slice(0, 10);
  const prompt = buildSummaryPrompt(trimmed, filterLabel || 'the selected period', currencyInfo, today);

  let data;
  try {
    data = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], null, { temperature: 0.4, maxOutputTokens: 1052 });
  } catch (err) {
    throw sanitizeGeminiError(err);
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) return res.status(502).json({ error: 'Empty response from AI' });
  res.json({ summary: text });
}));

module.exports = router;
