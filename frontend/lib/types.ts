export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  billing_period: "monthly" | "yearly";
  next_billing_at: string;
  start_date: string;
  end_date?: string | null;
  active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CreateExpenseRequest {
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
}

export interface CreateSubscriptionRequest {
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  billing_period: "monthly" | "yearly";
  next_billing_at: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateExpenseRequest {
  id: string;
  title?: string;
  amount?: number;
  currency?: string;
  category?: string;
}

export interface UpdateSubscriptionRequest {
  id: string;
  title?: string;
  amount?: number;
  currency?: string;
  billing_period?: "monthly" | "yearly";
  next_billing_at?: string;
  start_date?: string;
  end_date?: string | null;
  active?: boolean;
}

export interface DashboardStats {
  totalExpenses: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurring: number;
  yearlyRecurring: number;
}

// Reporting types
export type DateRange =
  | "this-month"
  | "last-3-months"
  | "this-year"
  | "all-time"
  | "custom";

export interface Budget {
  id: string;
  userId: string;
  month: string; // "2026-01" format
  totalBudget: number;
  categoryBudgets?: Record<string, number>;
  createdAt: string;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  monthLabel: string;
  expenses: number;
  subscriptions: number;
  total: number;
}

export interface TrendData {
  date: string;
  dateLabel: string;
  amount: number;
  cumulative: number;
}

export interface ReportSummary {
  totalExpenses: number;
  totalSubscriptions: number;
  averageMonthlyExpense: number;
  topCategory: string;
  topCategoryAmount: number;
  expenseCount: number;
}
