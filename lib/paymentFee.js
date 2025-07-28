export function calculateStripeFee(amount) {
  const percentageFee = amount * 0.015;
  const fixedFee = 0.50;
  const totalFee = percentageFee + fixedFee;

  return Number(totalFee.toFixed(2));
}

export function calculateSplitAppFee(amount) {
  const percentageFee = amount * 0.015;
  const fixedFee = 0.15;
  const totalFee = percentageFee + fixedFee;

  return Number(totalFee.toFixed(2));
}

export function calculateTotalPaymentAmount(originalAmount) {
  const stripeFee = calculateStripeFee(originalAmount);
  const splitAppFee = calculateSplitAppFee(originalAmount);

  const totalFee = stripeFee + splitAppFee;
  const totalPaymentAmount = originalAmount + totalFee;

  return Number(totalPaymentAmount.toFixed(2));
}