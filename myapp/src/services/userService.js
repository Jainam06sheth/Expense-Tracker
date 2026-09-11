import { getData, setData, removeData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { activityService } from './activityService';

export const userService = {
  getAll: () => {
    return getData(STORAGE_KEYS.USERS, []);
  },

  getById: (id) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    return users.find((u) => u.id === id) || null;
  },

  getCurrentUser: () => {
    return getData(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user) => {
    setData(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  create: (userData) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    const newUser = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `user-${crypto.randomUUID()}` : `user-${Date.now()}`,
      avatar: (userData.name || 'U')[0].toUpperCase(),
      avatarColor: 'bg-indigo-600',
      joinedDate: new Date().toISOString().split('T')[0],
      ...userData,
    };
    setData(STORAGE_KEYS.USERS, [...users, newUser]);
    return newUser;
  },

  update: (id, updates) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    let updatedUser = null;
    const updated = users.map((u) => {
      if (u.id === id) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });
    setData(STORAGE_KEYS.USERS, updated);

    // Update current user if it's the active one
    const current = getData(STORAGE_KEYS.CURRENT_USER, null);
    if (current && current.id === id) {
      setData(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    return updatedUser;
  },

  login: (email, password) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setData(STORAGE_KEYS.CURRENT_USER, found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Invalid email or password' };
  },

  signup: (userData) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email is already registered' };
    }

    const newUser = userService.create(userData);
    setData(STORAGE_KEYS.CURRENT_USER, newUser);

    activityService.create({
      type: 'user_signup',
      description: `${newUser.name} joined CampusSettle`,
      userId: newUser.id,
      userName: newUser.name,
      entityId: newUser.id,
      entityType: 'user',
    });

    return { success: true, user: newUser };
  },

  logout: () => {
    removeData(STORAGE_KEYS.CURRENT_USER);
  },
};
