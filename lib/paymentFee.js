const STRIPE_PERCENT_FEE = 0.015;
const STRIPE_FIXED_FEE_BGN = 0.50;

const APP_PERCENT_FEE = 0.015;
const APP_FIXED_FEE_BGN = 0.15;

// Stripe Fee
export function calculateStripeFee(amount) {
  const percentageFee = amount * STRIPE_PERCENT_FEE;
  const totalFee = percentageFee + STRIPE_FIXED_FEE_BGN;
  return Number(totalFee.toFixed(2));
}

// Your App's Fee
export function calculateSplitAppFee(amount) {
  const percentageFee = amount * APP_PERCENT_FEE;
  const totalFee = percentageFee + APP_FIXED_FEE_BGN;
  return Number(totalFee.toFixed(2));
}

// Total Payment User Must Pay
export function calculateTotalPaymentAmount(originalAmount) {
  const stripeFee = calculateStripeFee(originalAmount);
  const appFee = calculateSplitAppFee(originalAmount);
  const total = originalAmount + stripeFee + appFee;
  return Number(total.toFixed(2));
}

export function calculateProfit(originalAmount) {
  const appFee = originalAmount * APP_PERCENT_FEE + APP_FIXED_FEE_BGN;

  const grossAmount = (originalAmount + STRIPE_FIXED_FEE_BGN + appFee) / (1 - STRIPE_PERCENT_FEE);
  const stripeFee = grossAmount * STRIPE_PERCENT_FEE + STRIPE_FIXED_FEE_BGN;

  const stripeCutOnAppFee = appFee * STRIPE_PERCENT_FEE;

  const profit = appFee - stripeCutOnAppFee;
  return Number(profit.toFixed(2));
}