import { api } from "./api";

const normalizeActivity = (
  activity = null
) => {
  if (!activity) return null;

  const id =
    activity._id ||
    activity.id;

  return {
    ...activity,

    id,
    _id: id,

    userId:
      activity.userId?._id ||
      activity.userId,

    groupId:
      activity.groupId?._id ||
      activity.groupId,

    entityId:
      activity.entityId?._id ||
      activity.entityId,

    date:
      activity.date ||
      activity.createdAt,
  };
};

const extractActivities = (
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
      response.activities
    )
  ) {
    return response.activities;
  }

  return [];
};

export const activityService = {
  getMine: async () => {
    const response =
      await api.request(
        "/activities/me"
      );

    return extractActivities(
      response
    ).map(
      normalizeActivity
    );
  },

  getByGroup: async (
    groupId
  ) => {
    const response =
      await api.request(
        `/activities/group/${groupId}`
      );

    return extractActivities(
      response
    ).map(
      normalizeActivity
    );
  },

  /*
   * Backward-compatible alias
   * for old frontend code.
   */
  getAll: async () => {
    return activityService.getMine();
  },
};