// Manual mock for amazon-cognito-identity-js, used by any test that
// exercises AuthContext (directly, or indirectly via a rendered auth
// component). Activate with `jest.mock('amazon-cognito-identity-js')` (no
// factory needed), then configure per-test behavior via the shared
// `__mockUserPoolInstance`/`__mockUserInstance` jest.fn()s, e.g.:
//   const { __mockUserInstance } = require('amazon-cognito-identity-js');
//   __mockUserInstance.authenticateUser.mockImplementation((d, { onSuccess }) => onSuccess());
//
// Real classes (not jest.fn().mockImplementation()) on purpose — Babel's ES
// `import` transform accesses named exports as live bindings on each call
// site, which breaks jest.fn()'s constructor-return-override when invoked
// via `new` (empirically verified: `new CognitoUser()` silently returned an
// empty object instead of the mocked instance). A real class's constructor
// naturally populates `this`, sidestepping that whole failure mode.
//
// IMPORTANT for consumers: the default implementations below (e.g.
// getUserAttributes/getSession auto-succeeding) do NOT reliably survive
// `jest.clearAllMocks()` once enough tests in a file have run — re-set them
// explicitly in your own `beforeEach` rather than relying on these defaults.

const mockUserPoolInstance = {
  signUp: jest.fn(),
  getCurrentUser: jest.fn(() => null),
};

const mockUserInstance = {
  authenticateUser: jest.fn(),
  signOut: jest.fn(),
  forgotPassword: jest.fn(),
  confirmPassword: jest.fn(),
  confirmRegistration: jest.fn(),
  resendConfirmationCode: jest.fn(),
  getUserAttributes: jest.fn((cb) => cb(null, [
    { getName: () => 'email', getValue: () => 'test@example.com' },
  ])),
  getSession: jest.fn((cb) => cb(null, { isValid: () => true })),
  updateAttributes: jest.fn(),
};

class CognitoUserPool {
  constructor(...args) {
    CognitoUserPool.calls.push(args);
    Object.assign(this, mockUserPoolInstance);
  }
}
CognitoUserPool.calls = [];

class CognitoUser {
  constructor(...args) {
    CognitoUser.calls.push(args);
    Object.assign(this, mockUserInstance);
    this.getUsername = () => args[0]?.Username || 'mock-uid';
  }
}
CognitoUser.calls = [];

class AuthenticationDetails {
  constructor(opts) {
    Object.assign(this, opts);
  }
}

class CognitoUserAttribute {
  constructor(opts) {
    Object.assign(this, opts);
  }
}

module.exports = {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  __mockUserPoolInstance: mockUserPoolInstance,
  __mockUserInstance: mockUserInstance,
};
