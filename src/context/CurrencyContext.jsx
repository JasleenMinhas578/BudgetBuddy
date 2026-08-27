import { createContext, useContext, useState, useEffect } from 'react';
import { formatAmount as utilFormatAmount, CURRENCIES } from '../utils/currencyUtils';

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
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(data => {
        if (data?.rates) setLiveRates(data.rates);
      })
      .catch(err => console.warn('[CurrencyProvider] Live rate fetch failed:', err))
      .finally(() => setRatesLoading(false));
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

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, homeCurrency, setHomeCurrency, formatAmount, currencySymbol, CURRENCIES, liveRates, ratesLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
