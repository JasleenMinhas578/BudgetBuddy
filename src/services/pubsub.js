// Firestore's onSnapshot gave every service file live push updates for free.
// A REST API doesn't, so this replaces it with a tiny in-memory pub/sub:
// any mutation calls `notify(userId)`, which refetches and pushes the new
// data to every active subscriber for that user — same call sites in hooks
// (`subscribe(userId, callback)` returning an unsubscribe function), no
// polling. Only syncs within this browser tab, not across tabs/devices —
// the one real behavior change from moving off Firestore.
export function createSubscribable(fetchData) {
  const listeners = new Map(); // userId -> Set<callback>

  async function notify(userId) {
    const subs = listeners.get(userId);
    if (!subs || subs.size === 0) return;
    try {
      const data = await fetchData(userId);
      subs.forEach((cb) => cb(data));
    } catch (error) {
      subs.forEach((cb) => cb(undefined, error));
    }
  }

  function subscribe(userId, callback) {
    if (!listeners.has(userId)) listeners.set(userId, new Set());
    listeners.get(userId).add(callback);
    notify(userId);
    return () => listeners.get(userId)?.delete(callback);
  }

  return { subscribe, notify };
}
