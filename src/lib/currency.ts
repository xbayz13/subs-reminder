/**
 * Currency formatting utilities
 * 
 * Provides functions to format currency based on currency code
 */

export type CurrencyCode = "IDR" | "USD" | "EUR" | "GBP" | "SGD" | "MYR" | "JPY" | "AUD";

interface CurrencyInfo {
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

const currencyMap: Record<CurrencyCode, CurrencyInfo> = {
  IDR: { symbol: "Rp", locale: "id-ID", decimalPlaces: 0 },
  USD: { symbol: "$", locale: "en-US", decimalPlaces: 2 },
  EUR: { symbol: "€", locale: "de-DE", decimalPlaces: 2 },
  GBP: { symbol: "£", locale: "en-GB", decimalPlaces: 2 },
  SGD: { symbol: "S$", locale: "en-SG", decimalPlaces: 2 },
  MYR: { symbol: "RM", locale: "ms-MY", decimalPlaces: 2 },
  JPY: { symbol: "¥", locale: "ja-JP", decimalPlaces: 0 },
  AUD: { symbol: "A$", locale: "en-AU", decimalPlaces: 2 },
};

/**
 * Format price with currency symbol
 * 
 * @param price - The price value (number or string)
 * @param currency - Currency code (default: IDR)
 * @returns Formatted price string with currency symbol
 * 
 * @example
 * formatCurrency(100000, "IDR") // "Rp 100.000"
 * formatCurrency(99.99, "USD") // "$99.99"
 * formatCurrency(1000, "JPY") // "¥1,000"
 */
export function formatCurrency(price: number | string, currency: CurrencyCode = "IDR"): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return "0";
  }

  const currencyInfo = currencyMap[currency] || currencyMap.IDR;
  
  // For IDR, use Indonesian number formatting
  if (currency === "IDR") {
    const formatted = Math.round(numPrice).toLocaleString("id-ID");
    return `${currencyInfo.symbol} ${formatted}`;
  }
  
  // For JPY, no decimals
  if (currency === "JPY") {
    const formatted = Math.round(numPrice).toLocaleString(currencyInfo.locale);
    return `${currencyInfo.symbol}${formatted}`;
  }
  
  // For other currencies, use standard formatting
  const formatted = numPrice.toLocaleString(currencyInfo.locale, {
    minimumFractionDigits: currencyInfo.decimalPlaces,
    maximumFractionDigits: currencyInfo.decimalPlaces,
  });
  
  return `${currencyInfo.symbol}${formatted}`;
}

/**
 * Get currency symbol only
 * 
 * @param currency - Currency code (default: IDR)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode = "IDR"): string {
  return currencyMap[currency]?.symbol || currencyMap.IDR.symbol;
}

