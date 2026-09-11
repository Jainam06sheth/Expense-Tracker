import Activity from "../models/activity.model.js";
import GroupMember from "../models/groupMember.model.js";


// ========================================
// GET MY ACTIVITIES
// ========================================

export const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.user.id,
    })
      .sort({ date: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// GET GROUP ACTIVITIES
// ========================================

export const getGroupActivities = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check whether user belongs to group
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

    const activities = await Activity.find({
      groupId,
    })
      .sort({ date: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};