/**
 * Centralized Storage Utility for CampusSettle
 * Wraps localStorage with safe JSON parsing and error handling.
 */

export const getData = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === '') {
      return fallback;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return fallback;
  }
};

export const setData = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

export const clearData = (keysToClear = []) => {
  try {
    if (keysToClear && keysToClear.length > 0) {
      keysToClear.forEach((key) => localStorage.removeItem(key));
    } else {
      localStorage.clear();
    }
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};
