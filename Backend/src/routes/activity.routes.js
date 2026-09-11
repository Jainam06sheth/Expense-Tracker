import express from "express";
import {
  getMyActivities,
  getGroupActivities,
} from "../controller/activity.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// My Activities
router.get("/me", protect, getMyActivities);

// Group Activities
router.get("/group/:groupId", protect, getGroupActivities);

export default router;