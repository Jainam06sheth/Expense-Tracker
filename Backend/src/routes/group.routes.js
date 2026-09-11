import express from "express";
import {
  createGroup,
  getMyGroups,
  getGroupById,
  getGroupMembers,
  updateGroup,
  removeMember,
  deleteGroup,
} from "../controller/group.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create Group
router.post("/", protect, createGroup);

// My Groups
router.get("/", protect, getMyGroups);

// Single Group
router.get("/:groupId", protect, getGroupById);

// Group Members
router.get("/:groupId/members", protect, getGroupMembers);

// Update Group
router.put("/:groupId", protect, updateGroup);

// Remove Member
router.delete("/:groupId/member/:userId", protect, removeMember);

// Delete Group
router.delete("/:groupId", protect, deleteGroup);

export default router;