import { api } from "./api";

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
};