// Tests for the Firebase configuration module that bootstraps the app's Firebase services.
// - Mocks `firebase/app`, `firebase/auth`, and `firebase/firestore` to assert initialization calls without touching real services.
// - Sets up a fake `process.env` with the expected REACT_APP_* configuration and verifies `initializeApp` receives them.
// - Confirms that exported `auth` and `db` instances are created via `getAuth` and `getFirestore` using the initialized app.
const originalEnv = { ...process.env };

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ app: 'mock-app' }))
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => 'auth-instance')
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => 'db-instance')
}));

describe('firebaseConfig', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      REACT_APP_FIREBASE_API_KEY: 'api-key',
      REACT_APP_FIREBASE_AUTH_DOMAIN: 'auth-domain',
      REACT_APP_FIREBASE_PROJECT_ID: 'project-id',
      REACT_APP_FIREBASE_STORAGE_BUCKET: 'storage-bucket',
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: 'sender',
      REACT_APP_FIREBASE_APP_ID: 'app-id'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('initializes Firebase services with env variables', () => {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');

    const configModule = require('../firebaseConfig');

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: 'api-key',
      authDomain: 'auth-domain',
      projectId: 'project-id',
      storageBucket: 'storage-bucket',
      messagingSenderId: 'sender',
      appId: 'app-id'
    });

    expect(getAuth).toHaveBeenCalledWith({ app: 'mock-app' });
    expect(getFirestore).toHaveBeenCalledWith({ app: 'mock-app' });
    expect(configModule.auth).toBe('auth-instance');
    expect(configModule.db).toBe('db-instance');
  });
});

