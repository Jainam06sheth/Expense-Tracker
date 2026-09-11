import Expense from "../models/expense.model.js";
import ExpenseSplit from "../models/expenseSplit.model.js";
import Payment from "../models/payment.model.js";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";


// ===============================
// GET GROUP BALANCES
// ===============================
export const getGroupBalances = async (req, res) => {
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
        message: "You are not a member of this group.",
      });
    }

    const members = await GroupMember.find({
      groupId,
      status: "active",
    });

    const expenses = await Expense.find({
      groupId,
    });

    const expenseIds = expenses.map(
      (expense) => expense._id
    );

    const splits = await ExpenseSplit.find({
      expenseId: { $in: expenseIds },
    });

    const payments = await Payment.find({
      groupId,
      status: "paid",
    });

    /*
      balance[userId] =

      amount user has paid for others
      -
      amount user owes others
    */

    const balances = {};

    for (const member of members) {
      balances[member.userId.toString()] = 0;
    }

    // =========================================
    // EXPENSE CALCULATION
    // =========================================

    for (const expense of expenses) {
      const payerId = expense.paidBy.toString();

      for (const split of splits) {
        if (
          split.expenseId.toString() ===
          expense._id.toString()
        ) {
          const userId = split.userId.toString();

          // Person who paid gets credit
          balances[payerId] += split.shareAmount;

          // Person who owes gets debit
          balances[userId] -= split.shareAmount;
        }
      }
    }

    // =========================================
    // PAYMENT CALCULATION
    // =========================================

    for (const payment of payments) {
      const fromUser = payment.fromUser.toString();
      const toUser = payment.toUser.toString();

      // Sender paid → debt decreases
      balances[fromUser] += payment.amount;

      // Receiver received → credit decreases
      balances[toUser] -= payment.amount;
    }

    const result = [];

    for (const member of members) {
      const user = await User.findById(member.userId)
        .select("name username email");

      result.push({
        user: user,
        balance:
          Math.round(
            balances[member.userId.toString()] * 100
          ) / 100,
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};