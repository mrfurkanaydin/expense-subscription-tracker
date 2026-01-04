import type { Investment, CreateInvestmentRequest } from "../types/investments";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Update request type
export interface UpdateInvestmentRequest {
  quantity?: number;
  purchase_price?: number;
  purchase_currency?: string;
  purchase_date?: string;
  notes?: string;
}

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

// Get all investments for a user
export async function getInvestments(userId: string): Promise<Investment[]> {
  return fetchAPI<Investment[]>(`/investments?user_id=${userId}`);
}

// Get investments by type
export async function getInvestmentsByType(
  userId: string,
  type: string
): Promise<Investment[]> {
  return fetchAPI<Investment[]>(`/investments?user_id=${userId}&type=${type}`);
}

// Create a new investment
export async function createInvestment(
  data: CreateInvestmentRequest
): Promise<Investment> {
  return fetchAPI<Investment>("/investments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Update an investment
export async function updateInvestment(
  id: string,
  data: UpdateInvestmentRequest
): Promise<Investment> {
  return fetchAPI<Investment>(`/investments?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Delete an investment
export async function deleteInvestment(
  id: string
): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(`/investments?id=${id}`, {
    method: "DELETE",
  });
}
