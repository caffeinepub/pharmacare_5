// Convert nanosecond bigint to milliseconds
export const nsToMs = (ns: bigint): number => Number(ns) / 1_000_000;

// Convert nanosecond bigint to Date
export const nsToDate = (ns: bigint): Date => new Date(nsToMs(ns));

// Convert Date/ms to nanosecond bigint
export const msToNs = (ms: number): bigint =>
  BigInt(Math.floor(ms)) * BigInt(1_000_000);

// Format a bigint nanosecond timestamp to locale date string
export const formatDate = (ns: bigint): string => {
  return nsToDate(ns).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format a bigint nanosecond timestamp to locale datetime string
export const formatDateTime = (ns: bigint): string => {
  return nsToDate(ns).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Days until expiry (positive = future, negative = past)
export const daysUntilExpiry = (expiryNs: bigint): number => {
  const ms = nsToMs(expiryNs);
  const now = Date.now();
  return Math.ceil((ms - now) / (1000 * 60 * 60 * 24));
};

// Expiry urgency level
export const expiryUrgency = (
  expiryNs: bigint,
): "expired" | "critical" | "warning" | "caution" | "ok" => {
  const days = daysUntilExpiry(expiryNs);
  if (days <= 0) return "expired";
  if (days <= 30) return "critical";
  if (days <= 60) return "warning";
  if (days <= 90) return "caution";
  return "ok";
};

// Format currency
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount,
  );

// Date input value to nanosecond bigint
export const dateInputToNs = (dateStr: string): bigint => {
  return msToNs(new Date(dateStr).getTime());
};

// Nanosecond bigint to date input value (YYYY-MM-DD)
export const nsToDateInput = (ns: bigint): string => {
  const d = nsToDate(ns);
  return d.toISOString().split("T")[0];
};
