import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
  parseISO,
  isWithinInterval,
  eachMonthOfInterval,
  eachDayOfInterval,
} from "date-fns";
import { tr } from "date-fns/locale";
import type {
  Expense,
  Subscription,
  DateRange,
  CategoryData,
  MonthlyData,
  TrendData,
  ReportSummary,
} from "../types";
import { CATEGORY_COLORS } from "../constants";

/**
 * Filter expenses by date range
 */
export function filterByDateRange(
  expenses: Expense[],
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
): Expense[] {
  if (!expenses) return [];

  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (dateRange) {
    case "this-month":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case "last-3-months":
      start = startOfMonth(subMonths(now, 2));
      end = endOfMonth(now);
      break;
    case "this-year":
      start = startOfYear(now);
      break;
    case "custom":
      start = customStart || startOfMonth(now);
      end = customEnd || endOfMonth(now);
      break;
    case "all-time":
    default:
      return expenses;
  }

  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.created_at);
    return isWithinInterval(expenseDate, { start, end });
  });
}

/**
 * Group expenses by category and calculate totals
 */
export function groupByCategory(expenses: Expense[]): CategoryData[] {
  if (!expenses) return [];
  const grouped = expenses.reduce(
    (acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const total = Object.values(grouped).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CATEGORY_COLORS[category] || "#6b7280",
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Group expenses by month
 */
export function groupByMonth(
  expenses: Expense[],
  subscriptions: Subscription[],
  monthCount: number = 6
): MonthlyData[] {
  if (!expenses) expenses = [];
  if (!subscriptions) subscriptions = [];

  const now = new Date();
  const months = eachMonthOfInterval({
    start: subMonths(startOfMonth(now), monthCount - 1),
    end: endOfMonth(now),
  });

  return months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthKey = format(month, "yyyy-MM");
    const monthLabel = format(month, "MMM yyyy", { locale: tr });

    // Calculate expenses for this month
    const monthExpenses = expenses
      .filter((expense) => {
        const expenseDate = parseISO(expense.created_at);
        return isWithinInterval(expenseDate, {
          start: monthStart,
          end: monthEnd,
        });
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate subscription cost for this month
    const monthSubscriptions = subscriptions
      .filter((sub) => {
        const startDate = parseISO(sub.start_date);
        const endDate = sub.end_date ? parseISO(sub.end_date) : null;

        // Subscription started before or during this month
        const started = startDate <= monthEnd;

        // Subscription ended after or during this month (or hasn't ended)
        const notEnded = !endDate || endDate >= monthStart;

        return started && notEnded;
      })
      .reduce((sum, sub) => {
        if (sub.billing_period === "monthly") {
          return sum + sub.amount;
        } else if (sub.billing_period === "yearly") {
          // Check if billing month matches current month for yearly
          // Or just distribute / 12?
          // Previous logic was distributing / 12. Let's keep it distributed for smoothing?
          // "return sum + sub.amount / 12;"
          // Or should we show full amount in the billing month?
          // Usually easier to visualize monthly cost.
          // I will keep existing logic: Distribute yearly cost over months.
          return sum + sub.amount / 12;
        }
        return sum;
      }, 0);

    return {
      month: monthKey,
      monthLabel,
      expenses: monthExpenses,
      subscriptions: monthSubscriptions,
      total: monthExpenses + monthSubscriptions,
    };
  });
}

/**
 * Calculate daily trend data for expenses
 */
export function calculateTrendData(
  expenses: Expense[],
  dateRange: DateRange
): TrendData[] {
  if (!expenses) return [];
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (dateRange) {
    case "this-month":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case "last-3-months":
      start = startOfMonth(subMonths(now, 2));
      break;
    case "this-year":
      start = startOfYear(now);
      break;
    case "all-time":
    default:
      // For all-time, use the earliest expense date or 1 year ago
      const earliestExpense = expenses.reduce((earliest, expense) => {
        const expenseDate = parseISO(expense.created_at);
        return expenseDate < earliest ? expenseDate : earliest;
      }, now);
      start = earliestExpense;
      break;
  }

  // Group expenses by day
  const expensesByDay = expenses.reduce(
    (acc, expense) => {
      const dateKey = format(parseISO(expense.created_at), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Generate trend data
  const days = eachDayOfInterval({ start, end: end > now ? now : end });
  let cumulative = 0;

  return days.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const amount = expensesByDay[dateKey] || 0;
    cumulative += amount;

    return {
      date: dateKey,
      dateLabel: format(day, "d MMM", { locale: tr }),
      amount,
      cumulative,
    };
  });
}

/**
 * Calculate report summary
 */
export function calculateReportSummary(
  expenses: Expense[],
  subscriptions: Subscription[]
): ReportSummary {
  if (!expenses) expenses = [];
  if (!subscriptions) subscriptions = [];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const activeSubscriptions = subscriptions.filter((s) => s.active);
  const totalSubscriptions = activeSubscriptions.reduce((sum, s) => {
    if (s.billing_period === "monthly") {
      return sum + s.amount * 12;
    }
    return sum + s.amount;
  }, 0);

  // Calculate monthly average
  const months = new Set(
    expenses.map((e) => format(parseISO(e.created_at), "yyyy-MM"))
  );
  const averageMonthlyExpense =
    months.size > 0 ? totalExpenses / months.size : 0;

  // Find top category
  const categoryData = groupByCategory(expenses);
  const topCategory = categoryData[0]?.category || "Yok";
  const topCategoryAmount = categoryData[0]?.amount || 0;

  return {
    totalExpenses,
    totalSubscriptions,
    averageMonthlyExpense,
    topCategory,
    topCategoryAmount,
    expenseCount: expenses.length,
  };
}

/**
 * Get current month key
 */
export function getCurrentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}

/**
 * Format month key to display label
 */
export function formatMonthLabel(monthKey: string): string {
  const date = parseISO(`${monthKey}-01`);
  return format(date, "MMMM yyyy", { locale: tr });
}
