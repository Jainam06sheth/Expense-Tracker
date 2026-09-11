import express from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controller/userSettings.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get Settings
router.get("/", protect, getUserSettings);

// Update Settings
router.put("/", protect, updateUserSettings);

export default router;