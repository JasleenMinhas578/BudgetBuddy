import { createContext, useContext, useEffect, useState } from 'react';
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { userPool, getIdToken } from '../cognito';

const AuthContext = createContext();

function fetchAttributes(cognitoUser) {
  return new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((err, attrs) => {
      if (err) return reject(err);
      const map = {};
      attrs.forEach((a) => { map[a.getName()] = a.getValue(); });
      resolve(map);
    });
  });
}

// The rest of the app expects `currentUser.uid/.email/.displayName` and an
// async `.getIdToken()` — this used to be Firebase's User object shape.
// Building a plain object with the same shape means none of those call
// sites needed to change when swapping the auth provider.
function buildCurrentUser(cognitoUser, attributes) {
  return {
    uid: cognitoUser.getUsername(),
    email: attributes.email,
    displayName: attributes.name || '',
    getIdToken: () => getIdToken(),
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      setLoading(false);
      return;
    }
    cognitoUser.getSession(async (err, session) => {
      if (err || !session?.isValid()) {
        setLoading(false);
        return;
      }
      try {
        const attrs = await fetchAttributes(cognitoUser);
        setCurrentUser(buildCurrentUser(cognitoUser, attrs));
      } catch {
        // Session valid but attributes couldn't be read — treat as logged out.
      } finally {
        setLoading(false);
      }
    });
  }, []);

  function signup(email, password, displayName) {
    return new Promise((resolve, reject) => {
      const attributeList = [new CognitoUserAttribute({ Name: 'name', Value: displayName || '' })];
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  // Cognito requires confirming the emailed code before the account can log
  // in — there's no equivalent step in the old Firebase flow, which treated
  // signup as immediately complete.
  function confirmSignup(email, code) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  function resendConfirmationCode(email) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  function login(email, password) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async () => {
          try {
            const attrs = await fetchAttributes(cognitoUser);
            setCurrentUser(buildCurrentUser(cognitoUser, attrs));
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        onFailure: reject,
      });
    });
  }

  function logout() {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) cognitoUser.signOut();
    setCurrentUser(null);
    return Promise.resolve();
  }

  // Cognito's recovery flow is a short emailed code, not a clickable link —
  // no continue-URL concept needed here, unlike Firebase's sendPasswordResetEmail.
  function resetPassword(email) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.forgotPassword({ onSuccess: resolve, onFailure: reject });
    });
  }

  function resetPasswordWithCode(email, code, newPassword) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.confirmPassword(code, newPassword, { onSuccess: resolve, onFailure: reject });
    });
  }

  function updateDisplayName(displayName) {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) return reject(new Error('Not logged in'));
      cognitoUser.getSession((err) => {
        if (err) return reject(err);
        const attributeList = [new CognitoUserAttribute({ Name: 'name', Value: displayName })];
        cognitoUser.updateAttributes(attributeList, (err) => {
          if (err) return reject(err);
          setCurrentUser((prev) => ({ ...prev, displayName }));
          resolve();
        });
      });
    });
  }

  const value = {
    currentUser,
    loading,
    signup,
    confirmSignup,
    resendConfirmationCode,
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
