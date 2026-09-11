import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "rejected",
      ],
      default: "pending",
    },

    reference: {
      type: String,
      trim: true,
      maxlength: 60,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ groupId: 1 });
paymentSchema.index({ fromUser: 1 });
paymentSchema.index({ toUser: 1 });

export default mongoose.model(
  "Payment",
  paymentSchema
);