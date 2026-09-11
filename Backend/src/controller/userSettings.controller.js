import UserSettings from "../models/userSettings.model.js";


// ===============================
// GET SETTINGS
// ===============================
export const getUserSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({
      userId: req.user.id,
    });

    if (!settings) {
      settings = await UserSettings.create({
        userId: req.user.id,
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// UPDATE SETTINGS
// ===============================
export const updateUserSettings = async (req, res) => {
  try {
    const {
      currency,
      theme,
      notifications,
      emailAlerts,
    } = req.body;

    let settings = await UserSettings.findOne({
      userId: req.user.id,
    });

    if (!settings) {
      settings = await UserSettings.create({
        userId: req.user.id,
        currency,
        theme,
        notifications,
        emailAlerts,
      });
    } else {
      if (currency !== undefined) {
        settings.currency = currency;
      }

      if (theme !== undefined) {
        settings.theme = theme;
      }

      if (notifications !== undefined) {
        settings.notifications = notifications;
      }

      if (emailAlerts !== undefined) {
        settings.emailAlerts = emailAlerts;
      }

      await settings.save();
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};