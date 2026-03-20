/**
 * Get the unit label and suffix for annual turnover based on currency.
 * INR uses Crores (Cr), all others use Millions (M).
 */
export const getTurnoverUnit = (currency: string): { label: string; suffix: string } => {
  if (currency === 'INR') {
    return { label: 'Crores', suffix: 'Cr' };
  }
  return { label: 'Million', suffix: 'M' };
};

/**
 * Get turnover dropdown options based on selected currency.
 * Ranges are the same; labels change based on currency unit.
 */
export const getTurnoverOptions = (currency: string): { value: string; label: string }[] => {
  const { suffix } = getTurnoverUnit(currency);
  const currencyLabel = currency || '';

  const ranges = [
    { min: '0', max: '10' },
    { min: '10', max: '100' },
    { min: '100', max: '10000' },
    { min: '10000', max: '+' },
  ];

  return ranges.map(({ min, max }) => {
    const rangeStr = max === '+' ? `${min}+` : `${min}-${max}`;
    const displayLabel = currencyLabel
      ? (max === '+' ? `${min}+ ${suffix} ${currencyLabel}` : `${min}-${max} ${suffix} ${currencyLabel}`)
      : rangeStr;
    // Store as pipe-delimited: range|unit|currency
    const value = currencyLabel ? `${rangeStr}|${suffix}|${currencyLabel}` : rangeStr;
    return { value, label: displayLabel };
  });
};

/**
 * Get the display label for a stored turnover value.
 * Handles both old format (plain text) and new pipe-delimited format.
 */
export const formatTurnoverDisplay = (stored: string): string => {
  if (!stored) return '';
  const parts = stored.split('|');
  if (parts.length === 3) {
    const [range, suffix, currency] = parts;
    return `${range} ${suffix} ${currency}`;
  }
  return stored;
};
