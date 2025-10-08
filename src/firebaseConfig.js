import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * This file initializes Firebase services for the application.
 * It sets up:
 * - Firebase app instance
 * - Authentication service
 * - Firestore database service
 * 
 * Security Note: Environment variables are used to keep sensitive
 * configuration data out of the source code.
 */

// Firebase configuration object
// All values are loaded from environment variables for security
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize the Firebase app with the configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication service
// This provides user authentication functionality (login, signup, etc.)
export const auth = getAuth(app);

// Initialize Firestore database service
// This provides real-time database functionality for storing user data
export const db = getFirestore(app);

/**
 * Environment Variables Required:
 * 
 * Create a .env.local file in your project root with:
 * 
 * REACT_APP_FIREBASE_API_KEY=your_api_key
 * REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
 * REACT_APP_FIREBASE_PROJECT_ID=your_project_id
 * REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
 * REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 * REACT_APP_FIREBASE_APP_ID=your_app_id
 * 
 * You can find these values in your Firebase Console:
 * 1. Go to Project Settings
 * 2. Scroll down to "Your apps"
 * 3. Select your web app or create a new one
 * 4. Copy the configuration values
 */