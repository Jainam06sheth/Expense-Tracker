import mongoose from "mongoose";

const expenseSplitSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shareAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
      ],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

expenseSplitSchema.index(
  {
    expenseId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "ExpenseSplit",
  expenseSplitSchema
);