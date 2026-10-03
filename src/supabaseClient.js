import { createClient } from '@supabase/supabase-js';
import { recordActivity } from './utils/idleSession';

// Email confirmation / password-reset links land back on the app with the
// result in the URL fragment. A bad or expired link carries an error there
// instead of a session; capture it before supabase-js processes the URL so
// the landing page can explain what happened.
const authLinkParams = new URLSearchParams(window.location.hash.slice(1));
export const authLinkError = authLinkParams.get('error_description');

// A working link is a fresh sign-in — start the idle clock now, so an old
// last-activity time left in this browser doesn't sign them straight out.
if (authLinkParams.has('access_token')) recordActivity();

// The anon/publishable key is safe to ship to the browser — it only grants
// what Supabase Auth allows anonymously (sign up, sign in, reset password).
// App data never goes through Supabase's auto-generated Data API: every
// table has RLS enabled with no policies (see schema.sql), and all reads and
// writes go through the Express API instead.
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Returns a valid access token for whoever's currently signed in — supabase-js
// refreshes it via the stored refresh token if the cached one has expired — or
// null if nobody's signed in. Used by apiClient.js, which isn't a component
// and so can't go through AuthContext/useAuth().
export async function getIdToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
