import { api } from "./api";
import { groupService } from "./groupService";

const normalizeExpense = (
  expense = null
) => {
  if (!expense) return null;

  const id =
    expense._id ||
    expense.id;

  return {
    ...expense,

    id,
    _id: id,

    groupId:
      expense.groupId?._id ||
      expense.groupId,

    paidBy:
      expense.paidBy?._id ||
      expense.paidBy,

    items:
      expense.items || [],

    splits:
      expense.splits || [],
  };
};

const extractArray = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    Array.isArray(
      response.expenses
    )
  ) {
    return response.expenses;
  }

  return [];
};

export const expenseService = {
  getByGroup: async (
    groupId
  ) => {
    const response =
      await api.request(
        `/expenses/group/${groupId}`
      );

    return extractArray(
      response
    ).map(
      normalizeExpense
    );
  },

  getByGroupId: async (
    groupId
  ) => {
    return expenseService.getByGroup(
      groupId
    );
  },

  getById: async (
    expenseId
  ) => {
    const response =
      await api.request(
        `/expenses/${expenseId}`
      );

    return normalizeExpense(
      response.data ||
        response.expense ||
        response
    );
  },

  create: async (
    payload
  ) => {
    const {
      items,
      splits,
      ...expenseData
    } = payload;

    /*
     * Create main Expense first.
     */
    const response =
      await api.request(
        "/expenses",
        {
          method: "POST",
          body: expenseData,
        }
      );

    const expense =
      normalizeExpense(
        response.data ||
          response.expense ||
          response
      );

    return expense;
  },

  update: async (
    expenseId,
    payload
  ) => {
    const {
      items,
      splits,
      ...expenseData
    } = payload;

    const response =
      await api.request(
        `/expenses/${expenseId}`,
        {
          method: "PUT",
          body: expenseData,
        }
      );

    return normalizeExpense(
      response.data ||
        response.expense ||
        response
    );
  },

  delete: async (
    expenseId
  ) => {
    return api.request(
      `/expenses/${expenseId}`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * Get all expenses for the current user across all groups.
   * This is used by components that need a flat list of all expenses.
   */
  getAll: async () => {
    try {
      const groups = await groupService.getAll();
      let allExpenses = [];

      for (const group of groups) {
        const groupId = group.id || group._id;
        if (!groupId) continue;

        const groupExpenses = await expenseService.getByGroup(groupId);
        allExpenses = [...allExpenses, ...(groupExpenses || [])];
      }

      return allExpenses;
    } catch (error) {
      console.error('Error in expenseService.getAll:', error);
      return [];
    }
  }
};