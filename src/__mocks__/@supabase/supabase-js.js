// Manual mock for @supabase/supabase-js, used by any test that exercises
// AuthContext (directly, or indirectly via a rendered auth component).
// Activate with `jest.mock('@supabase/supabase-js')` (no factory needed).
//
// Session state is plain module state, not jest.fn() defaults — CRA runs
// Jest with `resetMocks: true`, which wipes every jest.fn()'s implementation
// before each test. So:
//   - set who's signed in with `__setMockSession(session | null)`, in your
//     own `beforeEach` (call it even for "logged out", to reset leftovers);
//     `undefined` means the initial session check is still pending;
//   - the auth actions (`signInWithPassword`, `signUp`, ...) are jest.fn()s
//     you configure per test, e.g.:
//       const { __mockAuth } = require('@supabase/supabase-js');
//       __mockAuth.signInWithPassword.mockResolvedValue({ data: { user }, error: null });

let currentSession = null;
const listeners = new Set();

const mockAuth = {
  // Real functions, not jest.fn(), so they survive resetMocks.
  getSession: async () => ({ data: { session: currentSession ?? null }, error: null }),
  onAuthStateChange: (callback) => {
    listeners.add(callback);
    if (currentSession !== undefined) callback('INITIAL_SESSION', currentSession);
    return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
  },

  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  resend: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
  refreshSession: jest.fn(),
  getClaims: jest.fn(),
};

// Builds a session object shaped like Supabase's, for a signed-in user.
function mockSession({ id = 'mock-uid', email = 'test@example.com', name = '' } = {}) {
  return {
    access_token: 'mock-access-token',
    user: { id, email, user_metadata: { name } },
  };
}

function __setMockSession(session) {
  currentSession = session;
  if (session === undefined) return;
  listeners.forEach((cb) => cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
}

function createClient() {
  return { auth: mockAuth };
}

module.exports = {
  createClient,
  __mockAuth: mockAuth,
  __setMockSession,
  __mockSession: mockSession,
};
