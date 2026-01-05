export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  credit_card_id?: string | null;
  credit_card_name?: string | null;
  payment_method: "cash" | "debit_card" | "credit_card";
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
  credit_card_id?: string | null;
  credit_card_name?: string | null;
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
  credit_card_id?: string;
  payment_method: "cash" | "debit_card" | "credit_card";
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
  credit_card_id?: string;
}

export interface UpdateExpenseRequest {
  id: string;
  title?: string;
  amount?: number;
  currency?: string;
  category?: string;
  credit_card_id?: string;
  payment_method?: "cash" | "debit_card" | "credit_card";
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
  credit_card_id?: string;
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

// Credit Card and Debt types
export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  bank_name?: string | null;
  last_four_digits?: string | null;
  statement_day?: number | null;
  due_day?: number | null;
  credit_limit?: number | null;
  currency: string;
  color: string;
  active: boolean;
  created_at: string;
  total_debt?: number;
}

export interface Debt {
  id: string;
  user_id: string;
  credit_card_id?: string | null;
  credit_card_name?: string | null;
  title: string;
  description?: string | null;
  total_amount: number;
  remaining_amount: number;
  currency: string;
  installment_count: number;
  paid_installments: number;
  installment_amount?: number | null;
  installment_type: "fixed" | "decreasing";
  first_payment_date: string;
  next_payment_date: string;
  notes?: string | null;
  status: "active" | "paid" | "cancelled";
  created_at: string;
}

export interface DebtSummary {
  total_debt: number;
  total_monthly_payment: number;
  active_debts_count: number;
  total_installments: number;
  paid_installments: number;
}

export interface CreateCreditCardRequest {
  user_id: string;
  name: string;
  bank_name?: string;
  last_four_digits?: string;
  statement_day?: number;
  due_day?: number;
  credit_limit?: number;
  currency: string;
  color: string;
}

export interface UpdateCreditCardRequest {
  id: string;
  name?: string;
  bank_name?: string;
  last_four_digits?: string;
  statement_day?: number;
  due_day?: number;
  credit_limit?: number;
  currency?: string;
  color?: string;
  active?: boolean;
}

export interface CreateDebtRequest {
  user_id: string;
  credit_card_id?: string;
  title: string;
  description?: string;
  total_amount: number;
  currency: string;
  installment_count: number;
  installment_type: "fixed" | "decreasing";
  first_payment_date: string;
  notes?: string;
}

export interface UpdateDebtRequest {
  id: string;
  credit_card_id?: string;
  title?: string;
  description?: string;
  installment_type?: "fixed" | "decreasing";
  notes?: string;
  status?: "active" | "paid" | "cancelled";
}

// Income types
export interface Income {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  is_recurring: boolean;
  recurring_period?: string | null;
  income_date: string;
  notes?: string | null;
  created_at: string;
}

export interface IncomeSummary {
  total_income: number;
  monthly_recurring: number;
  this_month_income: number;
  income_count: number;
  top_category: string;
  top_category_amount: number;
}

export interface CreateIncomeRequest {
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  is_recurring: boolean;
  recurring_period?: string;
  income_date: string;
  notes?: string;
}

export interface UpdateIncomeRequest {
  id: string;
  title?: string;
  amount?: number;
  currency?: string;
  category?: string;
  is_recurring?: boolean;
  recurring_period?: string;
  income_date?: string;
  notes?: string;
}

export const INCOME_CATEGORIES = [
  "Maaş",
  "Freelance",
  "Kira Geliri",
  "Yatırım Getirisi",
  "Satış Geliri",
  "Hediye/Transfer",
  "Diğer",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
