
import { api } from "./api";

const extractData = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.invitations)) {
    return response.invitations;
  }

  return [];
};

export const invitationService = {
  // ===============================
  // CREATE / SEND INVITATION
  // ===============================
  create: async (invitationData) => {
    const response = await api.request("/invitations", {
      method: "POST",
      body: invitationData,
    });

    return (
      response.data ||
      response.invitation ||
      response
    );
  },

  // ===============================
  // GET MY INVITATIONS
  // ===============================
  getAll: async () => {
    const response = await api.request("/invitations");

    return extractData(response);
  },

  // ===============================
  // ACCEPT INVITATION
  // ===============================
  accept: async (invitationId) => {
    const response = await api.request(
      `/invitations/${invitationId}/accept`,
      {
        method: "PUT",
      }
    );

    return response.data || response;
  },

  // ===============================
  // REJECT INVITATION
  // ===============================
  reject: async (invitationId) => {
    const response = await api.request(
      `/invitations/${invitationId}/reject`,
      {
        method: "PUT",
      }
    );

    return response.data || response;
  },
};
