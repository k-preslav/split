import * as Localization from 'expo-localization';
import { userDetails } from './userDetails';

export function getCurrencyFromLocale() {
  const currencyCode = Localization.getLocales()[0]?.currencyCode;
  userDetails._currency = currencyCode;

  return currencyCode.toUpperCase();
}

export const getSymbolOfPreferredCurrency = (currency=null) => {
  
  if (!currency) {
    currency = getCurrencyFromLocale();
  }
  
  if (currency === 'EUR') {
    return '€'
  } else if (currency === 'GBP') {
    return '£'
  } else if (currency === 'USD') {
    return '$'
  }

  return currency;
}