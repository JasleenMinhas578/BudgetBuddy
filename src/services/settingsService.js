import { apiFetch } from './apiClient';

export const getUserSettings = async (userId) => {
  try {
    return await apiFetch('/api/settings');
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {};
  }
};

export const saveUserSettings = async (userId, settings) => {
  try {
    await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw new Error(`Failed to save settings: ${error.message}`);
  }
};
