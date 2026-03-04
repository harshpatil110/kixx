/**
 * Format a number/string amount to Indian Rupees (INR)
 * Drops decimals for cleaner UI.
 * 
 * @param {number|string} amount 
 * @returns {string} Formatted price e.g., "₹ 15,499"
 */
export function formatPrice(amount) {
    if (amount === undefined || amount === null) return '';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Fallback if it's somehow not a valid number
    if (isNaN(numericAmount)) return String(amount);

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(numericAmount);
}
