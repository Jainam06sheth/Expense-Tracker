import { api } from "./api";

export const settingsService = {
  get: async () => {
    try {
      const response =
        await api.request(
          "/settings"
        );

      return {
        success: true,
        settings:
          response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to load settings",
      };
    }
  },

  update: async (
    settings
  ) => {
    try {
      const payload = {
        currency:
          settings.currency,

        theme:
          settings.theme,

        notifications:
          settings.notifications,

        emailAlerts:
          settings.emailAlerts,
      };

      const response =
        await api.request(
          "/settings",
          {
            method: "PUT",
            body: payload,
          }
        );

      return {
        success: true,
        settings:
          response.data,
        message:
          response.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to update settings",
      };
    }
  },
};