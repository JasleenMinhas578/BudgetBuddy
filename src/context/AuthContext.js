import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email, actionCodeSettings) {
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }

  function resetPasswordWithCode(oobCode, newPassword) {
    return confirmPasswordReset(auth, oobCode, newPassword);
  }

  async function updateDisplayName(displayName) {
    await updateProfile(auth.currentUser, { displayName });
    // Firebase mutates the user object in-place but doesn't trigger onAuthStateChanged,
    // so we spread it into a new reference to force a React re-render everywhere.
    setCurrentUser({ ...auth.currentUser });
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    resetPasswordWithCode,
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