import { getData, setData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

export const activityService = {
  getAll: () => {
    return getData(STORAGE_KEYS.ACTIVITIES, []);
  },

  create: (activity) => {
    const activities = getData(STORAGE_KEYS.ACTIVITIES, []);
    const newActivity = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `act-${crypto.randomUUID()}` : `act-${Date.now()}`,
      date: new Date().toISOString(),
      ...activity,
    };
    const updated = [newActivity, ...activities];
    setData(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  },
};
