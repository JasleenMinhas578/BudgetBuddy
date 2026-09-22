const express = require('express');
const pool = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, title, amount, category_name AS category, expense_date AS date, notes, created_at, updated_at
     FROM expenses WHERE user_id = $1
     ORDER BY expense_date DESC, created_at DESC`,
    [req.uid]
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, amount, category, date, notes } = req.body;
  if (!title || !category || !date || amount == null || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Missing or invalid expense data' });
  }
  const { rows } = await pool.query(
    `INSERT INTO expenses (user_id, title, amount, category_name, expense_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, amount, category_name AS category, expense_date AS date, notes`,
    [req.uid, title, amount, category, date, notes || null]
  );
  res.status(201).json(rows[0]);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { title, amount, category, date, notes } = req.body;
  const { rows } = await pool.query(
    `UPDATE expenses SET
       title = COALESCE($1, title),
       amount = COALESCE($2, amount),
       category_name = COALESCE($3, category_name),
       expense_date = COALESCE($4, expense_date),
       notes = COALESCE($5, notes),
       updated_at = now()
     WHERE id = $6 AND user_id = $7
     RETURNING id, title, amount, category_name AS category, expense_date AS date, notes`,
    [title, amount, category, date, notes, req.params.id, req.uid]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
    [req.params.id, req.uid]
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}));

module.exports = router;
