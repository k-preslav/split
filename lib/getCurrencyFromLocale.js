import * as Localization from 'expo-localization';
import { userDetails } from './userDetails';

export function getCurrencyFromLocale() {
  const currencyCode = Localization.getLocales()[0]?.currencyCode;
  userDetails._currency = currencyCode;

  return currencyCode;
}

export const getSymbolOfPreferredCurrency = () => {  
  const currency = userDetails._currency;
  if (!currency) getCurrencyFromLocale();

  if (currency === 'EUR') {
    return '€'
  } else if (currency === 'GBP') {
    return '£'
  } else if (currency === 'USD') {
    return '$'
  }

  return currency;
}