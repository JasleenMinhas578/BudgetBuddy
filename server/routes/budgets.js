const express = require('express');
const pool = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Shapes the response like the old Firestore budgets/config doc
// ({ monthly, categories: { name: limit } }) so it's a direct comparison.
router.get('/', asyncHandler(async (req, res) => {
  const budgetRes = await pool.query('SELECT monthly FROM budgets WHERE user_id = $1', [req.uid]);
  const limitsRes = await pool.query(
    'SELECT category_name, monthly_limit FROM budget_category_limits WHERE user_id = $1',
    [req.uid]
  );
  const categories = {};
  limitsRes.rows.forEach((r) => { categories[r.category_name] = Number(r.monthly_limit); });
  res.json({ monthly: budgetRes.rows[0]?.monthly ?? null, categories });
}));

router.put('/monthly', asyncHandler(async (req, res) => {
  const { monthly } = req.body;
  await pool.query(
    `INSERT INTO budgets (user_id, monthly) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET monthly = EXCLUDED.monthly, updated_at = now()`,
    [req.uid, monthly ?? null]
  );
  res.json({ monthly: monthly ?? null });
}));

router.put('/categories/:categoryName', asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const { categoryName } = req.params;

  if (amount == null || amount === '') {
    await pool.query(
      'DELETE FROM budget_category_limits WHERE user_id = $1 AND category_name = $2',
      [req.uid, categoryName]
    );
    return res.json({ categoryName, amount: null });
  }

  await pool.query(
    `INSERT INTO budget_category_limits (user_id, category_name, monthly_limit) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, category_name) DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit`,
    [req.uid, categoryName, amount]
  );
  res.json({ categoryName, amount: Number(amount) });
}));

module.exports = router;
