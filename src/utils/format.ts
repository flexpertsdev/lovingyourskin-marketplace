export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencySymbols: Record<string, string> = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    CHF: 'CHF '
  };

  const symbol = currencySymbols[currency] || currency + ' ';
  return `${symbol}${amount.toFixed(2)}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-GB');
};