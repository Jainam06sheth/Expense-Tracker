import { getData, setData } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { initialUsers } from '../data/initialUsers';
import { initialGroups } from '../data/initialGroups';
import { initialExpenses } from '../data/initialExpenses';
import { initialPayments } from '../data/initialPayments';
import { initialActivities } from '../data/initialActivities';

export const initializeSeedData = (force = false) => {
  const existingUsers = getData(STORAGE_KEYS.USERS, null);

  if (existingUsers === null || force) {
    setData(STORAGE_KEYS.USERS, initialUsers);
    setData(STORAGE_KEYS.CURRENT_USER, initialUsers[0]); // Default to Bharat
    setData(STORAGE_KEYS.GROUPS, initialGroups);
    setData(STORAGE_KEYS.EXPENSES, initialExpenses);
    setData(STORAGE_KEYS.PAYMENTS, initialPayments);
    setData(STORAGE_KEYS.ACTIVITIES, initialActivities);
    setData(STORAGE_KEYS.SETTINGS, {
      currency: 'INR',
      theme: 'light',
      notifications: true,
      emailAlerts: true,
    });
    return true;
  }

  // Ensure current user is present
  const currentUser = getData(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser && existingUsers.length > 0) {
    setData(STORAGE_KEYS.CURRENT_USER, existingUsers[0]);
  }

  return false;
};

export const resetToDemoData = () => {
  initializeSeedData(true);
};
