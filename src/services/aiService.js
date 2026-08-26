const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Rent', 'Other'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RETRY_DELAYS = [5000, 15000, 30000];

const fetchWithRetry = async (url, options) => {
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    if (attempt < RETRY_DELAYS.length) await sleep(RETRY_DELAYS[attempt]);
  }
  return fetch(url, options);
};

const DAILY_LIMIT = 50;
const USAGE_KEY = 'bb_ai_usage';

const checkAndIncrementUsage = () => {
  const today = new Date().toISOString().split('T')[0];
  let usage = { date: today, count: 0 };

  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) usage = parsed;
    }
  } catch {}

  if (usage.count >= DAILY_LIMIT) {
    throw new Error(`Daily AI limit of ${DAILY_LIMIT} requests reached. Resets at midnight.`);
  }

  usage.count += 1;
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch {}
};

export const processMessage = async (userMessage, expenses = [], customCategories = [], sessionDateRange = null) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    throw new Error('Gemini API key not set. Add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server.');
  }
  checkAndIncrementUsage();

  const today = new Date().toISOString().split('T')[0];

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories
      .filter(c => !DEFAULT_CATEGORIES.includes(c.name))
      .map(c => c.name),
  ];

  // Pre-filter expenses to the active session date range (reduces prompt size + keeps AI focused)
  const filteredExpenses = sessionDateRange
    ? expenses.filter(e => e.date >= sessionDateRange.from && e.date <= sessionDateRange.to)
    : expenses;

  // Aggregate over ALL filtered records — used for accurate QUERY answers
  const spendingByCategory = {};
  const spendingByMonth = {};
  const spendingByCategoryMonth = {};
  const countByCategory = {};
  const countByMonth = {};
  let grandTotal = 0;
  let largestExpense = null;
  filteredExpenses.forEach(e => {
    const month = e.date ? e.date.slice(0, 7) : 'unknown';

    spendingByCategory[e.category] = +(((spendingByCategory[e.category] || 0) + e.amount).toFixed(2));
    spendingByMonth[month] = +(((spendingByMonth[month] || 0) + e.amount).toFixed(2));

    if (!spendingByCategoryMonth[e.category]) spendingByCategoryMonth[e.category] = {};
    spendingByCategoryMonth[e.category][month] = +(((spendingByCategoryMonth[e.category][month] || 0) + e.amount).toFixed(2));

    countByCategory[e.category] = (countByCategory[e.category] || 0) + 1;
    countByMonth[month] = (countByMonth[month] || 0) + 1;

    grandTotal = +(grandTotal + e.amount).toFixed(2);

    if (!largestExpense || e.amount > largestExpense.amount) {
      largestExpense = { id: e.id, title: e.title, amount: e.amount, category: e.category, date: e.date };
    }
  });

  const avgPerTransaction = filteredExpenses.length > 0
    ? +(grandTotal / filteredExpenses.length).toFixed(2)
    : 0;

  let numDays = 0;
  if (sessionDateRange) {
    numDays = Math.round((new Date(sessionDateRange.to) - new Date(sessionDateRange.from)) / 86400000) + 1;
  } else if (filteredExpenses.length > 0) {
    const dates = filteredExpenses.map(e => e.date).filter(Boolean).sort();
    numDays = Math.round((new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000) + 1;
  }
  const dailyAvg = numDays > 0 ? +(grandTotal / numDays).toFixed(2) : null;

  const spendingByMonthSorted = Object.keys(spendingByMonth)
    .sort()
    .map(month => ({ month, total: spendingByMonth[month] }));

  // Only last 50 individual records — enough for EDIT/DELETE context without bloating the prompt
  const recentExpenses = filteredExpenses
    .slice(-50)
    .map(e => ({ id: e.id, title: e.title, amount: e.amount, category: e.category, date: e.date }));

  const dateRangeSection = sessionDateRange
    ? `ACTIVE SESSION DATE RANGE: ${sessionDateRange.label} (${sessionDateRange.from} to ${sessionDateRange.to}). Treat this as the default period for all spending questions unless the user explicitly names a different period.`
    : `NO SESSION DATE RANGE SET. If the user asks a spending QUERY that does not mention any time period (no "this month", "last week", "today", "January", specific dates, etc.), respond with intent "ASK_DATE_RANGE" to ask which period they want.`;

  const prompt = `You are BudgetBuddy AI, a helpful personal finance assistant. Today is ${today}.

${dateRangeSection}

SPENDING SUMMARY (all ${filteredExpenses.length} records${sessionDateRange ? ` — ${sessionDateRange.label}` : ''}):
Total spent: $${grandTotal}
Average per transaction: $${avgPerTransaction}
Daily average: ${dailyAvg !== null ? `$${dailyAvg}` : 'n/a'}
By category: ${JSON.stringify(spendingByCategory)}
By month (chronological — use for trend analysis): ${JSON.stringify(spendingByMonthSorted)}
By category and month: ${JSON.stringify(spendingByCategoryMonth)}
Count by category: ${JSON.stringify(countByCategory)}
Count by month: ${JSON.stringify(countByMonth)}
Largest single expense: ${JSON.stringify(largestExpense)}

RECENT EXPENSES — last ${recentExpenses.length} individual records (use these to find specific expenses for EDIT or DELETE):
${JSON.stringify(recentExpenses)}

AVAILABLE CATEGORIES: ${allCategories.join(', ')}
CUSTOM CATEGORIES (with IDs, only these can be deleted/renamed): ${JSON.stringify(customCategories.map(c => ({ id: c.id, name: c.name })))}

TASK: Read the user message and respond with ONLY raw JSON — no markdown, no code fences, no explanation.

Classify the user's intent as one of:
- "ADD_EXPENSE"     → user wants to log/add/record an expense (e.g. "spent $30 on lunch", "add coffee $5")
- "ADD_CATEGORY"    → user wants to create a new category (e.g. "add category gym", "create a travel category", "new category masti")
- "DELETE_EXPENSE"  → user wants to delete/remove a specific expense from their history
- "EDIT_EXPENSE"    → user wants to change/update/fix a specific expense (amount, title, category, or date)
- "DELETE_CATEGORY" → user wants to delete/remove a custom category (only custom categories, not default ones)
- "EDIT_CATEGORY"   → user wants to rename a custom category
- "QUERY"           → user asks a question about their spending data AND a time period is known (either mentioned in the message or set as the session range)
- "ASK_DATE_RANGE"  → user asks a spending question but no time period is mentioned and no session range is set
- "SET_DATE_RANGE"  → user's message IS a date range / time period (e.g. "last month", "January", "past 3 weeks", "2026-07-01 to 2026-07-31")
- "CHAT"            → greeting, general question, or unclear intent (including when you cannot identify which expense/category the user means)

Required JSON format:
{
  "intent": "ADD_EXPENSE" | "ADD_CATEGORY" | "DELETE_EXPENSE" | "EDIT_EXPENSE" | "DELETE_CATEGORY" | "EDIT_CATEGORY" | "QUERY" | "ASK_DATE_RANGE" | "SET_DATE_RANGE" | "CHAT",
  "message": "friendly 1-3 sentence response",
  "expenseData": { "title": "...", "amount": 0, "category": "...", "date": "YYYY-MM-DD" },
  "categoryData": { "name": "..." },
  "deleteExpenseData": { "id": "...", "title": "...", "amount": 0, "category": "...", "date": "YYYY-MM-DD" },
  "editExpenseData": { "id": "...", "title": "...", "amount": 0, "category": "...", "date": "YYYY-MM-DD", "updates": { "title": "...", "amount": 0, "category": "...", "date": "YYYY-MM-DD" } },
  "deleteCategoryData": { "id": "...", "name": "..." },
  "editCategoryData": { "id": "...", "name": "...", "newName": "..." },
  "dateRange": { "label": "human-friendly label", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }
}

Rules:
- Include "expenseData" ONLY when intent is "ADD_EXPENSE"
- Include "categoryData" ONLY when intent is "ADD_CATEGORY" — "name" should be the category name the user specified, capitalised properly
- Include "deleteExpenseData" ONLY when intent is "DELETE_EXPENSE" — find the matching expense from the history by its id, title, amount, category, and date
- Include "editExpenseData" ONLY when intent is "EDIT_EXPENSE" — "updates" contains only the fields being changed; use the expense's id from the history
- Include "deleteCategoryData" ONLY when intent is "DELETE_CATEGORY" — use the id from CUSTOM CATEGORIES list; if it's a default category, use CHAT intent and explain it can't be deleted
- Include "editCategoryData" ONLY when intent is "EDIT_CATEGORY" — use the id from CUSTOM CATEGORIES list; if it's a default category, use CHAT intent and explain it can't be renamed
- Include "dateRange" ONLY when intent is "SET_DATE_RANGE"
- If the user says "add category X" prefer ADD_CATEGORY over ADD_EXPENSE even if X sounds like a purchase
- Spelling mistakes are common — use fuzzy matching to find the closest expense title or category name from the lists above, even if the user's spelling is off (e.g. "masti categor" → "Masti", "coffe" → "Coffee"). Always pick the best match rather than giving up.
- If you matched a misspelled name, mention what you found in "message" (e.g. "I found 'Masti' — confirming before I delete it.") so the user can verify on the confirm card.
- If there are two or more equally close matches and you genuinely cannot tell which one the user means, use CHAT intent and list the options (e.g. "I found 'Food' and 'Foods' — which one did you mean?")
- If you cannot identify any matching expense or category even with fuzzy matching, use CHAT intent and ask them to be more specific (e.g. mention the amount, date, or title)
- If the user wants to edit/update an expense but hasn't said what to change (no new amount, title, category, or date mentioned), use CHAT intent and ask: "What would you like to change — the amount, title, category, or date?"
- If the user says "last expense" or "most recent expense", look at the expense history and identify the one with the latest date as the target
- For SET_DATE_RANGE: parse the period into exact from/to dates. "label" is a short human-friendly name (e.g. "last month", "July 2026", "past 3 weeks"). message should confirm the range and invite the user to ask their spending questions.
- For ASK_DATE_RANGE: ONLY use this when there is NO active session date range AND the user has not mentioned any time period. If a session date range is already set, NEVER use ASK_DATE_RANGE — always use QUERY with the session range instead. When you do ask, invite the user to name a period (e.g. this month, last month, a specific range). This applies to all spending questions — "biggest expense", "most spent on", "average spend", count questions, etc.
- For QUERY: use the SPENDING SUMMARY (grand total and by-category totals) for accurate answers — it covers all records, not just the recent 50. Put the answer in "message" and be specific with numbers.
- For ADD_EXPENSE: "amount" must be a number (not a string), "date" must be YYYY-MM-DD
- Interpret relative dates: "today" = ${today}, "yesterday" = one day before, etc.
- If amount or title is missing for an expense, use CHAT intent and ask for the missing detail
- Pick the best matching category from the available list
- If the user asks what you can do, your capabilities are, or similar: use CHAT intent and list: add expenses, add categories, delete expenses, edit expenses (change amount/title/category/date), delete custom categories, rename custom categories, and answer spending questions for any time period

User message: "${userMessage}"`;

  const res = await fetchWithRetry(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('Too many requests right now — please wait a moment and try again.');
    throw new Error(err.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from AI');

  // Extract JSON even if the model wraps it in backticks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { intent: 'CHAT', message: "I didn't quite catch that. You can ask me to add, edit, or delete expenses and categories, or ask questions about your spending. For example: \"delete my coffee expense\", \"rename Masti to Fun\", or \"how much did I spend this month?\"" };
  }

  return JSON.parse(jsonMatch[0]);
};

export const generateSummary = async (expenses, filterLabel) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    throw new Error('Gemini API key not set. Add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server.');
  }
  checkAndIncrementUsage();

  const today = new Date().toISOString().split('T')[0];
  const trimmed = expenses
    .slice(-200)
    .map(e => ({ title: e.title, amount: e.amount, category: e.category, date: e.date }));

  const total = trimmed.reduce((sum, e) => sum + e.amount, 0);

  const prompt = `You are BudgetBuddy AI, a personal finance assistant. Today is ${today}.

The user wants a summary of their spending for: ${filterLabel}

EXPENSE DATA (${trimmed.length} transactions, total $${total.toFixed(2)}):
${JSON.stringify(trimmed)}

Write a 3-4 sentence paragraph that:
1. States the total amount spent and the period
2. Identifies the top spending category and any notable pattern (e.g. frequent small purchases, one large expense)
3. Gives one specific and actionable suggestion to reduce spending

Reply with ONLY the paragraph — no headings, no bullet points, no JSON, no markdown.`;

  const res = await fetchWithRetry(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 256 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('Too many requests right now — please wait a moment and try again.');
    throw new Error(err.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from AI');
  return text;
};
