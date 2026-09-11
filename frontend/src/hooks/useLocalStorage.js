import { useState, useEffect } from 'react';
import { getData, setData } from '../utils/storage';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    const existing = getData(key, null);
    if (existing !== null) {
      return existing;
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    setData(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
