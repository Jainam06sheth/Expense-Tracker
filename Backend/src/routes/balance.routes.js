import express from "express";
import { getGroupBalances } from "../controller/balance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Group Balance
router.get("/:groupId", protect, getGroupBalances);

export default router;