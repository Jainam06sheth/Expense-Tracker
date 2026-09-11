import ExpenseSplit from "../models/expenseSplit.model.js";
import Expense from "../models/expense.model.js";
import GroupMember from "../models/groupMember.model.js";


// ===============================
// GET EXPENSE SPLITS
// ===============================
export const getExpenseSplits = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    const member = await GroupMember.findOne({
      groupId: expense.groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a group member.",
      });
    }

    const splits = await ExpenseSplit.find({
      expenseId,
    }).populate(
      "userId",
      "name username email"
    );

    return res.status(200).json({
      success: true,
      data: splits,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET MY EXPENSE SPLITS
// ===============================
export const getMyExpenseSplits = async (req, res) => {
  try {
    const splits = await ExpenseSplit.find({
      userId: req.user.id,
      status: "pending",
    })
      .populate({
        path: "expenseId",
        populate: {
          path: "paidBy",
          select: "name username email",
        },
      });

    return res.status(200).json({
      success: true,
      count: splits.length,
      data: splits,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// MARK SPLIT AS PAID
// ===============================
export const markSplitPaid = async (req, res) => {
  try {
    const { splitId } = req.params;

    const split = await ExpenseSplit.findOne({
      _id: splitId,
      userId: req.user.id,
    });

    if (!split) {
      return res.status(404).json({
        success: false,
        message: "Expense split not found.",
      });
    }

    split.status = "paid";
    split.paidAt = new Date();

    await split.save();

    return res.status(200).json({
      success: true,
      message: "Expense split marked as paid.",
      data: split,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};