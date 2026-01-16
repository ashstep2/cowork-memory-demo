/**
 * Utility functions for formatting numbers and currency
 */

/**
 * Format a number as currency with appropriate magnitude suffix (K, M)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$5.0M", "$250K", "$500")
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

/**
 * Format a decimal as a percentage
 * @param decimal - The decimal value to format (e.g., 0.15 for 15%)
 * @returns Formatted percentage string (e.g., "15%")
 */
export function formatPercent(decimal: number): string {
  return `${(decimal * 100).toFixed(0)}%`;
}
