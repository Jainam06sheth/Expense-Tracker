import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },

    password: {
      type: String,
      required: true,
    },

    phonenumber: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "U",
    },

    avatarColor: {
      type: String,
      default: "bg-blue-600",
    },

    college: {
      type: String,
      trim: true,
      maxlength: 150,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;