import { getData } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const getCurrencyCode = () => {
  const settings = getData(STORAGE_KEYS.SETTINGS, { currency: 'INR' });
  return settings?.currency || 'INR';
};

export const getCurrencySymbol = (code = null) => {
  const currentCode = code || getCurrencyCode();
  return CURRENCY_SYMBOLS[currentCode] || '₹';
};

export const formatCurrency = (amount, code = null) => {
  const numericAmount = Number(amount) || 0;
  const currency = code || getCurrencyCode();
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  return `${symbol}${formattedNumber}`;
};
