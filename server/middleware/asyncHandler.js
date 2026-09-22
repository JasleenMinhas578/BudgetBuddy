// Express 4 doesn't catch rejected promises from async route handlers on its
// own — without this, a thrown error inside `async (req, res) => {...}`
// would crash the process instead of hitting the error handler in index.js.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
