export const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar',         fallbackRate: 1,      decimals: 2 },
  { code: 'EUR', symbol: '€',   name: 'Euro',              fallbackRate: 0.92,   decimals: 2 },
  { code: 'GBP', symbol: '£',   name: 'British Pound',     fallbackRate: 0.78,   decimals: 2 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar',   fallbackRate: 1.39,   decimals: 2 },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar', fallbackRate: 1.57,   decimals: 2 },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',      fallbackRate: 95.5,   decimals: 0 },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',      fallbackRate: 148.0,  decimals: 0 },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',       fallbackRate: 0.90,   decimals: 2 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso',      fallbackRate: 19.5,   decimals: 2 },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',  fallbackRate: 1.34,   decimals: 2 },
];

// liveRates: optional map of { EUR: 0.91, GBP: 0.79, ... } from the API (USD base).
// homeCurrencyCode: the currency expenses are entered in (default USD).
// Converts: amount (home) → USD → displayCurrency via rate ratio.
export function formatAmount(amount, displayCurrencyCode, liveRates, homeCurrencyCode = 'USD') {
  const display = CURRENCIES.find(c => c.code === displayCurrencyCode) || CURRENCIES[0];
  const home   = CURRENCIES.find(c => c.code === homeCurrencyCode)    || CURRENCIES[0];

  const displayRate = liveRates?.[display.code] ?? display.fallbackRate;
  const homeRate    = liveRates?.[home.code]    ?? home.fallbackRate;

  const converted = (amount ?? 0) * (displayRate / homeRate);
  return `${display.symbol}${converted.toFixed(display.decimals)}`;
}
