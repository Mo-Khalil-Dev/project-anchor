export const formatCurrency = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  return amount.toLocaleString('en-GB', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};
