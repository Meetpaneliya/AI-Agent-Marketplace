// ─── User Roles ───
export const USER_ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Seller Tiers ───
export const SELLER_TIERS = {
  NEW: "new",
  VERIFIED: "verified",
  TRUSTED: "trusted",
} as const;

export type SellerTier = (typeof SELLER_TIERS)[keyof typeof SELLER_TIERS];

// ─── Listing Status ───
export const LISTING_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
} as const;

export type ListingStatus =
  (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

// ─── Scan Status ───
export const SCAN_STATUS = {
  PENDING: "pending",
  SCANNING: "scanning",
  PASSED: "passed",
  FAILED: "failed",
} as const;

export type ScanStatus = (typeof SCAN_STATUS)[keyof typeof SCAN_STATUS];

// ─── Purchase Status ───
export const PURCHASE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  FAILED: "failed",
} as const;

export type PurchaseStatus =
  (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS];

// ─── Subscription Status ───
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
  PAST_DUE: "past_due",
  EXPIRED: "expired",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// ─── Dispute Status ───
export const DISPUTE_STATUS = {
  OPEN: "open",
  SELLER_RESPONDED: "seller_responded",
  ESCALATED: "escalated",
  RESOLVED_REFUND: "resolved_refund",
  RESOLVED_NO_REFUND: "resolved_no_refund",
  RESOLVED_PARTIAL: "resolved_partial",
  WITHDRAWN: "withdrawn",
} as const;

export type DisputeStatus =
  (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

// ─── Payout Status ───
export const PAYOUT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type PayoutStatus = (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];

// ─── License Types ───
export const LICENSE_TYPES = {
  PERSONAL: "personal",
  COMMERCIAL: "commercial",
  EXTENDED: "extended",
} as const;

export type LicenseType = (typeof LICENSE_TYPES)[keyof typeof LICENSE_TYPES];

// ─── Account Status ───
export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

// ─── Notification Types ───
export const NOTIFICATION_TYPES = {
  SALE: "sale",
  PURCHASE: "purchase",
  REVIEW: "review",
  LISTING_APPROVED: "listing_approved",
  LISTING_REJECTED: "listing_rejected",
  REFUND_REQUEST: "refund_request",
  REFUND_APPROVED: "refund_approved",
  DISPUTE_ESCALATED: "dispute_escalated",
  PAYOUT: "payout",
  VERSION_UPDATE: "version_update",
  SUPPORT_MESSAGE: "support_message",
  SUBSCRIPTION_RENEWAL: "subscription_renewal",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ─── Categories ───
export const DEFAULT_CATEGORIES = [
  { name: "Sales & CRM", slug: "sales-crm", icon: "💼" },
  { name: "Customer Support", slug: "customer-support", icon: "🎧" },
  { name: "Data Scraping", slug: "data-scraping", icon: "🔍" },
  { name: "Content Generation", slug: "content-generation", icon: "✍️" },
  {
    name: "Marketing Automation",
    slug: "marketing-automation",
    icon: "📈",
  },
  { name: "Developer Tools", slug: "developer-tools", icon: "🛠️" },
  {
    name: "Finance & Accounting",
    slug: "finance-accounting",
    icon: "💰",
  },
  { name: "HR & Recruitment", slug: "hr-recruitment", icon: "👥" },
  { name: "Social Media", slug: "social-media", icon: "📱" },
  { name: "Other", slug: "other", icon: "📦" },
] as const;

// ─── Platforms ───
export const DEFAULT_PLATFORMS = [
  { name: "n8n", slug: "n8n" },
  { name: "Make", slug: "make" },
  { name: "Zapier", slug: "zapier" },
  { name: "LangChain", slug: "langchain" },
  { name: "AutoGen", slug: "autogen" },
  { name: "CrewAI", slug: "crewai" },
  { name: "Custom Python", slug: "custom-python" },
  { name: "Custom JavaScript", slug: "custom-javascript" },
] as const;

// ─── File Constraints ───
export const FILE_CONSTRAINTS = {
  MAX_DOWNLOADABLE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SCREENSHOTS: 10,
  ALLOWED_DOWNLOAD_TYPES: [
    ".json",
    ".zip",
    ".py",
    ".yaml",
    ".yml",
    ".js",
    ".ts",
    ".tar.gz",
  ],
  ALLOWED_IMAGE_TYPES: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  ALLOWED_VIDEO_TYPES: [".mp4", ".webm"],
} as const;

// ─── Commission ───
export const COMMISSION_RATES = {
  ONE_TIME_DEFAULT: 0.2, // 20%
  ONE_TIME_INTRODUCTORY: 0.15, // 15% for first 6 months
  SUBSCRIPTION_DEFAULT: 0.15, // 15%
  TRUSTED_SELLER: 0.18, // 18% for trusted sellers
} as const;

// ─── Pagination ───
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
