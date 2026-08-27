import { useState } from 'react';
import { LuGlobe } from 'react-icons/lu';
import { useCurrency } from '../../context/CurrencyContext';

export default function CurrencyCard() {
  const { currency, setCurrency, homeCurrency, setHomeCurrency, CURRENCIES, liveRates, ratesLoading } = useCurrency();
  const [selectedHomeCurrency, setSelectedHomeCurrency] = useState(homeCurrency);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSave = () => {
    setHomeCurrency(selectedHomeCurrency);
    setCurrency(selectedCurrency);
    setMsg({ text: 'Currency settings updated!', type: 'success' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const rateHint = selectedHomeCurrency === selectedCurrency
    ? 'Home and display currency match — no conversion applied.'
    : ratesLoading
      ? 'Fetching live rate…'
      : (() => {
          const homeCurr = CURRENCIES.find(c => c.code === selectedHomeCurrency);
          const dispCurr = CURRENCIES.find(c => c.code === selectedCurrency);
          const homeRate = liveRates?.[selectedHomeCurrency] ?? homeCurr?.fallbackRate ?? 1;
          const dispRate = liveRates?.[selectedCurrency]     ?? dispCurr?.fallbackRate ?? 1;
          const crossRate = dispRate / homeRate;
          const isLive = !!(liveRates?.[selectedHomeCurrency] && liveRates?.[selectedCurrency]);
          const formatted = crossRate >= 10 ? crossRate.toFixed(2) : crossRate.toFixed(4);
          return `1 ${selectedHomeCurrency} = ${formatted} ${selectedCurrency}${isLive ? ' (live)' : ' (estimated)'}`;
        })();

  return (
    <div className="settings-card settings-card-green">
      <div className="settings-card-header">
        <span className="settings-card-icon"><LuGlobe size={22} /></span>
        <div>
          <h2 className="settings-card-title">Currency</h2>
          <p className="settings-card-desc">Set your home currency and how amounts are displayed.</p>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="homeCurrencySelect">Home Currency (you enter amounts in)</label>
        <select
          id="homeCurrencySelect"
          value={selectedHomeCurrency}
          onChange={e => setSelectedHomeCurrency(e.target.value)}
          className="settings-select"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="currencySelect">Display Currency (shown across the app)</label>
        <select
          id="currencySelect"
          value={selectedCurrency}
          onChange={e => setSelectedCurrency(e.target.value)}
          className="settings-select"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
          ))}
        </select>
        <p className="settings-rate-hint">{rateHint}</p>
      </div>
      {msg.text && <p className={`settings-feedback ${msg.type}`}>{msg.text}</p>}
      <button className="btn btn-primary settings-btn" onClick={handleSave}>
        Save Currency
      </button>
    </div>
  );
}
