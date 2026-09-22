// The tool-calling side of the RAG pipeline: Gemini decides which of these
// to call based on the user's question, this file runs the actual scoped
// SQL (WHERE user_id = $1, always — never trust args for that), and the
// result goes back to Gemini as a functionResponse for it to reason over.
const pool = require('../db');
const { DEFAULT_CATEGORIES } = require('../constants');

const TOOLS = [
  {
    name: 'get_spending_summary',
    description: 'Get total spending, transaction count, and a per-category breakdown for a date range. Use for "how much did I spend", "spending by category", "average spend" questions.',
    parameters: {
      type: 'OBJECT',
      properties: {
        from: { type: 'STRING', description: 'Start date, YYYY-MM-DD, inclusive' },
        to: { type: 'STRING', description: 'End date, YYYY-MM-DD, inclusive' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'get_monthly_totals',
    description: 'Get total spending grouped by month for a date range. Use for trend or month-over-month comparison questions.',
    parameters: {
      type: 'OBJECT',
      properties: {
        from: { type: 'STRING', description: 'Start date, YYYY-MM-DD, inclusive' },
        to: { type: 'STRING', description: 'End date, YYYY-MM-DD, inclusive' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'get_top_expenses',
    description: 'Get the largest individual expenses in a date range, sorted by amount descending. Use for "biggest expense" / "top N expenses" questions.',
    parameters: {
      type: 'OBJECT',
      properties: {
        from: { type: 'STRING', description: 'Start date, YYYY-MM-DD, inclusive' },
        to: { type: 'STRING', description: 'End date, YYYY-MM-DD, inclusive' },
        limit: { type: 'INTEGER', description: 'How many to return, default 5' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'find_expenses',
    description: 'Search individual expense records by title text, category, and/or date range, newest first. Use this to locate the specific expense(s) a user means before an EDIT_EXPENSE or DELETE_EXPENSE, to find their "last"/"most recent" expense, or to answer "what did I spend on X" questions. Title matching is a case-insensitive substring — try a short, simple guess (e.g. "coffee" not "my coffee purchase").',
    parameters: {
      type: 'OBJECT',
      properties: {
        titleQuery: { type: 'STRING', description: 'Partial title text to search for' },
        category: { type: 'STRING', description: 'Exact category name to filter by' },
        from: { type: 'STRING', description: 'Start date, YYYY-MM-DD, inclusive' },
        to: { type: 'STRING', description: 'End date, YYYY-MM-DD, inclusive' },
        limit: { type: 'INTEGER', description: 'Max results, default 10' },
      },
      required: [],
    },
  },
  {
    name: 'get_budget_status',
    description: 'Get the user\'s current monthly budget goals per category, how much they\'ve spent against each so far this month, and the overall monthly budget. Use for any budget/goal question.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'list_categories',
    description: 'List the 7 built-in default category names plus any custom categories the user has created (with their IDs). Call this before ADD_CATEGORY, DELETE_CATEGORY, EDIT_CATEGORY, or SET_BUDGET/REMOVE_BUDGET so names and IDs are matched correctly instead of guessed.',
    parameters: { type: 'OBJECT', properties: {} },
  },
];

async function get_spending_summary(userId, { from, to }) {
  const { rows } = await pool.query(
    `SELECT category_name, SUM(amount)::float AS total, COUNT(*)::int AS count
     FROM expenses WHERE user_id = $1 AND expense_date BETWEEN $2 AND $3
     GROUP BY category_name ORDER BY total DESC`,
    [userId, from, to]
  );
  const totalSpent = +rows.reduce((s, r) => s + r.total, 0).toFixed(2);
  const transactionCount = rows.reduce((s, r) => s + r.count, 0);
  return {
    from, to, totalSpent, transactionCount,
    averageTransaction: transactionCount > 0 ? +(totalSpent / transactionCount).toFixed(2) : 0,
    byCategory: rows.map((r) => ({ category: r.category_name, total: +r.total.toFixed(2), count: r.count })),
  };
}

async function get_monthly_totals(userId, { from, to }) {
  const { rows } = await pool.query(
    `SELECT to_char(expense_date, 'YYYY-MM') AS month, SUM(amount)::float AS total
     FROM expenses WHERE user_id = $1 AND expense_date BETWEEN $2 AND $3
     GROUP BY 1 ORDER BY 1`,
    [userId, from, to]
  );
  return rows.map((r) => ({ month: r.month, total: +r.total.toFixed(2) }));
}

async function get_top_expenses(userId, { from, to, limit = 5 }) {
  const { rows } = await pool.query(
    `SELECT title, amount::float AS amount, category_name AS category, expense_date AS date
     FROM expenses WHERE user_id = $1 AND expense_date BETWEEN $2 AND $3
     ORDER BY amount DESC LIMIT $4`,
    [userId, from, to, Math.min(Math.max(Number(limit) || 5, 1), 25)]
  );
  return rows;
}

async function find_expenses(userId, { titleQuery, category, from, to, limit = 10 }) {
  const { rows } = await pool.query(
    `SELECT id, title, amount::float AS amount, category_name AS category, expense_date AS date
     FROM expenses
     WHERE user_id = $1
       AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%')
       AND ($3::text IS NULL OR category_name = $3)
       AND ($4::date IS NULL OR expense_date >= $4)
       AND ($5::date IS NULL OR expense_date <= $5)
     ORDER BY expense_date DESC, created_at DESC LIMIT $6`,
    [userId, titleQuery || null, category || null, from || null, to || null, Math.min(Math.max(Number(limit) || 10, 1), 25)]
  );
  return rows;
}

async function get_budget_status(userId) {
  const budgetRes = await pool.query('SELECT monthly FROM budgets WHERE user_id = $1', [userId]);
  const limitsRes = await pool.query(
    'SELECT category_name, monthly_limit::float AS monthly_limit FROM budget_category_limits WHERE user_id = $1',
    [userId]
  );

  const monthStart = new Date();
  monthStart.setDate(1);
  const from = monthStart.toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);

  const spendRes = await pool.query(
    `SELECT category_name, SUM(amount)::float AS total FROM expenses
     WHERE user_id = $1 AND expense_date >= $2 AND expense_date <= $3
     GROUP BY category_name`,
    [userId, from, to]
  );
  const spendByCategory = {};
  spendRes.rows.forEach((r) => { spendByCategory[r.category_name] = r.total; });

  const categories = limitsRes.rows.map((r) => {
    const spent = +(spendByCategory[r.category_name] || 0).toFixed(2);
    const limit = r.monthly_limit;
    return {
      category: r.category_name,
      limit,
      spent,
      percentUsed: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };
  });

  return {
    monthlyLimit: budgetRes.rows[0]?.monthly != null ? Number(budgetRes.rows[0].monthly) : null,
    categories,
    totalBudgeted: +categories.reduce((s, c) => s + c.limit, 0).toFixed(2),
    totalSpentThisMonth: +Object.values(spendByCategory).reduce((s, v) => s + v, 0).toFixed(2),
    period: { from, to },
  };
}

async function list_categories(userId) {
  const { rows } = await pool.query('SELECT id, name FROM categories WHERE user_id = $1 ORDER BY name', [userId]);
  return { defaults: DEFAULT_CATEGORIES, custom: rows };
}

const EXECUTORS = {
  get_spending_summary, get_monthly_totals, get_top_expenses,
  find_expenses, get_budget_status, list_categories,
};

async function executeTool(userId, name, args) {
  const fn = EXECUTORS[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);
  return fn(userId, args || {});
}

module.exports = { TOOLS, executeTool };
