import express from "express";
import {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controller/expense.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create Expense
router.post("/", protect, createExpense);

// Get Expense of Group
router.get("/group/:groupId", protect, getGroupExpenses);

// Get Single Expense
router.get("/:expenseId", protect, getExpenseById);

// Update Expense
router.put("/:expenseId", protect, updateExpense);

// Delete Expense
router.delete("/:expenseId", protect, deleteExpense);

export default router;