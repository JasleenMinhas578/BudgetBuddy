const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const requireAuth = require('./middleware/auth');
const expensesRouter = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const budgetsRouter = require('./routes/budgets');
const settingsRouter = require('./routes/settings');
const aiRouter = require('./routes/ai');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Unauthenticated — for checking the server + DB are up.
app.get('/health', async (req, res) => {
  const pool = require('./db');
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/expenses', requireAuth, expensesRouter);
app.use('/api/categories', requireAuth, categoriesRouter);
app.use('/api/budgets', requireAuth, budgetsRouter);
app.use('/api/settings', requireAuth, settingsRouter);
app.use('/api/ai', requireAuth, aiRouter);

// Catches anything thrown/rejected inside a route wrapped in asyncHandler.
// Routes that intentionally set err.status (rate limits, missing AI config)
// get their real message back; anything unexpected stays a generic 500 so
// raw DB/driver errors never leak to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
});

// Only bind to a port for local dev (`node server/index.js`). When Vercel's
// serverless function imports this file, it calls the exported Express app
// directly as a request handler instead — app.listen() would be a no-op
// there and just waste a cold-start on a port that's never used.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

module.exports = app;
