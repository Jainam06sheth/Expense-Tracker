import { api } from "./api";

const normalizeItem = (
  item = null
) => {
  if (!item) return null;

  const id =
    item._id || item.id;

  return {
    ...item,
    id,
    _id: id,

    expenseId:
      item.expenseId?._id ||
      item.expenseId,

    participantIds:
      item.participantIds || [],
  };
};

const extractItems = (
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
      response.items
    )
  ) {
    return response.items;
  }

  return [];
};

export const expenseItemService = {
  create: async (
    itemData
  ) => {
    const response =
      await api.request(
        "/expense-items",
        {
          method: "POST",
          body: itemData,
        }
      );

    return normalizeItem(
      response.data ||
        response.item ||
        response
    );
  },

  add: async (
    itemData
  ) => {
    return expenseItemService.create(
      itemData
    );
  },

  getByExpense: async (
    expenseId
  ) => {
    const response =
      await api.request(
        `/expense-items/${expenseId}`
      );

    return extractItems(
      response
    ).map(
      normalizeItem
    );
  },

  delete: async (
    itemId
  ) => {
    return api.request(
      `/expense-items/${itemId}`,
      {
        method: "DELETE",
      }
    );
  },
};