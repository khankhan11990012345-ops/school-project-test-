/**
 * Format amount as Pakistani Rupees (Rs)
 * @param amount - The amount to format
 * @returns Formatted string with Rs prefix
 */
export const formatCurrency = (amount: number): string => {
  return `Rs ${new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

