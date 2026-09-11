import mongoose from "mongoose";

const groupInvitationSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

groupInvitationSchema.index(
  {
    groupId: 1,
    invitedUser: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "GroupInvitation",
  groupInvitationSchema
);