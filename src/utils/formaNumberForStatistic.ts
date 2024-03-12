export const formatNumber = (num: string) => {
  const decimalIndex = num.indexOf('.');
  if (decimalIndex !== -1) {
    const decimalPart = num.substring(decimalIndex + 1);

    if (/^0+$/.test(decimalPart)) {
      return Number(num.substring(0, decimalIndex)).toFixed(2);
    }
  }

  return Number(num).toFixed(2);
}
