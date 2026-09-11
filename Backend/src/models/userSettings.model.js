import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currency: {
      type: String,
      enum: [
        "INR",
        "USD",
        "EUR",
        "GBP",
      ],
      default: "INR",
    },

    theme: {
      type: String,
      enum: [
        "light",
        "dark",
        "system",
      ],
      default: "light",
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    emailAlerts: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "UserSettings",
  userSettingsSchema
);