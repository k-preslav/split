export function calculateStripeFee(amount) {
  const percentageFee = amount * 0.015;
  const fixedFee = 0.50;
  const totalFee = percentageFee + fixedFee;

  return Number(totalFee.toFixed(2));
}

export function calculateSplitAppFee(amount) {
  const percentageFee = amount * 0.025;
  const fixedFee = 0.65;
  const totalFee = percentageFee + fixedFee;

  return Number(totalFee.toFixed(2));
}

export function calculateTotalPaymentAmount(originalAmount) {
  const splitAppFee = calculateSplitAppFee(originalAmount);
  const totalPaymentAmount = originalAmount + splitAppFee;

  return Number(totalPaymentAmount.toFixed(2));
}