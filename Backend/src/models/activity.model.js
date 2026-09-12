import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "expense_created",
        "expense_updated",
        "payment_created",
        "payment_completed",
        "group_created",
        "member_added",
        "member_removed",
        "group_updated",
        "invitation_sent",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    groupName: {
      type: String,
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    entityType: {
      type: String,
      enum: [
        "expense",
        "payment",
        "group",
        "member",
        "invitation",
      ],
      default: null,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ date: -1 });
activitySchema.index({ groupId: 1 });
activitySchema.index({ userId: 1 });

export default mongoose.model(
  "Activity",
  activitySchema
);