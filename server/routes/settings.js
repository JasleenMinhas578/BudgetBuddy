const express = require('express');
const pool = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Combines the old settings/preferences and preferences/general Firestore
// docs into one response, since the frontend always read them together.
router.get('/', asyncHandler(async (req, res) => {
  const settingsRes = await pool.query(
    'SELECT currency, home_currency, default_date_filter FROM settings WHERE user_id = $1',
    [req.uid]
  );
  const prefsRes = await pool.query(
    'SELECT hidden_default_categories FROM preferences WHERE user_id = $1',
    [req.uid]
  );
  res.json({
    currency: settingsRes.rows[0]?.currency ?? 'USD',
    homeCurrency: settingsRes.rows[0]?.home_currency ?? 'USD',
    defaultDateFilter: settingsRes.rows[0]?.default_date_filter ?? null,
    hiddenDefaultCategories: prefsRes.rows[0]?.hidden_default_categories ?? [],
  });
}));

// Partial-update semantics (like Firestore's `merge: true`) — callers send
// only the fields they're changing (CurrencyCard sends currency fields,
// DateRangeCard sends defaultDateFilter), so omitted fields must be left
// alone, not reset to a default.
router.put('/', asyncHandler(async (req, res) => {
  const currency = req.body.currency ?? null;
  const homeCurrency = req.body.homeCurrency ?? null;
  const defaultDateFilter = req.body.defaultDateFilter ?? null;
  await pool.query(
    `INSERT INTO settings (user_id, currency, home_currency, default_date_filter)
     VALUES ($1, COALESCE($2, 'USD'), COALESCE($3, 'USD'), $4)
     ON CONFLICT (user_id) DO UPDATE SET
       currency = COALESCE($2, settings.currency),
       home_currency = COALESCE($3, settings.home_currency),
       default_date_filter = COALESCE($4, settings.default_date_filter)`,
    [req.uid, currency, homeCurrency, defaultDateFilter]
  );
  res.json({ ok: true });
}));

// Mirrors Firestore's arrayUnion behavior: adds the category name to the
// hidden list only if it isn't already there, without a separate read first.
router.post('/hide-category', asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) return res.status(400).json({ error: 'Missing categoryName' });
  await pool.query(
    `INSERT INTO preferences (user_id, hidden_default_categories) VALUES ($1, ARRAY[$2]::TEXT[])
     ON CONFLICT (user_id) DO UPDATE SET hidden_default_categories = array_append(preferences.hidden_default_categories, $2)
     WHERE NOT ($2 = ANY(preferences.hidden_default_categories))`,
    [req.uid, categoryName]
  );
  res.json({ ok: true });
}));

module.exports = router;
