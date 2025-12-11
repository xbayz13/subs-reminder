/**
 * API Client Utilities
 * 
 * Helper functions for making API requests
 */

const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

/**
 * Make API request with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include", // Include cookies for session
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || "Request failed",
        details: data.details,
      };
    }

    return { data };
  } catch (error) {
    return {
      error: "Network error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  return apiRequest<{
    uuid: string;
    email: string;
    name: string;
    avatar?: string | null;
    googleId: string;
  }>("/auth/me");
}

/**
 * Update current user profile
 */
export async function updateUserProfile(data: {
  name?: string;
  avatar?: string | null;
  country?: string | null;
  currency?: string;
  birthdate?: string | null;
}) {
  return apiRequest("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Login with Google
 */
export function loginWithGoogle() {
  window.location.href = "/auth/google";
}

/**
 * Logout
 */
export async function logout() {
  return apiRequest("/auth/logout", { method: "POST" });
}

/**
 * Get dashboard data
 */
export async function getDashboardData() {
  return apiRequest(`/api/dashboard`);
}

/**
 * Get subscriptions
 */
export async function getSubscriptions(activeOnly: boolean = false) {
  return apiRequest(`/api/subscriptions?activeOnly=${activeOnly}`);
}

/**
 * Create subscription
 */
export async function createSubscription(data: any) {
  return apiRequest("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update subscription
 */
export async function updateSubscription(id: string, data: any) {
  return apiRequest(`/api/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete subscription
 */
export async function deleteSubscription(id: string) {
  return apiRequest(`/api/subscriptions/${id}`, {
    method: "DELETE",
  });
}

/**
 * Get installments
 */
export async function getInstallments() {
  return apiRequest(`/api/installments`);
}

/**
 * Mark installment as paid
 */
export async function markInstallmentAsPaid(id: string) {
  return apiRequest(`/api/installments/${id}/paid`, {
    method: "PUT",
  });
}

/**
 * Confirm payment from calendar link
 */
export async function confirmPaymentFromLink(link: string) {
  return apiRequest("/api/installments/confirm", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
}

