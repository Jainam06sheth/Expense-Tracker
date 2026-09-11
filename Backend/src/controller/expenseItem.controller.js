import ExpenseItem from "../models/expenseItem.model.js";
import Expense from "../models/expense.model.js";
import ExpenseSplit from "../models/expenseSplit.model.js";
import GroupMember from "../models/groupMember.model.js";


// ===============================
// ADD EXPENSE ITEM
// ===============================
export const addExpenseItem = async (req, res) => {
  try {
    const {
      expenseId,
      name,
      amount,
      participantIds,
    } = req.body;

    if (
      !expenseId ||
      !name ||
      amount === undefined ||
      !Array.isArray(participantIds)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense item data.",
      });
    }

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
        message: "You are not a member of this group.",
      });
    }

    const groupMembers = await GroupMember.find({
      groupId: expense.groupId,
      status: "active",
    });

    for (const participantId of participantIds) {
      const exists = groupMembers.some(
        (member) =>
          member.userId.toString() === participantId
      );

      if (!exists) {
        return res.status(400).json({
          success: false,
          message: "Participant is not a group member.",
        });
      }
    }

    const item = await ExpenseItem.create({
      expenseId,
      name,
      amount,
      participantIds,
    });

    return res.status(201).json({
      success: true,
      message: "Expense item added.",
      data: item,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET EXPENSE ITEMS
// ===============================
export const getExpenseItems = async (req, res) => {
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
        message: "You are not a member of this group.",
      });
    }

    const items = await ExpenseItem.find({
      expenseId,
    }).populate(
      "participantIds",
      "name username email"
    );

    return res.status(200).json({
      success: true,
      data: items,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// DELETE EXPENSE ITEM
// ===============================
export const deleteExpenseItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await ExpenseItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Expense item not found.",
      });
    }

    const expense = await Expense.findById(item.expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only payer can delete the item.",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Expense item deleted.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};