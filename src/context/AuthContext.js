import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,   
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset
} from 'firebase/auth';

/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It manages user login, signup, logout, and tracks the current user state.
 */

// Create the context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // State to track the currently logged-in user
  const [currentUser, setCurrentUser] = useState(null);
  
  // State to track if authentication is still loading
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

  function updatePassword(oobCode, newPassword) {
    return confirmPasswordReset(auth, oobCode, newPassword);
  }


  /**
   * Listen for authentication state changes
   * This effect runs once when the component mounts and sets up
   * a listener that updates the currentUser state whenever
   * the user logs in or out
   */
  useEffect(() => {
    // Set up the authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Update current user state
      setLoading(false);    // Mark loading as complete
    });

    // Cleanup function to remove the listener when component unmounts
    return unsubscribe;
  }, []);

  // Value object to be provided by the context
  const value = {
    currentUser,  // Current user object (null if not logged in)
    signup,       // Function to register new users
    login,        // Function to log in users
    logout,       // Function to log out users
    resetPassword, // Function to send password reset email
    updatePassword // Function to confirm password reset with code
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when authentication is not loading */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}