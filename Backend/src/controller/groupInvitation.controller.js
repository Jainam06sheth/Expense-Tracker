import GroupInvitation from "../models/groupInvitation.model.js";
import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";


// ===============================
// SEND GROUP INVITATION
// ===============================
export const sendInvitation = async (req, res) => {
  try {
    const { groupId, invitedUser } = req.body;

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
        message: "Only group creator can invite users.",
      });
    }

    const user = await User.findById(invitedUser);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invited user not found.",
      });
    }

    if (invitedUser === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself.",
      });
    }

    const alreadyMember = await GroupMember.findOne({
      groupId,
      userId: invitedUser,
      status: "active",
    });

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a member.",
      });
    }

    let invitation = await GroupInvitation.findOne({
      groupId,
      invitedUser,
    });

    if (invitation) {
      if (invitation.status === "pending") {
        return res.status(409).json({
          success: false,
          message: "Invitation already sent.",
        });
      }

      invitation.invitedBy = req.user.id;
      invitation.status = "pending";
      invitation.respondedAt = null;

      await invitation.save();
    } else {
      invitation = await GroupInvitation.create({
        groupId,
        invitedBy: req.user.id,
        invitedUser,
      });
    }

    // Create activity for invitation sent
    await Activity.create({
  type: "invitation_sent",
  description: `${req.user.name} invited ${user.name} to join ${group.name}`,
  userId: req.user.id,
  userName: req.user.name,
  groupId: group._id,
  groupName: group.name,
  entityId: invitation._id,
  entityType: "invitation",
});

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully.",
      data: invitation,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET MY INVITATIONS
// ===============================
export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await GroupInvitation.find({
      invitedUser: req.user.id,
      status: "pending",
    })
      .populate("groupId")
      .populate("invitedBy", "name username email");

    return res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// ACCEPT INVITATION
// ===============================
export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await GroupInvitation.findOne({
      _id: invitationId,
      invitedUser: req.user.id,
      status: "pending",
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    const user = await User.findById(req.user.id);
    const group = await Group.findById(invitation.groupId);

    if (!user || !group) {
      return res.status(404).json({
        success: false,
        message: "User or group not found.",
      });
    }

    const existingMember = await GroupMember.findOne({
      groupId: group._id,
      userId: user._id,
    });

    if (existingMember) {
      existingMember.status = "active";
      await existingMember.save();
    } else {
      await GroupMember.create({
        groupId: group._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: "member",
        status: "active",
      });
    }

    invitation.status = "accepted";
    invitation.respondedAt = new Date();

    await invitation.save();

    await Activity.create({
      type: "member_added",
      description: `${user.name} joined ${group.name}`,
      userId: user._id,
      userName: user.name,
      groupId: group._id,
      groupName: group.name,
      entityId: user._id,
      entityType: "member",
    });

    return res.status(200).json({
      success: true,
      message: "Invitation accepted.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// REJECT INVITATION
// ===============================
export const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await GroupInvitation.findOne({
      _id: invitationId,
      invitedUser: req.user.id,
      status: "pending",
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    invitation.status = "rejected";
    invitation.respondedAt = new Date();

    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "Invitation rejected.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};