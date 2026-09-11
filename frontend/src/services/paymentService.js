import { api } from "./api";

const normalizePayment = (
  payment = null
) => {
  if (!payment) return null;

  const id =
    payment._id ||
    payment.id;

  return {
    ...payment,

    id,
    _id: id,

    groupId:
      payment.groupId?._id ||
      payment.groupId,

    fromUser:
      payment.fromUser?._id ||
      payment.fromUser,

    toUser:
      payment.toUser?._id ||
      payment.toUser,

    amount:
      Number(
        payment.amount
      ) || 0,

    status:
      payment.status ||
      "pending",
  };
};

const extractPayments = (
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
      response.payments
    )
  ) {
    return response.payments;
  }

  return [];
};

export const paymentService = {
  create: async (
    paymentData
  ) => {
    const response =
      await api.request(
        "/payments",
        {
          method: "POST",
          body: paymentData,
        }
      );

    return normalizePayment(
      response.data ||
        response.payment ||
        response
    );
  },

  getMine: async () => {
    const response =
      await api.request(
        "/payments/me"
      );

    return extractPayments(
      response
    ).map(
      normalizePayment
    );
  },

  getByGroup: async (
    groupId
  ) => {
    const response =
      await api.request(
        `/payments/group/${groupId}`
      );

    return extractPayments(
      response
    ).map(
      normalizePayment
    );
  },

  complete: async (
    paymentId
  ) => {
    const response =
      await api.request(
        `/payments/${paymentId}/complete`,
        {
          method: "PUT",
        }
      );

    return normalizePayment(
      response.data ||
        response.payment ||
        response
    );
  },

  reject: async (
    paymentId
  ) => {
    const response =
      await api.request(
        `/payments/${paymentId}/reject`,
        {
          method: "PUT",
        }
      );

    return normalizePayment(
      response.data ||
        response.payment ||
        response
    );
  },
};