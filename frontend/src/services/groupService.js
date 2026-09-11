import { api } from "./api";

const normalizeGroup = (
  group = null
) => {
  if (!group) return null;

  const id =
    group._id || group.id;

  return {
    ...group,

    id,
    _id: id,

    createdBy:
      group.createdBy?._id ||
      group.createdBy ||
      null,

    members:
      group.members || [],
  };
};

const extractData = (
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
      response.groups
    )
  ) {
    return response.groups;
  }

  return [];
};

export const groupService = {
  getAll: async () => {
    const response =
      await api.request(
        "/groups"
      );

    return extractData(
      response
    ).map(
      normalizeGroup
    );
  },

  getById: async (
    groupId
  ) => {
    const response =
      await api.request(
        `/groups/${groupId}`
      );

    return normalizeGroup(
      response.data ||
        response.group ||
        response
    );
  },

  getMembers: async (
    groupId
  ) => {
    const response =
      await api.request(
        `/groups/${groupId}/members`
      );

    const members =
      extractData(
        response
      );

    return members.map(
      (member) => {
        const user =
          member.user ||
          member;

        const id =
          user._id ||
          user.id ||
          member.userId;

        return {
          ...member,
          id,
          _id: id,
          userId: id,
          name:
            user.name ||
            member.name ||
            "Member",
          email:
            user.email ||
            member.email ||
            "",
        };
      }
    );
  },

  create: async (
    groupData
  ) => {
    const response =
      await api.request(
        "/groups",
        {
          method: "POST",
          body: groupData,
        }
      );

    return normalizeGroup(
      response.data ||
        response.group ||
        response
    );
  },

  update: async (
    groupId,
    updates
  ) => {
    const response =
      await api.request(
        `/groups/${groupId}`,
        {
          method: "PUT",
          body: updates,
        }
      );

    return normalizeGroup(
      response.data ||
        response.group ||
        response
    );
  },

  removeMember: async (
    groupId,
    userId
  ) => {
    return api.request(
      `/groups/${groupId}/member/${userId}`,
      {
        method: "DELETE",
      }
    );
  },
};