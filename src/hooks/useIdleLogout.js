import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IDLE_LIMIT_MS, IDLE_WARNING_MS, isIdleExpired, lastActivityAt, recordActivity,
} from '../utils/idleSession';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'wheel', 'scroll'];
// Writing to localStorage on every mousemove is wasteful; a few seconds of
// slack on a 30-minute timer doesn't matter.
const RECORD_THROTTLE_MS = 5000;

// Watches for activity while `enabled` and calls `onTimeout` once the user
// has been idle for IDLE_LIMIT_MS. For the last IDLE_WARNING_MS it returns
// the seconds left (otherwise null) so the caller can show a warning; while
// that warning is up, only `stayActive()` (or activity in another tab) counts
// — otherwise just moving the mouse towards "Sign out" would dismiss it.
export function useIdleLogout(enabled, onTimeout) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const warningRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!enabled) {
      warningRef.current = false;
      setSecondsLeft(null);
      return undefined;
    }

    if (lastActivityAt() === null) recordActivity();
    let lastRecorded = 0;
    let timedOut = false;

    const onActivity = () => {
      if (warningRef.current) return;
      const now = Date.now();
      if (now - lastRecorded < RECORD_THROTTLE_MS) return;
      lastRecorded = now;
      recordActivity(now);
    };

    const check = () => {
      if (timedOut) return;
      if (isIdleExpired()) {
        timedOut = true;
        onTimeoutRef.current();
        return;
      }
      const remaining = IDLE_LIMIT_MS - (Date.now() - lastActivityAt());
      const warn = remaining <= IDLE_WARNING_MS;
      warningRef.current = warn;
      setSecondsLeft(warn ? Math.ceil(remaining / 1000) : null);
    };

    ACTIVITY_EVENTS.forEach((type) =>
      window.addEventListener(type, onActivity, { capture: true, passive: true }));
    // Timers are throttled in background tabs and stop while the computer
    // sleeps, so check again the moment the tab is visible.
    document.addEventListener('visibilitychange', check);
    check();
    const id = setInterval(check, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((type) =>
        window.removeEventListener(type, onActivity, { capture: true }));
      document.removeEventListener('visibilitychange', check);
      clearInterval(id);
    };
  }, [enabled]);

  const stayActive = useCallback(() => {
    recordActivity();
    warningRef.current = false;
    setSecondsLeft(null);
  }, []);

  return { secondsLeft, stayActive };
}
