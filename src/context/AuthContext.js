import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getIdToken } from '../supabaseClient';

const AuthContext = createContext();

// The rest of the app expects `currentUser.uid/.email/.displayName` and an
// async `.getIdToken()` — this used to be Firebase's User object shape, then
// Cognito's. Building a plain object with the same shape means none of those
// call sites needed to change when swapping the auth provider again.
function buildCurrentUser(user) {
  return {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.name || '',
    getIdToken: () => getIdToken(),
  };
}

// Supabase re-emits auth events on every token refresh and whenever the tab
// regains focus. A dozen hooks refetch when `currentUser` changes identity,
// so keep the previous object unless something they'd see actually changed.
function sameUser(a, b) {
  return a && b && a.uid === b.uid && a.email === b.email && a.displayName === b.displayName;
}

// Where the emailed confirmation link sends the user back to. Supabase only
// redirects to URLs on the project's allow list (localhost:3000 + the Vercel
// domain); anything else falls back to the project's Site URL.
function confirmRedirect() {
  return `${window.location.origin}/confirm-signup`;
}

// Supabase returns `{ data, error }` instead of throwing — rethrowing keeps
// every caller's existing try/catch + `error.code` switch working.
function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function applyUser(user) {
    const next = user ? buildCurrentUser(user) : null;
    setCurrentUser((prev) => (sameUser(prev, next) ? prev : next));
  }

  useEffect(() => {
    // Fires once immediately with the restored session (INITIAL_SESSION),
    // then on every sign-in/out/refresh after that.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // homeCurrency rides along in the user's metadata, and the API turns it
  // into their settings row on their first authenticated request (see
  // server/middleware/auth.js) — there's no session to save it with yet
  // while the account is still waiting on email confirmation.
  async function signup(email, password, displayName, homeCurrency) {
    const data = unwrap(await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: displayName || '', home_currency: homeCurrency },
        emailRedirectTo: confirmRedirect(),
      },
    }));
    // With email confirmation on, Supabase doesn't error for an address that's
    // already registered (so attackers can't probe which emails have
    // accounts) — it returns a user with no identities instead.
    if (data.user?.identities?.length === 0) {
      const err = new Error('User already registered');
      err.code = 'user_already_exists';
      throw err;
    }
    // No session back means the project requires clicking the emailed
    // confirmation link first; with confirmation off the user is signed in.
    if (data.session) applyUser(data.user);
    return { needsConfirmation: !data.session };
  }

  async function resendConfirmation(email) {
    unwrap(await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: confirmRedirect() },
    }));
  }

  async function login(email, password) {
    const data = unwrap(await supabase.auth.signInWithPassword({ email, password }));
    applyUser(data.user);
  }

  async function logout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }

  // Emails a link that signs the user in on /reset-password, where they
  // choose a new password (see updatePassword).
  async function resetPassword(email) {
    unwrap(await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }));
  }

  // Sets a new password on the current (reset-link) session, then signs out
  // so they log in fresh with it (the page tells them to).
  async function updatePassword(newPassword) {
    unwrap(await supabase.auth.updateUser({ password: newPassword }));
    await logout();
  }

  async function updateDisplayName(displayName) {
    unwrap(await supabase.auth.updateUser({ data: { name: displayName } }));
    // The API copies display_name from the access token's claims on every
    // request — refresh now so it doesn't keep sending the old name until the
    // token's next scheduled refresh.
    unwrap(await supabase.auth.refreshSession());
    setCurrentUser((prev) => ({ ...prev, displayName }));
  }

  const value = {
    currentUser,
    loading,
    signup,
    resendConfirmation,
    login,
    logout,
    resetPassword,
    updatePassword,
    updateDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
