import express from "express";
import {
  createPayment,
  getMyPayments,
  getGroupPayments,
  completePayment,
  rejectPayment,
} from "../controller/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create Payment
router.post("/", protect, createPayment);

// My Payments
router.get("/me", protect, getMyPayments);

// Group Payments
router.get("/group/:groupId", protect, getGroupPayments);

// Complete Payment
router.put("/:paymentId/complete", protect, completePayment);

// Reject Payment
router.put("/:paymentId/reject", protect, rejectPayment);

export default router;