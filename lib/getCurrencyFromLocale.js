import * as Localization from 'expo-localization';

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