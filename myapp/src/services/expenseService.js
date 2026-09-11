import { getData, setData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { activityService } from './activityService';

export const expenseService = {
  getAll: () => {
    return getData(STORAGE_KEYS.EXPENSES, []);
  },

  getById: (id) => {
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    return expenses.find((e) => e.id === id) || null;
  },

  getByGroupId: (groupId) => {
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    return expenses.filter((e) => e.groupId === groupId);
  },

  create: (data, currentUser) => {
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    const newExpense = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `expense-${crypto.randomUUID()}` : `expense-${Date.now()}`,
      name: data.name,
      groupId: data.groupId,
      category: data.category || 'Other',
      amount: Number(data.amount),
      paidBy: data.paidBy,
      date: data.date || new Date().toISOString(),
      notes: data.notes || '',
      splitMethod: data.splitMethod || 'equal',
      items: data.items || [],
      participants: data.participants || [],
      splits: data.splits || {},
      status: 'unsettled',
      createdAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...expenses];
    setData(STORAGE_KEYS.EXPENSES, updated);

    // Get group name
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    const group = groups.find((g) => g.id === data.groupId);

    activityService.create({
      type: 'expense_created',
      description: `${currentUser?.name || 'User'} added "${newExpense.name}" in ${group?.name || 'Group'} (₹${newExpense.amount})`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'User',
      groupId: data.groupId,
      groupName: group?.name || 'Group',
      entityId: newExpense.id,
      entityType: 'expense',
    });

    return newExpense;
  },

  update: (id, updates, currentUser) => {
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    let updatedExpense = null;

    const updated = expenses.map((e) => {
      if (e.id === id) {
        updatedExpense = {
          ...e,
          ...updates,
          amount: updates.amount !== undefined ? Number(updates.amount) : e.amount,
          updatedAt: new Date().toISOString(),
        };
        return updatedExpense;
      }
      return e;
    });

    setData(STORAGE_KEYS.EXPENSES, updated);

    if (updatedExpense) {
      const groups = getData(STORAGE_KEYS.GROUPS, []);
      const group = groups.find((g) => g.id === updatedExpense.groupId);

      activityService.create({
        type: 'expense_updated',
        description: `${currentUser?.name || 'User'} updated expense "${updatedExpense.name}"`,
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'User',
        groupId: updatedExpense.groupId,
        groupName: group?.name || 'Group',
        entityId: updatedExpense.id,
        entityType: 'expense',
      });
    }

    return updatedExpense;
  },

  delete: (id, currentUser) => {
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    const toDelete = expenses.find((e) => e.id === id);
    if (!toDelete) return false;

    const updated = expenses.filter((e) => e.id !== id);
    setData(STORAGE_KEYS.EXPENSES, updated);

    const groups = getData(STORAGE_KEYS.GROUPS, []);
    const group = groups.find((g) => g.id === toDelete.groupId);

    activityService.create({
      type: 'expense_deleted',
      description: `${currentUser?.name || 'User'} deleted expense "${toDelete.name}"`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'User',
      groupId: toDelete.groupId,
      groupName: group?.name || 'Group',
      entityId: toDelete.id,
      entityType: 'expense',
    });

    return true;
  },
};
