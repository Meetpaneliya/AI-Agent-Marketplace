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
  if (typeof window !== "undefined") {
    return localStorage.getItem("agentstore_token");
  }
  return (globalThis as any).__agentstore_token || null;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("agentstore_user");
    return user ? JSON.parse(user) : null;
  }
  return (globalThis as any).__agentstore_user || null;
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
  } else {
    (globalThis as any).__agentstore_token = data.data.token;
    (globalThis as any).__agentstore_user = data.data.user;
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

export enum ListingStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
  ARCHIVED = "ARCHIVED",
}

export interface SellerListingItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  setupGuide?: string;
  requiredKeys?: string;
  category: string;
  categorySlug?: string;
  platform: string;
  platformSlug?: string;
  price: number;
  pricingModel: string;
  totalSales: number;
  totalViews: number;
  avgRating: number;
  totalReviews: number;
  status: ListingStatus | string;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  approvedBy?: string;
  fileUrl?: string;
  scanStatus?: string;
  version?: string;
  updatedAt?: string;
  createdAt?: string;
  seller?: {
    id?: string;
    name?: string;
    email?: string;
    verified?: boolean;
  };
}

export async function fetchSellerListings(): Promise<SellerListingItem[]> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/agents/seller/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data?.listings)) {
      return data.data.listings;
    }
    return [];
  } catch (err) {
    console.error("fetchSellerListings error:", err);
    return [];
  }
}

export async function createAgentListing(payload: any): Promise<SellerListingItem> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please sign in to create a listing.");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/v1/agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (netErr: any) {
    throw new Error(
      "Unable to connect to the backend server. Please verify the API is running at " + API_BASE_URL
    );
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned HTTP ${res.status} response.`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || `Failed to create agent listing (HTTP ${res.status}).`);
  }
  return data.data.listing;
}

export async function updateAgentListing(id: string, payload: any): Promise<SellerListingItem> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please sign in to update this listing.");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/v1/agents/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (netErr: any) {
    throw new Error(
      "Unable to connect to the backend server. Please verify the API is running at " + API_BASE_URL
    );
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned HTTP ${res.status} response.`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || `Failed to update agent listing (HTTP ${res.status}).`);
  }
  return data.data.listing;
}

export async function fetchAdminReviewQueue(statusFilter?: string): Promise<SellerListingItem[]> {
  try {
    const token = getAuthToken();
    const url = statusFilter && statusFilter !== "all"
      ? `${API_BASE_URL}/v1/admin/reviews?status=${statusFilter}`
      : `${API_BASE_URL}/v1/admin/reviews`;

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data?.listings)) {
      return data.data.listings;
    }
    return [];
  } catch (err) {
    console.error("fetchAdminReviewQueue error:", err);
    return [];
  }
}

export async function approveAgentListing(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/v1/admin/reviews/${id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to approve listing.");
  }
}

export async function rejectAgentListing(id: string, rejectionReason: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/v1/admin/reviews/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ rejectionReason }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to reject listing.");
  }
}


