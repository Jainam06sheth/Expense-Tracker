import { api } from "./api";

const normalizeSplit = (
  split = null
) => {
  if (!split) return null;

  const id =
    split._id || split.id;

  return {
    ...split,

    id,
    _id: id,

    expenseId:
      split.expenseId?._id ||
      split.expenseId,

    userId:
      split.userId?._id ||
      split.userId,

    shareAmount:
      split.shareAmount || 0,

    status:
      split.status ||
      "pending",

    paidAt:
      split.paidAt || null,
  };
};

const extractSplits = (
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
      response.splits
    )
  ) {
    return response.splits;
  }

  return [];
};

export const expenseSplitService = {
  getMine: async () => {
    const response =
      await api.request(
        "/splits/me"
      );

    return extractSplits(
      response
    ).map(
      normalizeSplit
    );
  },

  getByExpense: async (
    expenseId
  ) => {
    const response =
      await api.request(
        `/splits/${expenseId}`
      );

    return extractSplits(
      response
    ).map(
      normalizeSplit
    );
  },

  markPaid: async (
    splitId
  ) => {
    const response =
      await api.request(
        `/splits/${splitId}/pay`,
        {
          method: "PUT",
        }
      );

    return normalizeSplit(
      response.data ||
        response.split ||
        response
    );
  },
};