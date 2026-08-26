import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const getUserSettings = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : {};
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {};
  }
};

export const saveUserSettings = async (userId, settings) => {
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw new Error(`Failed to save settings: ${error.message}`);
  }
};
