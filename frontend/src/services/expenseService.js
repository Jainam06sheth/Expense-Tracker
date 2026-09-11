import { activityService } from './activityService';
import { api } from './api';

export const expenseService = {
  getAll: async () => {
    // Note: Backend does not have a global expenses endpoint.
    // We might need to fetch from all groups the user is in, but that's heavy.
    // Alternatively, we can remove this method if it's not used, or return an empty array.
    // Let's check if it's used in the frontend. If not used, we can return [].
    // For now, we return an empty array and log a warning.
    console.warn('ExpenseService.getAll() is called but there is no backend endpoint for global expenses. Returning empty array.');
    return [];
  },

  getById: async (id) => {
    try {
      const response = await api.request(`/expenses/${id}`);
      // Backend returns the expense object, we need to ensure it has an `id` field (MongoDB uses _id)
      const expense = response.data;
      if (expense) {
        // Ensure the expense has an `id` field for frontend compatibility
        expense.id = expense._id;
      }
      return expense;
    } catch (error) {
      console.error(`Error fetching expense with id ${id}:`, error);
      return null;
    }
  },

  getByGroupId: async (groupId) => {
    try {
      const response = await api.request(`/expenses/group/${groupId}`);
      const expenses = response.data || [];
      // Ensure each expense has an `id` field
      return expenses.map(exp => {
        exp.id = exp._id;
        return exp;
      });
    } catch (error) {
      console.error(`Error fetching expenses for group ${groupId}:`, error);
      return [];
    }
  },

  create: async (data, currentUser) => {
    try {
      // Prepare the payload for the backend
      // The backend expects: name, groupId, category, amount, paidBy, date, notes, splitMethod, items, participants, splits
      // Note: The backend's expense controller may expect different field names, we assume it matches the frontend's current localStorage structure.
      const payload = {
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
      };

      const response = await api.request('/expenses', {
        method: 'POST',
        body: payload,
      });

      const expense = response.data;
      if (expense) {
        expense.id = expense._id;
      }

      // We do not create activity here because the backend should do it when the expense is created.
      // However, if the backend does not create an activity for expense creation, we might need to.
      // Let's assume the backend does it (as per the group creation example).

      return expense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  update: async (id, updates, currentUser) => {
    try {
      const payload = {
        ...updates,
        amount: updates.amount !== undefined ? Number(updates.amount) : undefined,
      };

      const response = await api.request(`/expenses/${id}`, {
        method: 'PUT',
        body: payload,
      });

      const expense = response.data;
      if (expense) {
        expense.id = expense._id;
      }

      // Backend should handle activity creation for updates
      return expense;
    } catch (error) {
      console.error(`Error updating expense with id ${id}:`, error);
      throw error;
    }
  },

  delete: async (id, currentUser) => {
    try {
      const response = await api.request(`/expenses/${id}`, {
        method: 'DELETE',
      });
      // Backend should handle activity creation for deletion
      return response.data;
    } catch (error) {
      console.error(`Error deleting expense with id ${id}:`, error);
      throw error;
    }
  }
};