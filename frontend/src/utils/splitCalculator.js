/**
 * Split Calculator Utilities
 * Handles Equal Split, Item-Based Split, and Custom Split calculations with precision.
 */

const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateEqualSplit = (totalAmount, participantIds) => {
  if (!participantIds || participantIds.length === 0 || !totalAmount) {
    return {};
  }

  const count = participantIds.length;
  const baseShare = Math.floor((totalAmount / count) * 100) / 100;
  let remainder = roundToTwo(totalAmount - baseShare * count);

  const splits = {};
  participantIds.forEach((id) => {
    // Distribute remainder cents/paise 1 by 1 to first members to make exact sum
    if (remainder > 0.009) {
      splits[id] = roundToTwo(baseShare + 0.01);
      remainder = roundToTwo(remainder - 0.01);
    } else {
      splits[id] = baseShare;
    }
  });

  return splits;
};

export const calculateItemBasedSplit = (items = []) => {
  const aggregatedSplits = {};

  items.forEach((item) => {
    const itemAmount = Number(item.amount) || 0;
    const participants = item.participants || [];

    if (participants.length > 0 && itemAmount > 0) {
      const itemSplits = calculateEqualSplit(itemAmount, participants);
      Object.entries(itemSplits).forEach(([userId, share]) => {
        aggregatedSplits[userId] = roundToTwo((aggregatedSplits[userId] || 0) + share);
      });
    }
  });

  return aggregatedSplits;
};

export const validateSplits = (totalAmount, splits = {}) => {
  const total = Number(totalAmount) || 0;
  const sumOfSplits = Object.values(splits).reduce((acc, val) => acc + (Number(val) || 0), 0);
  const roundedSum = roundToTwo(sumOfSplits);
  const roundedTotal = roundToTwo(total);
  const diff = roundToTwo(roundedTotal - roundedSum);

  return {
    isValid: Math.abs(diff) < 0.01,
    difference: diff,
    sum: roundedSum,
    expected: roundedTotal,
  };
};
