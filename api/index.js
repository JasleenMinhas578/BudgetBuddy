// Every /api/* request (expenses, categories, budgets, settings, ai) is
// routed here via the rewrite in vercel.json, rather than relying on
// filename-based catch-all routing (`[...path].js`) — that convention
// doesn't reliably match multi-segment paths for non-Next.js projects.
// Express itself is a valid (req, res) handler, so no adapter (e.g.
// serverless-http) is needed here.
module.exports = require('../server/index.js');
