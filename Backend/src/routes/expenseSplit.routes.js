import express from "express";
import {
  getExpenseSplits,
  getMyExpenseSplits,
  markSplitPaid,
} from "../controller/expenseSplit.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// My Pending Splits
router.get("/me", protect, getMyExpenseSplits);

// Expense Splits
router.get("/:expenseId", protect, getExpenseSplits);

// Mark Paid
router.put("/:splitId/pay", protect, markSplitPaid);

export default router;