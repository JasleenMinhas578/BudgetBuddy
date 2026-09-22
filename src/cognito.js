import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
});

// Returns a valid ID token for whoever's currently signed in, refreshing it
// via the stored refresh token if the cached one has expired — or null if
// nobody's signed in / the session can't be refreshed. Used by apiClient.js,
// which isn't a component and so can't go through AuthContext/useAuth().
export function getIdToken() {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return resolve(null);
    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken());
    });
  });
}
