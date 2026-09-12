import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// ===============================
// REGISTER USER
// ===============================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      phonenumber,
      college,
    } = req.body;

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !phonenumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required.",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        { phonenumber },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      phonenumber,
      college,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phonenumber: user.phonenumber,
        college: user.college,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// LOGIN USER
// ===============================
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phonenumber: user.phonenumber,
        college: user.college,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET PROFILE
// ===============================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// UPDATE PROFILE
// ===============================
export const updateUser = async (req, res) => {
  try {
    const { name, username, college, phonenumber } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({
        username,
        _id: { $ne: req.user.id },
      });

      if (usernameExists) {
        return res.status(409).json({
          success: false,
          message: "Username already exists.",
        });
      }
    }

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (college !== undefined) user.college = college;
    if (phonenumber !== undefined) user.phonenumber = phonenumber;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phonenumber: user.phonenumber,
        college: user.college,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// CHANGE PASSWORD
// ===============================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET ALL USERS
// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const { email, search } = req.query;
    let users;

    if (email) {
      // If email is provided, find users matching the email (case insensitive)
      users = await User.find({ email: new RegExp(email, 'i') }).select("-password");
    } else if (search) {
      // If search is provided, search by email, name, or username
      users = await User.find({
        $or: [
          { email: new RegExp(search, 'i') },
          { name: new RegExp(search, 'i') },
          { username: new RegExp(search, 'i') }
        ]
      }).select("-password");
    } else {
      // Otherwise, get all users
      users = await User.find().select("-password");
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET USER BY ID
// ===============================
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};