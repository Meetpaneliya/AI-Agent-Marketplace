export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isSeller: boolean;
  avatarUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("agentstore_token");
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("agentstore_user");
  return user ? JSON.parse(user) : null;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Invalid email or password");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("agentstore_token", data.data.token);
    localStorage.setItem("agentstore_user", JSON.stringify(data.data.user));
    document.cookie = `agentstore_token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`;
  }

  return data.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: "BUYER" | "SELLER" = "BUYER"
) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      isSeller: role === "SELLER",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Registration failed. Please try again.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("agentstore_token", data.data.token);
    localStorage.setItem("agentstore_user", JSON.stringify(data.data.user));
    document.cookie = `agentstore_token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`;
  }

  return data.data;
}

export async function upgradeToSeller() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please log in to become a seller");
  }

  const res = await fetch(`${API_BASE_URL}/v1/auth/upgrade-to-seller`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to upgrade to seller account.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("agentstore_token", data.data.token);
    localStorage.setItem("agentstore_user", JSON.stringify(data.data.user));
  }

  return data.data;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("agentstore_token");
    localStorage.removeItem("agentstore_user");
    document.cookie = "agentstore_token=; path=/; max-age=0";
    window.location.href = "/login";
  }
}
