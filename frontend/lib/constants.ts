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

