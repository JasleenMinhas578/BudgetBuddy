// Catch-all so every /api/* request (expenses, categories, budgets,
// settings, ai) is routed to the one Express app, instead of needing a
// separate Vercel function per route. Express itself is a valid (req, res)
// handler, so no adapter (e.g. serverless-http) is needed here.
module.exports = require('../server/index.js');
