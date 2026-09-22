// Thin client for the server-side AI endpoints (server/routes/ai.js).
// All prompt-building, tool-calling, and Gemini access now happens there —
// this file just posts the user's message/context and returns the parsed
// response. See ROADMAP.md "Phase 3" for why: retrieval moved from
// "stuff everything into the prompt" to real SQL run through Gemini
// function calling, which only the server can do against Postgres.
import { apiFetch } from './apiClient';

export const processMessage = async (userMessage, sessionDateRange = null, currencyInfo = null) => {
  return apiFetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage, sessionDateRange, currencyInfo }),
  });
};

export const generateSummary = async (expenses, filterLabel, currencyInfo = null) => {
  const trimmed = expenses
    .slice(-200)
    .map((e) => ({ title: e.title, amount: e.amount, category: e.category, date: e.date }));

  const { summary } = await apiFetch('/api/ai/summary', {
    method: 'POST',
    body: JSON.stringify({ expenses: trimmed, filterLabel, currencyInfo }),
  });
  return summary;
};
