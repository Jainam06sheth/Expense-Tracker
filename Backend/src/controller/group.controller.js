import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import Expense from "../models/expense.model.js";
import ExpenseItem from "../models/expenseItem.model.js";
import ExpenseSplit from "../models/expenseSplit.model.js";
import GroupInvitation from "../models/groupInvitation.model.js";
import Payment from "../models/payment.model.js";
import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";


// ===============================
// CREATE GROUP
// ===============================
export const createGroup = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const group = await Group.create({
      name,
      category,
      description,
      createdBy: req.user.id,
    });

    await GroupMember.create({
      groupId: group._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: "admin",
      status: "active",
    });

    await Activity.create({
      type: "group_created",
      description: `${user.name} created group ${group.name}`,
      userId: user._id,
      userName: user.name,
      groupId: group._id,
      groupName: group.name,
      entityId: group._id,
      entityType: "group",
    });

    return res.status(201).json({
      success: true,
      message: "Group created successfully.",
      data: group,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET MY GROUPS
// ===============================
export const getMyGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.find({
      userId: req.user.id,
      status: "active",
    }).populate("groupId");

    const groups = memberships.map((member) => member.groupId);

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET SINGLE GROUP
// ===============================
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

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

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: group,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET GROUP MEMBERS
// ===============================
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

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

    const members = await GroupMember.find({
      groupId,
      status: "active",
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// UPDATE GROUP
// ===============================
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, category, description } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can update this group.",
      });
    }

    if (name !== undefined) group.name = name;
    if (category !== undefined) group.category = category;
    if (description !== undefined) group.description = description;

    await group.save();

    return res.status(200).json({
      success: true,
      message: "Group updated successfully.",
      data: group,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// REMOVE MEMBER
// ===============================
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can remove members.",
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Group creator cannot remove themselves.",
      });
    }

    const member = await GroupMember.findOneAndUpdate(
      {
        groupId,
        userId,
        status: "active",
      },
      {
        status: "archived",
      },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    // Create activity for member removal
    const user = await User.findById(userId);
    if (user && group) {
      await Activity.create({
        type: "member_removed",
        description: `${user.name} removed from ${group.name}`,
        userId: user._id,
        userName: user.name,
        groupId: group._id,
        groupName: group.name,
        entityId: user._id,
        entityType: "member",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member removed successfully.",
      data: member,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// DELETE GROUP
// ===============================
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group and verify the user is the creator
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can delete this group.",
      });
    }

    // Start a session for transaction if needed, but we'll do sequential deletes for simplicity
    // In a production app, we might want to use transactions

    // Delete activities related to the group
    await Activity.deleteMany({ groupId });

    // Delete expense splits for expenses in the group
    const expenses = await Expense.find({ groupId });
    const expenseIds = expenses.map(exp => exp._id);
    await ExpenseSplit.deleteMany({ expenseId: { $in: expenseIds } });

    // Delete expense items for expenses in the group
    await ExpenseItem.deleteMany({ expenseId: { $in: expenseIds } });

    // Delete expenses for the group
    await Expense.deleteMany({ groupId });

    // Delete payments for the group
    await Payment.deleteMany({ groupId });

    // Delete group invitations for the group
    await GroupInvitation.deleteMany({ groupId });

    // Delete group members for the group
    await GroupMember.deleteMany({ groupId });

    // Finally, delete the group
    await Group.findByIdAndDelete(groupId);

    // Optionally, create an activity for group deletion (though the group is deleted, we can still create an activity with the group's last known data)
    await Activity.create({
      type: "group_deleted",
      description: `${req.user.name} deleted group ${group.name}`,
      userId: req.user.id,
      userName: req.user.name,
      groupId: group._id, // Note: group still exists at this point until the delete above, but we are using the group object we fetched earlier
      groupName: group.name,
      entityId: group._id,
      entityType: "group",
    });

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};