const express = require('express');
const pool = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name FROM categories WHERE user_id = $1 ORDER BY name',
    [req.uid]
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing category name' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id, name',
      [req.uid, name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Category already exists' });
    throw err;
  }
}));

// Renames the category itself AND cascades the new name onto every expense
// that referenced the old one — this was two Firestore batch-write helpers
// (`renameCategoryExpenses` + `updateCategory`) collapsed into one transaction.
router.put('/:id', asyncHandler(async (req, res) => {
  const { name: newName } = req.body;
  if (!newName) return res.status(400).json({ error: 'Missing category name' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      'SELECT name FROM categories WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.uid]
    );
    if (!existing.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }
    const oldName = existing.rows[0].name;

    const { rows } = await client.query(
      'UPDATE categories SET name = $1, updated_at = now() WHERE id = $2 AND user_id = $3 RETURNING id, name',
      [newName, req.params.id, req.uid]
    );
    await client.query(
      'UPDATE expenses SET category_name = $1, updated_at = now() WHERE user_id = $2 AND category_name = $3',
      [newName, req.uid, oldName]
    );
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

// Reassigns every expense in a category to "Other" without touching the
// category itself — used when hiding a default category (defaults like
// "Food"/"Rent" were never rows in the `categories` table, so there's
// nothing to delete, just expenses to relabel).
router.post('/reassign', asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) return res.status(400).json({ error: 'Missing categoryName' });
  await pool.query(
    `UPDATE expenses SET category_name = 'Other', updated_at = now()
     WHERE user_id = $1 AND category_name = $2`,
    [req.uid, categoryName]
  );
  res.json({ ok: true });
}));

// Deletes a custom category and reassigns its expenses to "Other" in one
// transaction, rather than deleting them.
router.delete('/:id', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING name',
      [req.params.id, req.uid]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }
    await client.query(
      `UPDATE expenses SET category_name = 'Other', updated_at = now()
       WHERE user_id = $1 AND category_name = $2`,
      [req.uid, rows[0].name]
    );
    await client.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

module.exports = router;
