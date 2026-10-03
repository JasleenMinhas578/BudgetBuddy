// Mirrors the 7 built-in categories from src/utils/getCategoryIcon.js.
// Duplicated here (rather than imported) because that file is a frontend
// ES module with a JSX icon map — this server only needs the names.
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Rent', 'Shopping', 'Other'];

// Mirrors the currency codes in src/utils/currencyUtils.js (CURRENCIES),
// duplicated for the same reason — used to validate the home currency a
// user picked at signup, which arrives as untrusted user metadata.
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY', 'CHF', 'MXN', 'SGD'];

module.exports = { DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES };
