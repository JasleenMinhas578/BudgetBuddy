const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Rent', 'Other'];

export const processMessage = async (userMessage, expenses = [], customCategories = []) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    throw new Error('Gemini API key not set. Add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server.');
  }

  const today = new Date().toISOString().split('T')[0];

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories
      .filter(c => !DEFAULT_CATEGORIES.includes(c.name))
      .map(c => c.name),
  ];

  // Trim to last 200 records to keep the prompt small
  const expenseContext = expenses
    .slice(-200)
    .map(e => ({ title: e.title, amount: e.amount, category: e.category, date: e.date }));

  const prompt = `You are BudgetBuddy AI, a helpful personal finance assistant. Today is ${today}.

USER'S EXPENSE HISTORY (${expenseContext.length} records):
${JSON.stringify(expenseContext)}

AVAILABLE CATEGORIES: ${allCategories.join(', ')}

TASK: Read the user message and respond with ONLY raw JSON — no markdown, no code fences, no explanation.

Classify the user's intent as one of:
- "ADD_EXPENSE"  → user wants to log/add/record an expense (e.g. "spent $30 on lunch", "add coffee $5")
- "QUERY"        → user asks a question about their spending data
- "CHAT"         → greeting, general question, or unclear intent

Required JSON format:
{
  "intent": "ADD_EXPENSE" | "QUERY" | "CHAT",
  "message": "friendly 1-3 sentence response",
  "expenseData": {
    "title": "short descriptive title",
    "amount": 0,
    "category": "must be one of the available categories above",
    "date": "YYYY-MM-DD"
  }
}

Rules:
- Include "expenseData" ONLY when intent is "ADD_EXPENSE"
- For QUERY: compute the answer from the expense history and put it in "message". Be specific with numbers.
- For ADD_EXPENSE: "amount" must be a number (not a string), "date" must be YYYY-MM-DD
- Interpret relative dates: "today" = ${today}, "yesterday" = one day before, etc.
- If amount or title is missing for an expense, use CHAT intent and ask for the missing detail
- Pick the best matching category from the available list

User message: "${userMessage}"`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from AI');

  // Extract JSON even if the model wraps it in backticks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned an unexpected format');

  return JSON.parse(jsonMatch[0]);
};
