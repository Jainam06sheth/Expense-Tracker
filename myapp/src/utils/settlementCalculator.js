/**
 * Settlement Calculator
 * Computes optimized settlement transactions using a greedy debt-simplification graph algorithm.
 */

const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateOptimizedSettlements = (netBalances = {}, membersMap = {}) => {
  const debtors = [];
  const creditors = [];

  Object.entries(netBalances).forEach(([userId, balance]) => {
    const rounded = roundToTwo(balance);
    if (rounded < -0.01) {
      debtors.push({ id: userId, balance: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ id: userId, balance: rounded });
    }
  });

  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const transactions = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];

    const amountToSettle = roundToTwo(Math.min(debtor.balance, creditor.balance));

    if (amountToSettle > 0.01) {
      transactions.push({
        id: `plan-${debtor.id}-${creditor.id}-${transactions.length + 1}`,
        fromUser: debtor.id,
        fromUserName: membersMap[debtor.id]?.name || debtor.id,
        toUser: creditor.id,
        toUserName: membersMap[creditor.id]?.name || creditor.id,
        amount: amountToSettle,
        status: 'pending',
      });
    }

    debtor.balance = roundToTwo(debtor.balance - amountToSettle);
    creditor.balance = roundToTwo(creditor.balance - amountToSettle);

    if (debtor.balance <= 0.01) {
      dIndex++;
    }
    if (creditor.balance <= 0.01) {
      cIndex++;
    }
  }

  return transactions;
};
