import { useCallback, useEffect, useState } from 'react';

// A seconds countdown for "Resend in 42s" buttons. Counts against a deadline
// rather than decrementing once per tick, so it stays accurate when the
// browser slows timers down in a background tab.
export function useCountdown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const remaining = until - now;
    if (remaining <= 0) return undefined;
    const id = setTimeout(() => setNow(Date.now()), Math.min(1000, remaining));
    return () => clearTimeout(id);
  }, [until, now]);

  const start = useCallback((seconds) => {
    const t = Date.now();
    setNow(t);
    setUntil(t + seconds * 1000);
  }, []);

  return [Math.max(0, Math.ceil((until - now) / 1000)), start];
}
