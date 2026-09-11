import express from "express";
import {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../controller/groupInvitation.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Send Invitation
router.post("/", protect, sendInvitation);

// Get My Invitations
router.get("/", protect, getMyInvitations);

// Accept Invitation
router.put("/:invitationId/accept", protect, acceptInvitation);

// Reject Invitation
router.put("/:invitationId/reject", protect, rejectInvitation);

export default router;