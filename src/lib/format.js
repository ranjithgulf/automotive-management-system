export function money(value, compact = false) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0, ...(compact ? { notation: "compact", maximumFractionDigits: 2 } : {}) }).format(value);
}

export function percentage(value, target) {
  return Math.round((value / target) * 100);
}
