import { getIdToken } from '../cognito';

// In production the API is served from the same Vercel deployment as the
// frontend (see /api/[...path].js), so relative paths ('') are correct —
// falling back to localhost:4000 there would point every visitor's browser
// at their own machine. Local dev still needs the explicit server port.
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');

export async function apiFetch(path, options = {}) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}
