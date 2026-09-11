import express from "express";
import {
  addExpenseItem,
  getExpenseItems,
  deleteExpenseItem,
} from "../controller/expenseItem.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add Item
router.post("/", protect, addExpenseItem);

// Get Items
router.get("/:expenseId", protect, getExpenseItems);

// Delete Item
router.delete("/:itemId", protect, deleteExpenseItem);

export default router;