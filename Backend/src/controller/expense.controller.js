import Expense from "../models/expense.model.js";
import ExpenseSplit from "../models/expenseSplit.model.js";
import GroupMember from "../models/groupMember.model.js";
import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";


// ===============================
// CREATE EXPENSE
// ===============================
export const createExpense = async (req, res) => {
  try {
    const {
      groupId,
      name,
      category,
      amount,
      paidBy,
      date,
      notes,
      splitMethod,
      splits,
    } = req.body;

    if (!groupId || !name || !amount || !paidBy) {
      return res.status(400).json({
        success: false,
        message: "groupId, name, amount and paidBy are required.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero.",
      });
    }

    const currentMember = await GroupMember.findOne({
      groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!currentMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    const payerMember = await GroupMember.findOne({
      groupId,
      userId: paidBy,
      status: "active",
    });

    if (!payerMember) {
      return res.status(400).json({
        success: false,
        message: "Payer must be a group member.",
      });
    }

    const members = await GroupMember.find({
      groupId,
      status: "active",
    });

    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group has no members.",
      });
    }

    const expense = await Expense.create({
      groupId,
      name,
      category,
      amount,
      paidBy,
      date: date || new Date(),
      notes,
      splitMethod: splitMethod || "equal",
      status: "unsettled",
    });

    // =========================================
    // EQUAL SPLIT
    // =========================================
    if (!splitMethod || splitMethod === "equal") {
      const equalAmount =
        Math.round((amount / members.length) * 100) / 100;

      let totalAssigned = 0;

      for (let i = 0; i < members.length; i++) {
        let shareAmount = equalAmount;

        // Fix rounding difference on last member
        if (i === members.length - 1) {
          shareAmount =
            Math.round((amount - totalAssigned) * 100) / 100;
        }

        totalAssigned += shareAmount;

        await ExpenseSplit.create({
          expenseId: expense._id,
          userId: members[i].userId,
          shareAmount,
          status: "pending",
        });
      }
    }

    // =========================================
    // CUSTOM SPLIT
    // =========================================
    else if (splitMethod === "custom") {
      if (!Array.isArray(splits) || splits.length === 0) {
        await Expense.findByIdAndDelete(expense._id);

        return res.status(400).json({
          success: false,
          message: "Custom split data is required.",
        });
      }

      const totalSplit = splits.reduce(
        (sum, split) => sum + Number(split.shareAmount),
        0
      );

      if (Math.abs(totalSplit - amount) > 0.01) {
        await Expense.findByIdAndDelete(expense._id);

        return res.status(400).json({
          success: false,
          message: "Split amounts must equal expense amount.",
        });
      }

      for (const split of splits) {
        const memberExists = members.some(
          (member) =>
            member.userId.toString() === split.userId
        );

        if (!memberExists) {
          await Expense.findByIdAndDelete(expense._id);

          return res.status(400).json({
            success: false,
            message: "Every split user must be a group member.",
          });
        }

        await ExpenseSplit.create({
          expenseId: expense._id,
          userId: split.userId,
          shareAmount: split.shareAmount,
          status: "pending",
        });
      }
    }

    // =========================================
    // ITEM-BASED SPLIT
    // =========================================
    else if (splitMethod === "item-based") {
      // Item-based splits are created separately
      // using expenseItem controller.
    }

    const user = await User.findById(req.user.id);

    await Activity.create({
      type: "expense_created",
      description: `${user.name} created expense ${name}`,
      userId: user._id,
      userName: user.name,
      groupId,
      entityId: expense._id,
      entityType: "expense",
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      data: expense,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET GROUP EXPENSES
// ===============================
export const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const member = await GroupMember.findOne({
      groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    const expenses = await Expense.find({ groupId })
      .populate("paidBy", "name username email")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET SINGLE EXPENSE
// ===============================
export const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
      .populate("paidBy", "name username email");

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

    const splits = await ExpenseSplit.find({
      expenseId,
    }).populate("userId", "name username email");

    return res.status(200).json({
      success: true,
      data: {
        expense,
        splits,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// UPDATE EXPENSE
// ===============================
export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the person who created the expense can update it.",
      });
    }

    const {
      name,
      category,
      notes,
      date,
    } = req.body;

    if (name !== undefined) expense.name = name;
    if (category !== undefined) expense.category = category;
    if (notes !== undefined) expense.notes = notes;
    if (date !== undefined) expense.date = date;

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      data: expense,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// DELETE EXPENSE
// ===============================
export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only payer can delete this expense.",
      });
    }

    await ExpenseSplit.deleteMany({ expenseId });

    await expense.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};