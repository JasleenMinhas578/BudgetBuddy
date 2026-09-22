// Mirrors the 7 built-in categories from src/utils/getCategoryIcon.js.
// Duplicated here (rather than imported) because that file is a frontend
// ES module with a JSX icon map — this server only needs the names.
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Rent', 'Shopping', 'Other'];

module.exports = { DEFAULT_CATEGORIES };
