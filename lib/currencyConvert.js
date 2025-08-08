import { convertCurrency, setApiKey } from "js-code-currency-converter";
import { getCurrencyFromLocale } from "./getCurrencyFromLocale";

let init = false;

export function initCurrencyConverter(apiKey) {
  if (!init) {
    setApiKey(apiKey);
    console.log("Currency converter initialized");
    init = true;
  }
}

// `${amount}_${currency}`
const conversionCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function convertToUserCurrency(amount) {
  if (!init) {
    console.error("Currency converter not initialized. Call initCurrencyConverter first.");
    return null;
  }

  const userCurrency = getCurrencyFromLocale();

  if (userCurrency === 'BGN') {
    return amount;
  }

  const cacheKey = `${amount}_${userCurrency}`;
  const cached = conversionCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  const converted = await convertCurrency("BGN", userCurrency, amount);

  conversionCache.set(cacheKey, { value: converted, timestamp: now });

  return converted;
}