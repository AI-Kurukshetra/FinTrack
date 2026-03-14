/**
 * Format a number as INR currency with no fractional digits.
 */
export const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Format a date string into a short en-IN display.
 */
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * Return today's date in YYYY-MM-DD format.
 */
export const todayStr = () => new Date().toISOString().split("T")[0];