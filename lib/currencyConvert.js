import { convertCurrency, setApiKey } from "js-code-currency-converter";
import { getCurrencyFromLocale } from "./getCurrencyFromLocale";

let init = false;

export async function convertToUserCurrency(amount) {
  if (!init) {
    setApiKey('fca_live_x51LV098NfHZbie9N50v4rgvs999LjBjR8Oj0aFX');
    console.log("API KEY:", process.env.CURRENCY_CONVERTER_API_KEY);

    init = true;
  } 

  const userCurrency = getCurrencyFromLocale();
  if (userCurrency === 'BGN') {
    return amount;
  }

  const converted = await convertCurrency("BGN", userCurrency, amount);
  return converted;
}