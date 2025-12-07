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
}

export interface DashboardStats {
  totalExpenses: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurring: number;
  yearlyRecurring: number;
}

