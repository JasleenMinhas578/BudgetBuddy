import { useAuth } from '../../context/AuthContext';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import ConfirmDialog from '../UI/ConfirmDialog';

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Signs the user out after 30 idle minutes, with a "Still there?" dialog
// counting down the last 10. Mounted once for the whole app (see App.js).
export default function IdleLogout() {
  const { currentUser, logout, signOutForInactivity } = useAuth();
  const { secondsLeft, stayActive } = useIdleLogout(!!currentUser, signOutForInactivity);

  return (
    <ConfirmDialog
      isOpen={secondsLeft !== null}
      variant="default"
      title="Still there?"
      message={
        <p>
          You haven't used BudgetBuddy for a while. For your security, you'll be
          signed out in <strong>{formatClock(secondsLeft ?? 0)}</strong>.
        </p>
      }
      confirmLabel="Stay signed in"
      cancelLabel="Sign out"
      onConfirm={stayActive}
      onCancel={logout}
      onDismiss={stayActive}
    />
  );
}
