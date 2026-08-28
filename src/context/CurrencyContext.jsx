import { createContext, useContext, useState, useEffect } from 'react';
import { formatAmount as utilFormatAmount, CURRENCIES } from '../utils/currencyUtils';

const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest/USD';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try { return localStorage.getItem('currency') || 'USD'; } catch { return 'USD'; }
  });
  const [homeCurrency, setHomeCurrencyState] = useState(() => {
    try { return localStorage.getItem('homeCurrency') || 'USD'; } catch { return 'USD'; }
  });
  const [liveRates, setLiveRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    fetch(EXCHANGE_RATE_URL, { signal: controller.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(data => {
        if (data?.rates) setLiveRates(data.rates);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.warn('[CurrencyProvider] Live rate fetch failed:', err);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setRatesLoading(false);
      });
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const setCurrency = (code) => {
    try { localStorage.setItem('currency', code); } catch {}
    setCurrencyState(code);
  };

  const setHomeCurrency = (code) => {
    try { localStorage.setItem('homeCurrency', code); } catch {}
    setHomeCurrencyState(code);
  };

  const formatAmount = (amount) => utilFormatAmount(amount, currency, liveRates, homeCurrency);
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
  const homeSymbol = CURRENCIES.find(c => c.code === homeCurrency)?.symbol ?? '$';

  // Rate of the display currency against the USD base
  const displayRate = liveRates?.[currency] ?? (CURRENCIES.find(c => c.code === currency)?.fallbackRate ?? 1);
  // Rate of the home (storage) currency against the USD base
  const homeRate = liveRates?.[homeCurrency] ?? (CURRENCIES.find(c => c.code === homeCurrency)?.fallbackRate ?? 1);

  // Convert a home-currency amount to display currency (for showing stored values in inputs)
  const toDisplayAmount = (homeAmt) => {
    if (homeAmt == null || isNaN(homeAmt)) return homeAmt;
    return homeAmt * (displayRate / homeRate);
  };
  // Convert a display-currency amount to home currency (for storing user-typed values)
  const toHomeAmount = (displayAmt) => {
    if (displayAmt == null || isNaN(displayAmt)) return displayAmt;
    return displayAmt * (homeRate / displayRate);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, homeCurrency, setHomeCurrency, formatAmount, currencySymbol, homeSymbol, CURRENCIES, liveRates, ratesLoading, toDisplayAmount, toHomeAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
