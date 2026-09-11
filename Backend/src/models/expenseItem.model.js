import mongoose from "mongoose";

const expenseItemSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

expenseItemSchema.index({ expenseId: 1 });

export default mongoose.model(
  "ExpenseItem",
  expenseItemSchema
);