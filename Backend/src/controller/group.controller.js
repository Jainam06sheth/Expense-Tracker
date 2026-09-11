import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";


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