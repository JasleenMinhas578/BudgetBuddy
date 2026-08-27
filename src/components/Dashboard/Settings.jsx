import DisplayNameCard from '../Settings/DisplayNameCard';
import DateRangeCard from '../Settings/DateRangeCard';
import PasswordCard from '../Settings/PasswordCard';
import CurrencyCard from '../Settings/CurrencyCard';
import '../../styles/main.css';

export default function Settings() {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Account Settings</h1>
        <p className="settings-subtitle">Manage your profile and security preferences.</p>
      </div>
      <div className="settings-cards-grid">
        <DisplayNameCard />
        <DateRangeCard />
        <PasswordCard />
        <CurrencyCard />
      </div>
    </div>
  );
}
