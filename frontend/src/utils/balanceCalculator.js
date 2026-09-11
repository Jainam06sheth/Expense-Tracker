/**
 * Balance Calculator Utilities
 * Computes net balances, pairwise who-owes-whom ledgers, and historical breakdowns.
 */

const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateGroupBalances = (expenses = [], payments = [], members = []) => {
  const memberIds = members.map((m) => m.id);
  const totalPaid = {};
  const totalShare = {};
  const netBalances = {};

  // Initialize
  memberIds.forEach((id) => {
    totalPaid[id] = 0;
    totalShare[id] = 0;
    netBalances[id] = 0;
  });

  // Track pairwise debts: pairwiseMatrix[debtor][creditor] = amount
  const pairwiseMatrix = {};
  memberIds.forEach((debtor) => {
    pairwiseMatrix[debtor] = {};
    memberIds.forEach((creditor) => {
      pairwiseMatrix[debtor][creditor] = 0;
    });
  });

  // Pairwise itemized history for breakdown UI
  // pairwiseHistory[debtor][creditor] = [ { expenseId, expenseName, date, amount, type } ]
  const pairwiseHistory = {};
  memberIds.forEach((u1) => {
    pairwiseHistory[u1] = {};
    memberIds.forEach((u2) => {
      pairwiseHistory[u1][u2] = [];
    });
  });

  // 1. Process Expenses
  expenses.forEach((expense) => {
    const payer = expense.paidBy;
    const splits = expense.splits || {};
    const amount = Number(expense.amount) || 0;

    if (totalPaid[payer] !== undefined) {
      totalPaid[payer] = roundToTwo(totalPaid[payer] + amount);
    }

    Object.entries(splits).forEach(([debtor, shareAmount]) => {
      const share = Number(shareAmount) || 0;
      if (totalShare[debtor] !== undefined) {
        totalShare[debtor] = roundToTwo(totalShare[debtor] + share);
      }

      if (debtor !== payer) {
        if (pairwiseMatrix[debtor] && pairwiseMatrix[debtor][payer] !== undefined) {
          pairwiseMatrix[debtor][payer] = roundToTwo(pairwiseMatrix[debtor][payer] + share);
          pairwiseHistory[debtor][payer].push({
            id: expense.id,
            name: expense.name,
            date: expense.date,
            amount: share,
            type: 'expense',
          });
        }
      }
    });
  });

  // 2. Process Payments (Simulated Settlements)
  payments.forEach((payment) => {
    if (payment.status === 'paid') {
      const { fromUser, toUser } = payment;
      const amount = Number(payment.amount) || 0;

      if (pairwiseMatrix[fromUser] && pairwiseMatrix[fromUser][toUser] !== undefined) {
        pairwiseMatrix[fromUser][toUser] = roundToTwo(pairwiseMatrix[fromUser][toUser] - amount);
        pairwiseHistory[fromUser][toUser].push({
          id: payment.id,
          name: payment.notes || 'Settlement Payment',
          date: payment.date,
          amount: -amount,
          type: 'payment',
        });
      }
    }
  });

  // 3. Compute Net Balances
  memberIds.forEach((id) => {
    let owes = 0;
    let isOwed = 0;
    memberIds.forEach((otherId) => {
      if (otherId !== id) {
        const netBetween = roundToTwo((pairwiseMatrix[id]?.[otherId] || 0) - (pairwiseMatrix[otherId]?.[id] || 0));
        if (netBetween > 0) {
          owes = roundToTwo(owes + netBetween);
        } else if (netBetween < 0) {
          isOwed = roundToTwo(isOwed + Math.abs(netBetween));
        }
      }
    });
    netBalances[id] = roundToTwo(isOwed - owes);
  });

  // 4. Generate direct pairwise summary
  const directDebts = [];
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const u1 = memberIds[i];
      const u2 = memberIds[j];

      const u1OwesU2 = pairwiseMatrix[u1]?.[u2] || 0;
      const u2OwesU1 = pairwiseMatrix[u2]?.[u1] || 0;
      const net = roundToTwo(u1OwesU2 - u2OwesU1);

      if (net > 0.01) {
        directDebts.push({
          fromUser: u1,
          toUser: u2,
          amount: net,
          history: pairwiseHistory[u1]?.[u2] || [],
        });
      } else if (net < -0.01) {
        directDebts.push({
          fromUser: u2,
          toUser: u1,
          amount: Math.abs(net),
          history: pairwiseHistory[u2]?.[u1] || [],
        });
      }
    }
  }

  return {
    totalPaid,
    totalShare,
    netBalances,
    directDebts,
    pairwiseHistory,
  };
};

export const calculateUserOverallSummary = (userId, allExpenses = [], allPayments = [], allGroups = []) => {
  let totalSpent = 0;
  let youOwe = 0;
  let youAreOwed = 0;
  const debtsByOtherUser = {}; // otherUserId -> amount (positive = they owe user, negative = user owes them)

  allGroups.forEach((group) => {
    const groupExpenses = allExpenses.filter((e) => e.groupId === group.id);
    const groupPayments = allPayments.filter((p) => p.groupId === group.id);
    const groupMembers = group.members || [];

    const balances = calculateGroupBalances(groupExpenses, groupPayments, groupMembers);

    // Add user's total share in this group to totalSpent
    const userShare = balances.totalShare[userId] || 0;
    totalSpent = roundToTwo(totalSpent + userShare);

    // Aggregate pairwise
    balances.directDebts.forEach((debt) => {
      if (debt.fromUser === userId) {
        // User owes to debt.toUser
        youOwe = roundToTwo(youOwe + debt.amount);
        debtsByOtherUser[debt.toUser] = roundToTwo((debtsByOtherUser[debt.toUser] || 0) - debt.amount);
      } else if (debt.toUser === userId) {
        // debt.fromUser owes user
        youAreOwed = roundToTwo(youAreOwed + debt.amount);
        debtsByOtherUser[debt.fromUser] = roundToTwo((debtsByOtherUser[debt.fromUser] || 0) + debt.amount);
      }
    });
  });

  const netBalance = roundToTwo(youAreOwed - youOwe);

  return {
    totalSpent,
    youOwe,
    youAreOwed,
    netBalance,
    debtsByOtherUser,
  };
};
