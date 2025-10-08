/**
 * Utility functions for consistent price formatting across the application
 */

/**
 * Formats a price value to always show 2 decimal places
 * @param {number|string} price - The price value to format
 * @param {string} currency - The currency symbol (default: '$')
 * @returns {string} Formatted price string (e.g., "$95.00")
 */
export function formatPrice(price, currency = '$') {
  if (price === null || price === undefined || price === '') {
    return 'N/A';
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return 'N/A';
  }
  
  return `${currency}${numericPrice.toFixed(2)}`;
}

/**
 * Formats a price from Shopify MoneyV2 object
 * @param {Object} money - Shopify MoneyV2 object with amount and currencyCode
 * @returns {string} Formatted price string
 */
export function formatShopifyPrice(money) {
  if (!money || !money.amount) {
    return 'N/A';
  }
  
  const currency = money.currencyCode === 'USD' ? '$' : money.currencyCode;
  return formatPrice(money.amount, currency);
}

/**
 * Formats a price for display in templates (removes $ prefix for template literals)
 * @param {number|string} price - The price value to format
 * @returns {string} Formatted price string without currency symbol (e.g., "95.00")
 */
export function formatPriceForTemplate(price) {
  if (price === null || price === undefined || price === '') {
    return '0.00';
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '0.00';
  }
  
  return numericPrice.toFixed(2);
}
