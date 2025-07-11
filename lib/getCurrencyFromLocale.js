import * as Localization from 'expo-localization';
import { userDetails } from './userDetails';

export async function guessPreferredCurrency() {
  const currencyCode = Localization.getLocales()[0]?.currencyCode;

  switch (currencyCode) {
    case 'USD':
      return 'USD';
    case 'GBP':
      return 'GBP';
    case 'EUR':
      return 'EUR';
    default:
      return 'USD';
  }
}

export const getSymbolOfPreferredCurrency = () => {
  if (userDetails.userProfile.preferredCurrency === 'EUR') {
    return '€'
  } else if (userDetails.userProfile.preferredCurrency === 'GBP') {
    return '£'
  } else {
    return '$'
  }
}