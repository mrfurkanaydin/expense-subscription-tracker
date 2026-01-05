import type {
  Expense,
  Subscription,
  User,
  CreateExpenseRequest,
  CreateSubscriptionRequest,
  UpdateExpenseRequest,
  UpdateSubscriptionRequest,
  CreditCard,
  Debt,
  DebtSummary,
  CreateCreditCardRequest,
  UpdateCreditCardRequest,
  CreateDebtRequest,
  UpdateDebtRequest,
  Income,
  IncomeSummary,
  CreateIncomeRequest,
  UpdateIncomeRequest,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Users API
export async function createUser(email: string): Promise<User> {
  return fetchAPI<User>("/users", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await fetchAPI<User>(`/users?email=${encodeURIComponent(email)}`);
  } catch (error) {
    // User not found
    return null;
  }
}

// Expenses API
export async function getExpenses(userId: string): Promise<Expense[]> {
  return fetchAPI<Expense[]>(`/expenses?user_id=${userId}`);
}

export async function createExpense(
  data: CreateExpenseRequest
): Promise<Expense> {
  return fetchAPI<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateExpense(
  data: UpdateExpenseRequest
): Promise<Expense> {
  return fetchAPI<Expense>(`/expenses?id=${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  return fetchAPI<void>(`/expenses?id=${id}`, {
    method: "DELETE",
  });
}

// Subscriptions API
export async function getSubscriptions(
  userId: string
): Promise<Subscription[]> {
  return fetchAPI<Subscription[]>(`/subscriptions?user_id=${userId}`);
}

export async function createSubscription(
  data: CreateSubscriptionRequest
): Promise<Subscription> {
  return fetchAPI<Subscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSubscription(
  data: UpdateSubscriptionRequest
): Promise<Subscription> {
  return fetchAPI<Subscription>(`/subscriptions?id=${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSubscription(id: string): Promise<void> {
  return fetchAPI<void>(`/subscriptions?id=${id}`, {
    method: "DELETE",
  });
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>("/health");
}

// Credit Cards API
export async function getCreditCards(userId: string): Promise<CreditCard[]> {
  return fetchAPI<CreditCard[]>(`/credit-cards?user_id=${userId}`);
}

export async function createCreditCard(
  data: CreateCreditCardRequest
): Promise<CreditCard> {
  return fetchAPI<CreditCard>("/credit-cards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCreditCard(
  data: UpdateCreditCardRequest
): Promise<CreditCard> {
  return fetchAPI<CreditCard>(`/credit-cards?id=${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCreditCard(id: string): Promise<void> {
  return fetchAPI<void>(`/credit-cards?id=${id}`, {
    method: "DELETE",
  });
}

// Debts API
export async function getDebts(userId: string): Promise<Debt[]> {
  return fetchAPI<Debt[]>(`/debts?user_id=${userId}`);
}

export async function getDebtSummary(userId: string): Promise<DebtSummary> {
  return fetchAPI<DebtSummary>(`/debts/summary?user_id=${userId}`);
}

export async function createDebt(data: CreateDebtRequest): Promise<Debt> {
  return fetchAPI<Debt>("/debts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDebt(data: UpdateDebtRequest): Promise<Debt> {
  return fetchAPI<Debt>(`/debts?id=${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDebt(id: string): Promise<void> {
  return fetchAPI<void>(`/debts?id=${id}`, {
    method: "DELETE",
  });
}

export async function payInstallment(id: string): Promise<Debt> {
  return fetchAPI<Debt>(`/debts/pay?id=${id}`, {
    method: "POST",
  });
}

// Incomes API
export async function getIncomes(userId: string): Promise<Income[]> {
  return fetchAPI<Income[]>(`/incomes?user_id=${userId}`);
}

export async function getIncomeSummary(userId: string): Promise<IncomeSummary> {
  return fetchAPI<IncomeSummary>(`/incomes/summary?user_id=${userId}`);
}

export async function createIncome(data: CreateIncomeRequest): Promise<Income> {
  return fetchAPI<Income>("/incomes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateIncome(data: UpdateIncomeRequest): Promise<Income> {
  return fetchAPI<Income>(`/incomes?id=${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteIncome(id: string): Promise<void> {
  return fetchAPI<void>(`/incomes?id=${id}`, {
    method: "DELETE",
  });
}
