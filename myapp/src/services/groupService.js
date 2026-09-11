import { getData, setData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { activityService } from './activityService';

export const groupService = {
  getAll: () => {
    return getData(STORAGE_KEYS.GROUPS, []);
  },

  getById: (id) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    return groups.find((g) => g.id === id) || null;
  },

  create: (data, currentUser) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    const newGroup = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `group-${crypto.randomUUID()}` : `group-${Date.now()}`,
      name: data.name,
      category: data.category || 'Other',
      description: data.description || '',
      createdBy: currentUser?.id || 'unknown',
      createdAt: new Date().toISOString(),
      members: data.members || [
        {
          id: currentUser?.id || 'user-bharat',
          name: currentUser?.name || 'Bharat',
          email: currentUser?.email || 'bharat@campussettle.com',
          role: 'admin',
          status: 'active',
        },
      ],
    };

    const updated = [newGroup, ...groups];
    setData(STORAGE_KEYS.GROUPS, updated);

    activityService.create({
      type: 'group_created',
      description: `${currentUser?.name || 'User'} created the group "${newGroup.name}"`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'User',
      groupId: newGroup.id,
      groupName: newGroup.name,
      entityId: newGroup.id,
      entityType: 'group',
    });

    return newGroup;
  },

  update: (id, updates, currentUser) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    let updatedGroup = null;

    const updated = groups.map((g) => {
      if (g.id === id) {
        updatedGroup = { ...g, ...updates };
        return updatedGroup;
      }
      return g;
    });

    setData(STORAGE_KEYS.GROUPS, updated);

    if (updatedGroup) {
      activityService.create({
        type: 'group_updated',
        description: `${currentUser?.name || 'User'} updated group "${updatedGroup.name}"`,
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'User',
        groupId: updatedGroup.id,
        groupName: updatedGroup.name,
        entityId: updatedGroup.id,
        entityType: 'group',
      });
    }

    return updatedGroup;
  },

  delete: (id, currentUser) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    const groupToDelete = groups.find((g) => g.id === id);
    if (!groupToDelete) return false;

    // Filter out group
    const remainingGroups = groups.filter((g) => g.id !== id);
    setData(STORAGE_KEYS.GROUPS, remainingGroups);

    // Cascade: delete expenses of this group
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    const remainingExpenses = expenses.filter((e) => e.groupId !== id);
    setData(STORAGE_KEYS.EXPENSES, remainingExpenses);

    // Cascade: delete payments of this group
    const payments = getData(STORAGE_KEYS.PAYMENTS, []);
    const remainingPayments = payments.filter((p) => p.groupId !== id);
    setData(STORAGE_KEYS.PAYMENTS, remainingPayments);

    activityService.create({
      type: 'group_deleted',
      description: `${currentUser?.name || 'User'} deleted group "${groupToDelete.name}"`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'User',
      groupId: groupToDelete.id,
      groupName: groupToDelete.name,
      entityId: groupToDelete.id,
      entityType: 'group',
    });

    return true;
  },
};
