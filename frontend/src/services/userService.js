import {
  getData,
  setData,
  removeData,
} from "../utils/storage";

import {
  STORAGE_KEYS,
} from "../constants/storageKeys";

import { api } from "./api";

const normalizeUser = (
  user = null
) => {
  if (!user) return null;

  const id =
    user._id || user.id;

  return {
    ...user,

    id,
    _id: id,

    name:
      user.name ||
      "User",

    username:
      user.username ||
      user.name ||
      "",

    email:
      user.email ||
      "",

    phonenumber:
      user.phonenumber ||
      user.phone ||
      "",

    college:
      user.college ||
      "",

    avatar:
      user.avatar ||
      (
        user.name ||
        "U"
      )
        .charAt(0)
        .toUpperCase(),

    avatarColor:
      user.avatarColor ||
      "bg-indigo-600",

    joinedDate:
      user.joinedDate ||
      (
        user.createdAt
          ? new Date(
              user.createdAt
            )
              .toISOString()
              .split("T")[0]
          : new Date()
              .toISOString()
              .split("T")[0]
      ),
  };
};

export const userService = {
  getCurrentUser: () => {
    const current =
      getData(
        STORAGE_KEYS.CURRENT_USER,
        null
      );

    return current
      ? normalizeUser(current)
      : null;
  },

  setCurrentUser: (user) => {
    const normalized =
      normalizeUser(user);

    if (!normalized) {
      return null;
    }

    setData(
      STORAGE_KEYS.CURRENT_USER,
      normalized
    );

    return normalized;
  },

  login: async (
    email,
    password
  ) => {
    try {
      const response =
        await api.request(
          "/users/login",
          {
            method: "POST",
            body: {
              email,
              password,
            },
          }
        );

      const user =
        normalizeUser(
          response.data
        );

      const token =
        response.token;

      if (!user || !token) {
        return {
          success: false,
          message:
            response.message ||
            "Invalid email or password",
        };
      }

      api.setToken(token);

      userService.setCurrentUser(
        user
      );

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Invalid email or password",
      };
    }
  },

  signup: async (
    userData
  ) => {
    try {
      const payload = {
        name:
          userData.name?.trim(),

        username:
          userData.username?.trim(),

        email:
          userData.email?.trim(),

        password:
          userData.password,

        phonenumber:
          userData.phonenumber?.trim(),

        college:
          userData.college?.trim(),
      };

      const response =
        await api.request(
          "/users/register",
          {
            method: "POST",
            body: payload,
          }
        );

      const user =
        normalizeUser(
          response.data
        );

      return {
        success: true,
        user,
        message:
          response.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to register",
      };
    }
  },

  update: async (
    id,
    updates
  ) => {
    try {
      const payload = {
        name:
          updates.name,

        username:
          updates.username,

        college:
          updates.college,

        phonenumber:
          updates.phonenumber,
      };

      const response =
        await api.request(
          "/users/profile",
          {
            method: "PUT",
            body: payload,
          }
        );

      const updatedUser =
        normalizeUser(
          response.data
        );

      userService.setCurrentUser(
        updatedUser
      );

      return {
        success: true,
        user: updatedUser,
        message:
          response.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to update profile",
      };
    }
  },

  changePassword: async (
    currentPassword,
    newPassword
  ) => {
    try {
      const response =
        await api.request(
          "/users/change-password",
          {
            method: "PUT",
            body: {
              currentPassword,
              newPassword,
            },
          }
        );

      return {
        success: true,
        message:
          response.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to change password",
      };
    }
  },

  loadProfile: async () => {
    try {
      const response =
        await api.request(
          "/users/profile"
        );

      const user =
        normalizeUser(
          response.data
        );

      if (user) {
        userService.setCurrentUser(
          user
        );
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to load profile",
      };
    }
  },

  create: async (
    userData
  ) => {
    return userService.signup(
      userData
    );
  },

  logout: () => {
    removeData(
      STORAGE_KEYS.CURRENT_USER
    );

    api.clearToken();
  },
};