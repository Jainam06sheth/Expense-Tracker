import Expense from "../models/expense.model.js";
import GroupMember from "../models/groupMember.model.js";
import ExpenseItem from "../models/expenseItem.model.js";
import ExpenseSplit from "../models/expenseSplit.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";


// ===============================
// CREATE EXPENSE
// ===============================
export const createExpense = async (req, res) => {
  try {
    const {
      name,
      groupId,
      category,
      amount,
      paidBy,
      date,
      notes,
      splitMethod,
      items,
      participants,
      splits,
    } = req.body;

    if (!name || !groupId || !amount || !paidBy) {
      return res.status(400).json({
        success: false,
        message: "Name, groupId, amount, and paidBy are required.",
      });
    }

    // Verify the user is a member of the group
    const membership = await GroupMember.findOne({
      groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    const expense = await Expense.create({
      name,
      groupId,
      category: category || 'Other',
      amount,
      paidBy,
      date: date || new Date().toISOString(),
      notes: notes || '',
      splitMethod: splitMethod || 'equal',
      items: items || [],
      participants: participants || [],
      splits: splits || {},
    });

    // Create expense items if provided
    if (items && items.length > 0) {
      const expenseItems = items.map(item => ({
        ...item,
        expenseId: expense._id,
      }));
      await ExpenseItem.insertMany(expenseItems);
    }

    // Get group name for activity
    const group = await Group.findById(groupId);
    const user = await User.findById(paidBy);

    await Activity.create({
      type: "expense_created",
      description: `${user?.name || 'User'} added "${expense.name}" in ${group?.name || 'Group'} (₹${expense.amount})`,
      userId: user._id || req.user.id,
      userName: user?.name || 'User',
      groupId: group._id,
      groupName: group?.name || 'Group',
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
// GET USER EXPENSES (ACROSS GROUPS)
// ===============================
export const getUserExpenses = async (req, res) => {
  try {
    // Get all groups the user is an active member of
    const memberships = await GroupMember.find({
      userId: req.user.id,
      status: "active",
    }).select('groupId');

    const groupIds = memberships.map(m => m.groupId);

    // If the user is not in any groups, return empty array
    if (groupIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Get expenses for these groups
    const expenses = await Expense.find({ groupId: { $in: groupIds } })
      .sort({ createdAt: -1 }); // Newest first

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
// GET GROUP EXPENSES
// ===============================
export const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify the user is a member of the group
    const membership = await GroupMember.findOne({
      groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });

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
// GET EXPENSE BY ID
// ===============================
export const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    // Verify the user is a member of the group
    const membership = await GroupMember.findOne({
      groupId: expense.groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    return res.status(200).json({
      success: true,
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
// UPDATE EXPENSE
// ===============================
export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const {
      name,
      groupId,
      category,
      amount,
      paidBy,
      date,
      notes,
      splitMethod,
      items,
      participants,
      splits,
    } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    // Verify the user is a member of the group
    const membership = await GroupMember.findOne({
      groupId: expense.groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    // If groupId is being changed, verify the user is a member of the new group
    if (groupId && groupId !== expense.groupId.toString()) {
      const newMembership = await GroupMember.findOne({
        groupId,
        userId: req.user.id,
        status: "active",
      });

      if (!newMembership) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of the new group.",
        });
      }
    }

    // Update expense fields
    if (name !== undefined) expense.name = name;
    if (groupId !== undefined) expense.groupId = groupId;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = amount;
    if (paidBy !== undefined) expense.paidBy = paidBy;
    if (date !== undefined) expense.date = date;
    if (notes !== undefined) expense.notes = notes;
    if (splitMethod !== undefined) expense.splitMethod = splitMethod;
    if (items !== undefined) expense.items = items;
    if (participants !== undefined) expense.participants = participants;
    if (splits !== undefined) expense.splits = splits;

    await expense.save();

    // Handle expense items update (if provided)
    // Note: This is a simplified version. In a real app, you might want to handle item additions, updates, and deletions.
    // For now, we'll replace all items if the items array is provided.
    if (items !== undefined) {
      // Delete existing items for this expense
      await ExpenseItem.deleteMany({ expenseId: expense._id });
      // Create new items
      if (items.length > 0) {
        const expenseItems = items.map(item => ({
          ...item,
          expenseId: expense._id,
        }));
        await ExpenseItem.insertMany(expenseItems);
      }
    }

    // Get group and user names for activity
    const group = await Group.findById(expense.groupId);
    const user = await User.findById(expense.paidBy);

    await Activity.create({
      type: "expense_updated",
      description: `${user?.name || 'User'} updated expense "${expense.name}"`,
      userId: user._id || req.user.id,
      userName: user?.name || 'User',
      groupId: group._id,
      groupName: group?.name || 'Group',
      entityId: expense._id,
      entityType: "expense",
    });

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

    // Verify the user is a member of the group
    const membership = await GroupMember.findOne({
      groupId: expense.groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group.",
      });
    }

    // Delete expense items
    await ExpenseItem.deleteMany({ expenseId: expense._id });

    // Delete expense splits
    await ExpenseSplit.deleteMany({ expenseId: expense._id });

    // Delete the expense
    await Expense.findByIdAndDelete(expenseId);

    // Get group and user names for activity
    const group = await Group.findById(expense.groupId);
    const user = await User.findById(expense.paidBy);

    await Activity.create({
      type: "expense_deleted",
      description: `${user?.name || 'User'} deleted expense "${expense.name}"`,
      userId: user._id || req.user.id,
      userName: user?.name || 'User',
      groupId: group._id,
      groupName: group?.name || 'Group',
      entityId: expense._id,
      entityType: "expense",
    });

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