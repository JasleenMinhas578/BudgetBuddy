// Signs users out after 30 minutes without using the app, with a "Still
// there?" warning for the last 10. The last-activity time lives in
// localStorage so every open tab shares it: working in one tab keeps the
// others signed in, and coming back to a stale session after a long break
// (laptop asleep, browser closed) signs out straight away.
export const IDLE_LIMIT_MS = 30 * 60 * 1000;
export const IDLE_WARNING_MS = 10 * 60 * 1000;

const ACTIVITY_KEY = 'bb:lastActivity';
const REASON_KEY = 'bb:signedOutReason';

export const INACTIVITY_MESSAGE =
  'You were signed out after 30 minutes of inactivity. Please sign in again.';

// Storage can throw (private mode, blocked site data) — fall back to memory,
// which still covers the current tab.
let memoryLastActivity = null;

export function recordActivity(at = Date.now()) {
  memoryLastActivity = at;
  try { localStorage.setItem(ACTIVITY_KEY, String(at)); } catch { /* memory only */ }
}

export function lastActivityAt() {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || null;
  } catch {
    return memoryLastActivity;
  }
}

// No record yet (e.g. first load after this feature shipped) isn't expired.
export function isIdleExpired(now = Date.now()) {
  const last = lastActivityAt();
  return last !== null && now - last >= IDLE_LIMIT_MS;
}

// Why the user was signed out, shown (then cleared) by the login page.
export function setSignedOutReason(reason) {
  try { localStorage.setItem(REASON_KEY, reason); } catch { /* not shown */ }
}

export function signedOutReason() {
  try { return localStorage.getItem(REASON_KEY); } catch { return null; }
}

export function clearSignedOutReason() {
  try { localStorage.removeItem(REASON_KEY); } catch { /* nothing to clear */ }
}
