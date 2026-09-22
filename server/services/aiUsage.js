const pool = require('../db');

const DAILY_LIMIT = 50;

// Atomic upsert-and-increment — avoids a separate check-then-write race
// between two requests from the same user landing at once.
async function checkAndIncrement(userId) {
  const { rows } = await pool.query(
    `INSERT INTO ai_usage (user_id, usage_date, request_count)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (user_id, usage_date)
     DO UPDATE SET request_count = ai_usage.request_count + 1
     RETURNING request_count`,
    [userId]
  );
  if (rows[0].request_count > DAILY_LIMIT) {
    const err = new Error(`Daily AI limit of ${DAILY_LIMIT} requests reached. Resets at midnight.`);
    err.status = 429;
    throw err;
  }
}

module.exports = { checkAndIncrement, DAILY_LIMIT };
