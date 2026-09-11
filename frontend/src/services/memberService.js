import { api } from './api';

const normalizeMember = (
  member = null
) => {
  if (!member) return null;

  const user =
    member.user || member;

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
      'Member',

    email:
      user.email ||
      member.email ||
      '',

    role:
      member.role ||
      'member',

    status:
      member.status ||
      'active',

    joinedAt:
      member.joinedAt ||
      null,
  };
};

const extractMembers = (
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
      response.members
    )
  ) {
    return response.members;
  }

  return [];
};

export const memberService = {
  /*
   * Get all members of a group
   */
  getByGroupId: async (
    groupId
  ) => {
    try {
      const response =
        await api.request(
          `/groups/${groupId}/members`
        );

      return extractMembers(
        response
      ).map(
        normalizeMember
      );
    } catch (error) {
      throw new Error(
        error.message ||
          'Unable to load group members'
      );
    }
  },

  /*
   * Add a member
   *
   * Backend uses invitations,
   * so this creates an invitation
   * instead of directly adding
   * the user to GroupMember.
   */
  create: async (
    groupId,
    memberData
  ) => {
    try {
      const payload = {
        groupId,

        /*
         * Depending on your AddMemberModal,
         * memberData may contain either
         * userId or id.
         */
        invitedUser:
          memberData.invitedUser ||
          memberData.userId ||
          memberData.id,
      };

      if (!payload.invitedUser) {
        throw new Error(
          'User ID is required to send an invitation'
        );
      }

      const response =
        await api.request(
          '/invitations',
          {
            method: 'POST',
            body: payload,
          }
        );

      return (
        response.data ||
        response.invitation ||
        response
      );
    } catch (error) {
      throw new Error(
        error.message ||
          'Unable to send member invitation'
      );
    }
  },

  /*
   * Update member
   *
   * There is currently NO backend
   * endpoint for updating a member.
   */
  update: async () => {
    throw new Error(
      'Updating group members is not supported by the backend yet.'
    );
  },

  /*
   * Remove member from group
   */
  delete: async (
    groupId,
    memberId
  ) => {
    try {
      const response =
        await api.request(
          `/groups/${groupId}/member/${memberId}`,
          {
            method: 'DELETE',
          }
        );

      return (
        response.data ||
        response
      );
    } catch (error) {
      throw new Error(
        error.message ||
          'Unable to remove member'
      );
    }
  },
};