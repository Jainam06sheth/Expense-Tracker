import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      enum: [
        "Food",
        "Travel",
        "Bills",
        "Shopping",
        "Entertainment",
        "Other",
      ],
      default: "Other",
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },

    splitMethod: {
      type: String,
      enum: [
        "equal",
        "item-based",
        "custom",
      ],
      default: "equal",
    },

    status: {
      type: String,
      enum: [
        "unsettled",
        "partial",
        "settled",
      ],
      default: "unsettled",
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ groupId: 1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ date: -1 });

export default mongoose.model(
  "Expense",
  expenseSchema
);