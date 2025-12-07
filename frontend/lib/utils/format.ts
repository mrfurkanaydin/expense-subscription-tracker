import type { Expense, Subscription } from "../types";

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} gün önce`;
  } else if (diffInDays === 0) {
    return "Bugün";
  } else if (diffInDays === 1) {
    return "Yarın";
  } else if (diffInDays <= 7) {
    return `${diffInDays} gün sonra`;
  } else {
    return formatDateShort(dateString);
  }
}

export function calculateTotalExpenses(expenses: Expense[] | null | undefined): number {
  if (!expenses || expenses.length === 0) return 0;
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateMonthlyRecurring(
  subscriptions: Subscription[] | null | undefined
): number {
  if (!subscriptions || subscriptions.length === 0) return 0;
  return subscriptions
    .filter((sub) => sub.active && sub.billing_period === "monthly")
    .reduce((sum, sub) => sum + sub.amount, 0);
}

export function calculateYearlyRecurring(
  subscriptions: Subscription[] | null | undefined
): number {
  if (!subscriptions || subscriptions.length === 0) return 0;
  const monthly = subscriptions
    .filter((sub) => sub.active && sub.billing_period === "monthly")
    .reduce((sum, sub) => sum + sub.amount * 12, 0);

  const yearly = subscriptions
    .filter((sub) => sub.active && sub.billing_period === "yearly")
    .reduce((sum, sub) => sum + sub.amount, 0);

  return monthly + yearly;
}

export function getUpcomingSubscriptions(
  subscriptions: Subscription[] | null | undefined,
  limit: number = 5
): Subscription[] {
  if (!subscriptions || subscriptions.length === 0) return [];
  const active = subscriptions.filter((sub) => sub.active);
  const sorted = [...active].sort(
    (a, b) =>
      new Date(a.next_billing_at).getTime() -
      new Date(b.next_billing_at).getTime()
  );
  return sorted.slice(0, limit);
}

