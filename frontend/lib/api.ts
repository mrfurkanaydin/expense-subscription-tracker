import type {
  Expense,
  Subscription,
  User,
  CreateExpenseRequest,
  CreateSubscriptionRequest,
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

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>("/health");
}

