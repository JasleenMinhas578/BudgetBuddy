import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestFirebase from '../testFirebase';

jest.mock('../firebaseConfig', () => ({
  auth: { name: 'mock-auth' },
  db: { name: 'mock-db' }
}));

jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'timestamp')
}));

const {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} = require('firebase/auth');

const { doc, setDoc, getDoc } = require('firebase/firestore');

describe('TestFirebase harness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signInAnonymously.mockResolvedValue({ user: { uid: 'anon-user' } });
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'email-user' } });
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'existing-user' } });
    signOut.mockResolvedValue();
    doc.mockReturnValue('doc-ref');
    setDoc.mockResolvedValue();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ hello: 'world' })
    });
  });

  it('completes anonymous auth flow and renders fetched data', async () => {
    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Anonymous + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Success/)).toBeInTheDocument();
    });
    
    expect(signInAnonymously).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalledWith('doc-ref', expect.any(Object), { merge: true });
    expect(getDoc).toHaveBeenCalledWith('doc-ref');
    expect(screen.getByText(/"hello": "world"/)).toBeInTheDocument();
  });

  it('surfaces errors from the anonymous flow', async () => {
    signInAnonymously.mockRejectedValueOnce({ code: 'auth/failure' });

    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Anonymous + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Error: auth\/failure/)).toBeInTheDocument();
    });
  });

  it('falls back to sign in when email already exists', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });

    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Email/Password + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Success/)).toBeInTheDocument();
    });
    
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalled();
  });

  it('handles unexpected errors in email/password flow', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce(new Error('boom'));

    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Email/Password + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Error: boom/)).toBeInTheDocument();
    });
  });

  it('handles missing Firestore document in anonymous flow', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => ({})
    });

    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Anonymous + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Success/)).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/"hello":/)).toBeNull();
  });

  it('handles missing Firestore document in email/password flow', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => ({})
    });

    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Email/Password + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Success/)).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/from email user/)).toBeNull();
  });

  it('handles anonymous errors without firebase codes', async () => {
    signInAnonymously.mockRejectedValueOnce(new Error('anon boom'));

    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Test Anonymous + Firestore'));

    await waitFor(() => {
      expect(screen.getByText(/Error: anon boom/)).toBeInTheDocument();
    });
  });

  it('signs out and clears state', async () => {
    render(<TestFirebase />);

    fireEvent.click(screen.getByText('Sign out'));

    await waitFor(() => {
      expect(screen.getByText('Status: Signed out')).toBeInTheDocument();
    });
    
    expect(signOut).toHaveBeenCalled();
    expect(screen.queryByText(/UID:/)).toBeNull();
  });
});

