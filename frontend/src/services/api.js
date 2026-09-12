// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_URL = import.meta.env.VITE_NETWORK_API_URL || "http://10.115.185.77:3001/api";

const getToken = () => {
  return localStorage.getItem("token");
};

export const api = {
  request: async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...(options.headers || {}),
    };

    // Don't force JSON headers for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] =
        "application/json";
    }

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
        body:
          options.body instanceof FormData
            ? options.body
            : options.body
            ? JSON.stringify(options.body)
            : undefined,
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Something went wrong"
      );
    }

    return data;
  },

  setToken: (token) => {
    localStorage.setItem(
      "token",
      token
    );
  },

  clearToken: () => {
    localStorage.removeItem(
      "token"
    );
  },
};

export const API = {
  users: {
    register:
      `${API_URL}/users/register`,
    login:
      `${API_URL}/users/login`,
    profile:
      `${API_URL}/users/profile`,
    changePassword:
      `${API_URL}/users/change-password`,
  },

  groups: {
    create:
      `${API_URL}/groups`,
    getAll:
      `${API_URL}/groups`,
    getById: (groupId) =>
      `${API_URL}/groups/${groupId}`,
    getMembers: (groupId) =>
      `${API_URL}/groups/${groupId}/members`,
    update: (groupId) =>
      `${API_URL}/groups/${groupId}`,
    removeMember: (
      groupId,
      userId
    ) =>
      `${API_URL}/groups/${groupId}/member/${userId}`,
  },

  invitations: {
    create:
      `${API_URL}/invitations`,
    getAll:
      `${API_URL}/invitations`,
    accept: (invitationId) =>
      `${API_URL}/invitations/${invitationId}/accept`,
    reject: (invitationId) =>
      `${API_URL}/invitations/${invitationId}/reject`,
  },

  expenses: {
    create:
      `${API_URL}/expenses`,
    getByGroup: (groupId) =>
      `${API_URL}/expenses/group/${groupId}`,
    getById: (expenseId) =>
      `${API_URL}/expenses/${expenseId}`,
    update: (expenseId) =>
      `${API_URL}/expenses/${expenseId}`,
    delete: (expenseId) =>
      `${API_URL}/expenses/${expenseId}`,
  },

  expenseItems: {
    create:
      `${API_URL}/expense-items`,
    getByExpense: (expenseId) =>
      `${API_URL}/expense-items/${expenseId}`,
    delete: (itemId) =>
      `${API_URL}/expense-items/${itemId}`,
  },

  splits: {
    getMine:
      `${API_URL}/splits/me`,
    getByExpense: (expenseId) =>
      `${API_URL}/splits/${expenseId}`,
    pay: (splitId) =>
      `${API_URL}/splits/${splitId}/pay`,
  },

  payments: {
    create:
      `${API_URL}/payments`,
    getMine:
      `${API_URL}/payments/me`,
    getByGroup: (groupId) =>
      `${API_URL}/payments/group/${groupId}`,
    complete: (paymentId) =>
      `${API_URL}/payments/${paymentId}/complete`,
    reject: (paymentId) =>
      `${API_URL}/payments/${paymentId}/reject`,
  },

  balances: {
    getByGroup: (groupId) =>
      `${API_URL}/balances/${groupId}`,
  },

  activities: {
    getMine:
      `${API_URL}/activities/me`,
    getByGroup: (groupId) =>
      `${API_URL}/activities/group/${groupId}`,
  },

  settings: {
    get:
      `${API_URL}/settings`,
    update:
      `${API_URL}/settings`,
  },
};