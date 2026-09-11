import Payment from "../models/payment.model.js";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";


// ===============================
// CREATE PAYMENT
// ===============================
export const createPayment = async (req, res) => {
  try {
    const {
      groupId,
      toUser,
      amount,
      reference,
      notes,
    } = req.body;

    if (!groupId || !toUser || !amount) {
      return res.status(400).json({
        success: false,
        message: "groupId, toUser and amount are required.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero.",
      });
    }

    const sender = await GroupMember.findOne({
      groupId,
      userId: req.user.id,
      status: "active",
    });

    const receiver = await GroupMember.findOne({
      groupId,
      userId: toUser,
      status: "active",
    });

    if (!sender || !receiver) {
      return res.status(403).json({
        success: false,
        message: "Both users must be members of the group.",
      });
    }

    if (toUser === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot make a payment to yourself.",
      });
    }

    const payment = await Payment.create({
      groupId,
      fromUser: req.user.id,
      toUser,
      amount,
      status: "pending",
      reference,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Payment request created.",
      data: payment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET MY PAYMENTS
// ===============================
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [
        { fromUser: req.user.id },
        { toUser: req.user.id },
      ],
    })
      .populate("fromUser", "name username email")
      .populate("toUser", "name username email")
      .populate("groupId", "name category")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET GROUP PAYMENTS
// ===============================
export const getGroupPayments = async (req, res) => {
  try {
    const { groupId } = req.params;

    const member = await GroupMember.findOne({
      groupId,
      userId: req.user.id,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a group member.",
      });
    }

    const payments = await Payment.find({
      groupId,
    })
      .populate("fromUser", "name username email")
      .populate("toUser", "name username email")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: payments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// ACCEPT / COMPLETE PAYMENT
// ===============================
export const completePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.toUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only receiver can confirm payment.",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment is already processed.",
      });
    }

    payment.status = "paid";

    await payment.save();

    const receiver = await User.findById(req.user.id);
    const sender = await User.findById(payment.fromUser);

    await Activity.create({
      type: "payment_completed",
      description: `${receiver.name} received ₹${payment.amount} from ${sender.name}`,
      userId: receiver._id,
      userName: receiver.name,
      groupId: payment.groupId,
      entityId: payment._id,
      entityType: "payment",
    });

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully.",
      data: payment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// REJECT PAYMENT
// ===============================
export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.toUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only receiver can reject payment.",
      });
    }

    payment.status = "rejected";

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment rejected.",
      data: payment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};