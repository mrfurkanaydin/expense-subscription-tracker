export const EXPENSE_CATEGORIES = [
  "Yiyecek",
  "Ulaşım",
  "Alışveriş",
  "Faturalar",
  "Eğlence",
  "Sağlık",
  "Eğitim",
  "Diğer",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CURRENCIES = ["TRY", "USD", "EUR", "GBP"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const BILLING_PERIODS = ["monthly", "yearly"] as const;

export type BillingPeriod = (typeof BILLING_PERIODS)[number];

// Category colors for charts
export const CATEGORY_COLORS: Record<string, string> = {
  Yiyecek: "#22c55e",
  Ulaşım: "#3b82f6",
  Alışveriş: "#f59e0b",
  Faturalar: "#ef4444",
  Eğlence: "#8b5cf6",
  Sağlık: "#ec4899",
  Eğitim: "#06b6d4",
  Diğer: "#6b7280",
};

// Date range options for reports
export const DATE_RANGE_OPTIONS = [
  { value: "this-month", label: "Bu Ay" },
  { value: "last-3-months", label: "Son 3 Ay" },
  { value: "this-year", label: "Bu Yıl" },
  { value: "all-time", label: "Tüm Zamanlar" },
] as const;
