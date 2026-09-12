import express from "express";
import {  registerUser,
  userLogin,
  getUserProfile,
  updateUser,
  changePassword,
  getAllUsers,
  getUserById } from "../Controller/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", userLogin);

// GET all users (with optional email filtering)
router.get("/", getAllUsers);

// GET user by ID
router.get("/:userId", getUserById);

// Protected Routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUser);
router.put("/change-password", protect, changePassword);

export default router;