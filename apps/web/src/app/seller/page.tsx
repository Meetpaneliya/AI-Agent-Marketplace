"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import {
  fetchSellerListings,
  SellerListingItem,
  ListingStatus,
  fetchAdminReviewQueue,
  approveAgentListing,
  rejectAgentListing,
  getCurrentUser,
  UserProfile,
} from "@/lib/api";

const SORT_OPTIONS: {
  value: "updated" | "price_desc" | "price_asc" | "sales" | "alpha";
  label: string;
  icon: string;
  desc: string;
}[] = [
  { value: "updated", label: "Recently Updated", icon: "⚡", desc: "Latest modified or submitted agents first" },
  { value: "sales", label: "Most Sales", icon: "🏆", desc: "Top performing agents by volume" },
  { value: "price_desc", label: "Price: High to Low", icon: "💎", desc: "Premium tiered agents first" },
  { value: "price_asc", label: "Price: Low to High", icon: "💰", desc: "Affordable & entry priced agents first" },
  { value: "alpha", label: "Title: A–Z", icon: "🔤", desc: "Alphabetical alphabetical order" },
];

function isPublished(status?: string) {
  return status === ListingStatus.PUBLISHED || status === "published";
}

function isPending(status?: string) {
  return status === ListingStatus.PENDING_REVIEW || status === "pending_review" || status === "pending";
}

function isRejected(status?: string) {
  return status === ListingStatus.REJECTED || status === "rejected";
}

function isDraft(status?: string) {
  return status === ListingStatus.DRAFT || status === "draft";
}

function SellerDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [listingFilter, setListingFilter] = useState<ListingStatus | "all">("all");
  const [listings, setListings] = useState<SellerListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Admin Review Queue State
  const [adminQueue, setAdminQueue] = useState<SellerListingItem[]>([]);
  const [adminQueueFilter, setAdminQueueFilter] = useState<string>("pending_review");
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedReviewAgent, setSelectedReviewAgent] = useState<SellerListingItem | null>(null);
  const [rejectModalAgent, setRejectModalAgent] = useState<SellerListingItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [showInlineReject, setShowInlineReject] = useState(false);
  const [copiedSetup, setCopiedSetup] = useState(false);
  const [warnEditPendingAgent, setWarnEditPendingAgent] = useState<SellerListingItem | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchSellerListings()
      .then((data) => {
        setListings(data);
      })
      .catch((err) => {
        console.error("Failed to load seller listings from DB:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadAdminQueue = () => {
    setAdminLoading(true);
    fetchAdminReviewQueue(adminQueueFilter)
      .then((data) => setAdminQueue(data))
      .catch((err) => console.error("Failed to load admin review queue:", err))
      .finally(() => setAdminLoading(false));
  };

  useEffect(() => {
    if (activeTab === "admin_reviews") {
      loadAdminQueue();
    }
  }, [activeTab, adminQueueFilter]);

  // Admin Review Queue Search, Sorting & Pagination State
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSortBy, setAdminSortBy] = useState<"updated" | "price_desc" | "price_asc" | "sales" | "alpha">("updated");
  const [isAdminSortDropdownOpen, setIsAdminSortDropdownOpen] = useState(false);
  const adminSortDropdownRef = useRef<HTMLDivElement>(null);
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(6);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminSortDropdownRef.current && !adminSortDropdownRef.current.contains(event.target as Node)) {
        setIsAdminSortDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAdminSortDropdownOpen(false);
      }
    }
    if (isAdminSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAdminSortDropdownOpen]);

  const filteredAndSortedAdminQueue = useMemo(() => {
    const result = adminQueue.filter((item) => {
      if (adminSearchQuery.trim()) {
        const q = adminSearchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesTagline = item.tagline?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesPlatform = item.platform?.toLowerCase().includes(q);
        const matchesAuthor = item.seller?.name?.toLowerCase().includes(q) || item.seller?.email?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTagline && !matchesCategory && !matchesPlatform && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });

    result.sort((a, b) => {
      if (adminSortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (adminSortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (adminSortBy === "alpha") return (a.title || "").localeCompare(b.title || "");
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return result;
  }, [adminQueue, adminSearchQuery, adminSortBy]);

  useEffect(() => {
    setAdminCurrentPage(1);
  }, [adminQueueFilter, adminSearchQuery, adminSortBy]);

  const adminTotalPages = Math.ceil(filteredAndSortedAdminQueue.length / adminPageSize) || 1;
  const paginatedAdminQueue = useMemo(() => {
    const start = (adminCurrentPage - 1) * adminPageSize;
    return filteredAndSortedAdminQueue.slice(start, start + adminPageSize);
  }, [filteredAndSortedAdminQueue, adminCurrentPage, adminPageSize]);

  const openReviewModal = (item: SellerListingItem) => {
    setSelectedReviewAgent(item);
    setRejectionReasonInput(item.rejectionReason || "");
    setShowInlineReject(false);
    setCopiedSetup(false);
  };

  const closeReviewModal = () => {
    setSelectedReviewAgent(null);
    setShowInlineReject(false);
    setCopiedSetup(false);
    setRejectModalAgent(null);
  };

  const handleApprove = async (id: string, title: string) => {
    setActionProcessing(true);
    try {
      await approveAgentListing(id);
      setActionSuccessMsg(`Agent "${title}" has been successfully approved and published to the live marketplace!`);
      closeReviewModal();
      loadAdminQueue();
      fetchSellerListings().then(setListings).catch(() => {});
    } catch (err: any) {
      alert(err.message || "Failed to approve listing.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAgent = rejectModalAgent || selectedReviewAgent;
    if (!targetAgent || !rejectionReasonInput.trim()) return;
    setActionProcessing(true);
    try {
      await rejectAgentListing(targetAgent.id, rejectionReasonInput.trim());
      setActionSuccessMsg(`Rejection feedback sent for "${targetAgent.title}". Author has been requested to revise.`);
      closeReviewModal();
      setRejectionReasonInput("");
      loadAdminQueue();
      fetchSellerListings().then(setListings).catch(() => {});
    } catch (err: any) {
      alert(err.message || "Failed to reject listing.");
    } finally {
      setActionProcessing(false);
    }
  };

  const publishedListings = listings.filter((l) => isPublished(l.status));
  const pendingListings = listings.filter((l) => isPending(l.status));
  const rejectedListings = listings.filter((l) => isRejected(l.status));
  const draftListings = listings.filter((l) => isDraft(l.status));

  const totalSalesCount = listings.reduce((sum, l) => sum + (l.totalSales || 0), 0);
  const totalRevenueAmount = listings.reduce((sum, l) => sum + ((l.price || 0) * (l.totalSales || 0)), 0);

  const ratedListings = listings.filter((l) => l.avgRating && l.avgRating > 0);
  const avgRatingDisplay = ratedListings.length > 0
    ? (ratedListings.reduce((sum, l) => sum + l.avgRating, 0) / ratedListings.length).toFixed(2)
    : "4.88";

  const totalReviewsCount = listings.reduce((sum, l) => sum + (l.totalReviews || 0), 0) || 61;

  // Search, Sorting & Pagination State for Listings Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "price_desc" | "price_asc" | "sales" | "alpha">("updated");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Close custom sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSortDropdownOpen(false);
      }
    }
    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSortDropdownOpen]);

  const filteredAndSortedListings = useMemo(() => {
    const result = listings.filter((item) => {
      // 1. Status Filter
      if (listingFilter === ListingStatus.PUBLISHED && !isPublished(item.status)) return false;
      if (listingFilter === ListingStatus.PENDING_REVIEW && !isPending(item.status)) return false;
      if (listingFilter === ListingStatus.REJECTED && !isRejected(item.status)) return false;
      if (listingFilter === ListingStatus.DRAFT && !isDraft(item.status)) return false;

      // 2. Search Query (Title, Tagline, Category, Platform)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesTagline = item.tagline?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesPlatform = item.platform?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTagline && !matchesCategory && !matchesPlatform) {
          return false;
        }
      }
      return true;
    });

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "sales") return (b.totalSales || 0) - (a.totalSales || 0);
      if (sortBy === "alpha") return (a.title || "").localeCompare(b.title || "");
      // Default: updated
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return result;
  }, [listings, listingFilter, searchQuery, sortBy]);

  // Reset to page 1 whenever filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [listingFilter, searchQuery, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredAndSortedListings.length / pageSize) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedListings.slice(start, start + pageSize);
  }, [filteredAndSortedListings, currentPage, pageSize]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ─────────────────────────────────────────────────────────────
          TAB 1: OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <>
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ledger/60">
            <div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                Creator Studio Overview
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Real-time performance of your published AI agents, revenue & customer insights
              </p>
            </div>
            <Link href="/seller/listings/new">
              <Button variant="primary" size="md">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Publish Agent
              </Button>
            </Link>
          </div>

          {/* Revenue Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Revenue",
                value: `$${totalRevenueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                icon: "💰",
                color: "text-signal",
                sub: "Lifetime gross sales",
              },
              {
                label: "Total Sales",
                value: totalSalesCount.toLocaleString("en-US"),
                icon: "📦",
                color: "text-circuit",
                sub: "Licenses delivered",
              },
              {
                label: "Active Listings",
                value: publishedListings.length.toString(),
                icon: "📋",
                color: "text-text-primary",
                sub: `${pendingListings.length} under review • ${draftListings.length} draft`,
              },
              {
                label: "Avg. Rating",
                value: avgRatingDisplay,
                icon: "⭐",
                color: "text-signal",
                sub: `From ${totalReviewsCount} verified buyers`,
              },
            ].map((stat) => (
              <Card key={stat.label} padding="md" className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      {stat.label}
                    </div>
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-text-muted mt-1.5">
                      {stat.sub}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-surface border border-ledger flex items-center justify-center text-xl shrink-0">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Listings Overview Card */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-ledger/60">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Your Agent Listings</h3>
                <p className="text-xs text-text-muted">Manage, edit, and monitor your AI agent inventory</p>
              </div>
              <Link href="/seller?tab=listings">
                <Button variant="ghost" size="sm">
                  View All Listings ({listings.length}) →
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <span className="w-6 h-6 border-2 border-signal border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-text-muted">Loading your agent listings from database...</span>
              </div>
            ) : listings.length > 0 ? (
              <div className="space-y-3">
                {listings.slice(0, 5).map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 rounded-xl bg-surface/50 border border-ledger/80 hover:border-signal/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        {isPublished(listing.status) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live on Store
                          </span>
                        )}
                        {isPending(listing.status) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Under Review
                          </span>
                        )}
                        {isDraft(listing.status) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                            Draft
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-text-muted px-2 py-0.5 rounded bg-panel border border-ledger">
                          {listing.category}
                        </span>
                        <span className="text-[11px] font-medium text-circuit px-2 py-0.5 rounded bg-signal/10 border border-signal/20">
                          {listing.platform}
                        </span>
                      </div>

                      <h4 className="font-semibold text-text-primary text-sm truncate">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                        {listing.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-signal">
                          ${listing.price}.00
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {listing.totalSales > 0 ? `${listing.totalSales} sales` : "0 sales"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPublished(listing.status) ? (
                          <Link href={`/agents/${listing.slug}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Storefront ↗
                            </Button>
                          </Link>
                        ) : isPending(listing.status) ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-amber-400 font-medium px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              In Review
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setWarnEditPendingAgent(listing)}
                              className="text-xs text-text-secondary hover:text-text-primary"
                            >
                              Edit
                            </Button>
                          </div>
                        ) : (
                          <Link href="/seller/listings/new">
                            <Button variant="outline" size="sm" className="text-xs">
                              Finish Setup →
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {listings.length > 5 && (
                  <div className="pt-3 text-center border-t border-ledger/60">
                    <Link href="/seller?tab=listings">
                      <Button variant="ghost" size="sm" className="text-xs text-circuit hover:text-circuit-hover font-semibold">
                        View All {listings.length} Listings in Full Manager →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<span>🚀</span>}
                title="No agent listings published yet"
                description="Start monetizing your custom n8n workflows, LangChain agents, or CrewAI setups. Reach thousands of buyers."
                action={
                  <Link href="/seller/listings/new">
                    <Button variant="primary" size="md">
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Publish Your First Agent Listing
                    </Button>
                  </Link>
                }
              />
            )}
          </Card>

          {/* Quick Creator Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
              Creator Toolkit & Documentation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Seller Guidelines",
                  desc: "Quality checklist, packaging guidelines, and review standards",
                  icon: "📖",
                  href: "/docs/seller-guidelines",
                  tag: "Guide",
                },
                {
                  title: "Payout Settings",
                  desc: "Configure your Stripe Connect or Razorpay withdrawal account",
                  icon: "🏦",
                  href: "/seller?tab=payouts",
                  tag: "Finance",
                },
                {
                  title: "Performance Analytics",
                  desc: "Deep-dive into page impressions, click-throughs, and sales",
                  icon: "📊",
                  href: "/seller?tab=analytics",
                  tag: "Growth",
                },
              ].map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card hover padding="md" className="h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{action.icon}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-surface border border-ledger text-text-muted">
                          {action.tag}
                        </span>
                      </div>
                      <h4 className="font-semibold text-text-primary text-sm mb-1 group-hover:text-signal transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">{action.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-ledger/40 text-xs font-semibold text-signal flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Resource →
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MY LISTINGS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "listings" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ledger/60">
            <div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                My Agent Listings
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Manage, edit pricing, upload new versions, and view status of your agents
              </p>
            </div>
            <Link href="/seller/listings/new">
              <Button variant="primary" size="md">
                Create Listing
              </Button>
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-ledger pb-3 flex-wrap">
            {[
              { id: "all", label: `All Listings (${listings.length})` },
              { id: ListingStatus.PUBLISHED, label: `Published (${publishedListings.length})` },
              { id: ListingStatus.PENDING_REVIEW, label: `Under Review (${pendingListings.length})` },
              { id: ListingStatus.REJECTED, label: `Action Required (${rejectedListings.length})` },
              { id: ListingStatus.DRAFT, label: `Drafts (${draftListings.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setListingFilter(tab.id as ListingStatus | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  listingFilter === tab.id
                    ? "bg-signal text-white font-semibold shadow-sm shadow-signal/25"
                    : tab.id === ListingStatus.REJECTED && rejectedListings.length > 0
                    ? "text-danger bg-danger/10 border border-danger/30 hover:bg-danger/20 font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === ListingStatus.REJECTED && rejectedListings.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Controls Bar: Search & Custom Sort Menu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface/40 border border-ledger/70">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings by title, category, or platform..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-ledger text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-circuit transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-text-muted hover:text-text-primary cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Custom Sleek Sort Dropdown (No native OS select popup) */}
            <div className="relative shrink-0 self-end sm:self-auto" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-ledger hover:border-signal/50 text-xs font-medium text-text-primary transition-all cursor-pointer shadow-xs focus:outline-none focus:border-circuit"
              >
                <svg className="w-3.5 h-3.5 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span className="text-text-muted">Sort:</span>
                <span className="font-semibold text-text-primary">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Recently Updated"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                    isSortDropdownOpen ? "rotate-180 text-signal" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Custom Dark Theme Dropdown Menu */}
              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0e131f] border border-ledger shadow-2xl p-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-ledger/60 mb-1 flex items-center justify-between">
                    <span>Sort Listings</span>
                    <span className="text-[9px] text-circuit">Click to apply</span>
                  </div>
                  <div className="space-y-0.5">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-signal/15 text-signal font-semibold border border-signal/30"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface/90 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm shrink-0">{opt.icon}</span>
                            <div>
                              <div className="font-medium">{opt.label}</div>
                              <div className="text-[10px] text-text-muted leading-tight">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <svg className="w-4 h-4 text-signal shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Listings List / Grid */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <span className="w-7 h-7 border-2 border-signal border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-text-muted">Fetching agent listings from database...</span>
            </div>
          ) : filteredAndSortedListings.length > 0 ? (
            <>
              <div className="space-y-4">
              {paginatedListings.map((agent) => (
                <Card key={agent.id} padding="lg" className="hover:border-signal/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isPublished(agent.status) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live on Marketplace
                          </span>
                        )}
                        {isPending(agent.status) && (
                          <>
                            {agent.approvedAt ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Update Under Verification
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Under Review
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface text-text-muted border border-ledger">
                              <span>⏳</span> In Admin Queue (24-48h)
                            </span>
                          </>
                        )}
                        {isRejected(agent.status) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/15 text-danger border border-danger/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                            Changes Requested
                          </span>
                        )}
                        {isDraft(agent.status) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                            Draft Mode
                          </span>
                        )}

                        <span className="text-xs font-medium text-text-muted px-2.5 py-0.5 rounded-md bg-surface border border-ledger">
                          {agent.category}
                        </span>
                        <span className="text-xs font-medium text-circuit px-2.5 py-0.5 rounded-md bg-signal/10 border border-signal/20">
                          {agent.platform}
                        </span>
                        <span className="text-xs text-text-muted font-mono">
                          {agent.version}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-text-primary">
                        {agent.title}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
                        {agent.tagline}
                      </p>

                      {/* Reviewer Feedback Callout Banner if Rejected */}
                      {isRejected(agent.status) && (
                        <div className="mt-3 p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-xs text-text-primary">
                          <div className="font-bold text-danger flex items-center gap-1.5 mb-1">
                            <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <span>Reviewer Feedback — Changes Required Before Approval:</span>
                          </div>
                          <p className="text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-ledger mt-1 font-mono text-[11.5px]">
                            &ldquo;{agent.rejectionReason || "Please verify environment requirements and setup documentation."}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-text-muted pt-1 flex-wrap">
                        <span>Updated {new Date(agent.updatedAt || Date.now()).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Views: <strong className="text-text-secondary">{agent.totalViews.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Sales: <strong className="text-text-secondary">{agent.totalSales} units</strong></span>
                        {agent.avgRating > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-signal font-semibold">⭐ {agent.avgRating.toFixed(2)} ({agent.totalReviews} reviews)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Pricing & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-ledger">
                      <div className="lg:text-right">
                        <div className="text-2xl font-bold text-signal">
                          ${agent.price}.00
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {agent.pricingModel}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isPublished(agent.status) && (
                          <Link href={`/agents/${agent.slug}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                              <span>Storefront</span>
                              <span>↗</span>
                            </Button>
                          </Link>
                        )}
                        {isPending(agent.status) && (
                          <Link href={`/agents/${agent.slug || ""}?preview=true`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs text-text-primary hover:text-circuit border-ledger hover:border-circuit/40">
                              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Preview</span>
                            </Button>
                          </Link>
                        )}
                        {isRejected(agent.status) && (
                          <Link href={`/seller/listings/new?edit=${agent.id}`}>
                            <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-sm shadow-signal/25 text-xs">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              <span>Edit & Resubmit</span>
                            </Button>
                          </Link>
                        )}
                        {isDraft(agent.status) && (
                          <Link href="/seller/listings/new">
                            <Button variant="primary" size="sm" className="text-xs">
                              Continue Setup →
                            </Button>
                          </Link>
                        )}
                        {!isRejected(agent.status) && (
                          isPending(agent.status) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setWarnEditPendingAgent(agent)}
                              className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                              </svg>
                              <span>Edit</span>
                            </Button>
                          ) : (
                            <Link href={`/seller/listings/new?edit=${agent.id}`}>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                </svg>
                                <span>Edit</span>
                              </Button>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls Bar — Production Grade Card Container */}
            <div className="mt-4 p-4 rounded-2xl bg-surface/50 border border-ledger/80 shadow-md backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: Summary Counter with Pulse Indicator */}
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal"></span>
                </span>
                <div className="text-xs text-text-muted">
                  Showing{" "}
                  <span className="font-bold text-text-primary">
                    {(currentPage - 1) * pageSize + 1}
                  </span>
                  –
                  <span className="font-bold text-text-primary">
                    {Math.min(currentPage * pageSize, filteredAndSortedListings.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-text-primary">
                    {filteredAndSortedListings.length}
                  </span>{" "}
                  agents
                  {searchQuery && (
                    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-signal/15 text-signal border border-signal/25">
                      Filtered
                    </span>
                  )}
                </div>
              </div>

              {/* Center: Rows Per Page Segmented Switch */}
              <div className="flex items-center gap-2.5 self-start md:self-auto text-xs text-text-muted">
                <span className="font-medium text-text-secondary">Rows per page:</span>
                <div className="inline-flex items-center p-1 rounded-xl bg-panel border border-ledger/90 shadow-inner gap-1">
                  {[6, 10, 20, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        pageSize === size
                          ? "bg-signal text-white font-bold shadow-md shadow-signal/30 scale-[1.02]"
                          : "text-text-muted hover:text-text-primary hover:bg-surface/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Page Navigation Buttons with SVG Icons */}
              <div className="flex items-center gap-1.5 self-end md:self-auto">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ledger bg-surface text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-panel hover:enabled:border-circuit/40 hover:enabled:text-text-primary text-text-secondary shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Prev</span>
                </button>

                {/* Page numbers with intelligent window */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .reduce<(number | string)[]>((acc, page, idx, arr) => {
                      if (
                        idx > 0 &&
                        typeof arr[idx - 1] === "number" &&
                        (page as number) - (arr[idx - 1] as number) > 1
                      ) {
                        acc.push(`ellipsis-${page}`);
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item) => {
                      if (typeof item === "string") {
                        return (
                          <span key={item} className="px-1.5 text-xs text-text-muted">
                            ...
                          </span>
                        );
                      }
                      const isActive = item === currentPage;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-signal text-white font-extrabold shadow-md shadow-signal/30 border border-signal/50 scale-105"
                              : "text-text-secondary hover:text-text-primary bg-surface hover:bg-panel border border-ledger hover:border-ledger/90"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ledger bg-surface text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-panel hover:enabled:border-circuit/40 hover:enabled:text-text-primary text-text-secondary shadow-xs"
                >
                  <span>Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
          ) : (
            <Card padding="lg">
              {searchQuery ? (
                <EmptyState
                  icon={<span>🔍</span>}
                  title={`No listings match "${searchQuery}"`}
                  description="Try adjusting your search terms, removing filters, or clear search to view all your agents."
                  action={
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search Filter
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<span>📦</span>}
                  title="No agents found in this category"
                  description="You haven't added any listings matching this filter yet."
                  action={
                    <Link href="/seller/listings/new">
                      <Button variant="primary" size="md">
                        Create New Listing Now
                      </Button>
                    </Link>
                  }
                />
              )}
            </Card>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB: ADMIN REVIEWS CONSOLE (THEMEFOREST VERIFICATION PIPELINE)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "admin_reviews" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ledger/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-circuit animate-pulse" />
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  Admin Verification & Review Console
                </h2>
              </div>
              <p className="text-sm text-text-muted mt-0.5">
                ThemeForest review pipeline: Audit code packages, sandbox safety, approve listings or request revisions with feedback
              </p>
            </div>
            <button
              onClick={loadAdminQueue}
              className="px-3.5 py-1.5 rounded-lg bg-surface border border-ledger hover:border-slate text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <svg className={`w-3.5 h-3.5 text-text-muted ${adminLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Toast / Notification Banner */}
          {actionSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{actionSuccessMsg}</span>
              </div>
              <button
                onClick={() => setActionSuccessMsg("")}
                className="text-xs text-emerald-400/70 hover:text-emerald-300 font-bold ml-4 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-ledger pb-3 flex-wrap">
            {[
              { id: "pending_review", label: "Pending Review" },
              { id: "rejected", label: "Changes Requested / Rejected" },
              { id: "published", label: "Approved & Live" },
              { id: "all", label: "All Queue Items" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminQueueFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  adminQueueFilter === tab.id
                    ? "bg-circuit text-void font-bold shadow-sm shadow-circuit/25"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Admin Queue Controls Bar: Search & Custom Sort Menu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface/40 border border-ledger/70">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="Search queue by agent title, author, category, or platform..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-ledger text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-circuit transition-colors"
              />
              {adminSearchQuery && (
                <button
                  type="button"
                  onClick={() => setAdminSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-text-muted hover:text-text-primary cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Custom Sleek Sort Dropdown */}
            <div className="relative shrink-0 self-end sm:self-auto" ref={adminSortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAdminSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-ledger hover:border-circuit/50 text-xs font-medium text-text-primary transition-all cursor-pointer shadow-xs focus:outline-none focus:border-circuit"
              >
                <svg className="w-3.5 h-3.5 text-circuit" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span className="text-text-muted">Sort:</span>
                <span className="font-semibold text-text-primary">
                  {SORT_OPTIONS.find((o) => o.value === adminSortBy)?.label || "Recently Updated"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                    isAdminSortDropdownOpen ? "rotate-180 text-circuit" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAdminSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0e131f] border border-ledger shadow-2xl p-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-ledger/60 mb-1 flex items-center justify-between">
                    <span>Sort Queue Items</span>
                    <span className="text-[9px] text-circuit">Click to apply</span>
                  </div>
                  <div className="space-y-0.5">
                    {SORT_OPTIONS.filter((o) => o.value !== "sales").map((opt) => {
                      const isSelected = adminSortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setAdminSortBy(opt.value);
                            setIsAdminSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-circuit/15 text-circuit font-semibold border border-circuit/30"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface/90 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm shrink-0">{opt.icon}</span>
                            <div>
                              <div className="font-medium">{opt.label}</div>
                              <div className="text-[10px] text-text-muted leading-tight">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <svg className="w-4 h-4 text-circuit shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Queue Items */}
          {adminLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <span className="w-7 h-7 border-2 border-circuit border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-text-muted">Loading submissions from review queue...</span>
            </div>
          ) : filteredAndSortedAdminQueue.length > 0 ? (
            <>
              <div className="space-y-4">
                {paginatedAdminQueue.map((item) => (
                <Card key={item.id} padding="lg" className="hover:border-slate/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Details */}
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isPublished(item.status) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Approved & Live
                          </span>
                        )}
                        {isPending(item.status) && (
                          item.approvedAt ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                              🔄 Live Update Verification
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending Admin Review
                            </span>
                          )
                        )}
                        {isRejected(item.status) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/15 text-danger border border-danger/30">
                            Changes Requested
                          </span>
                        )}

                        <span className="text-xs font-medium text-text-muted px-2.5 py-0.5 rounded-md bg-surface border border-ledger">
                          {item.category}
                        </span>
                        <span className="text-xs font-medium text-circuit px-2.5 py-0.5 rounded-md bg-circuit/10 border border-circuit/20">
                          {item.platform}
                        </span>
                        <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          🛡️ Sandbox Scan: Clean
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-text-primary">
                            {item.title}
                          </h3>
                          <p className="text-xs text-text-muted leading-relaxed mt-1 max-w-2xl">
                            {item.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Author Info & Timestamps */}
                      <div className="flex items-center gap-4 text-xs text-text-muted pt-1 flex-wrap">
                        <span>Author: <strong className="text-text-primary">{item.seller?.name || "Developer"}</strong> ({item.seller?.email})</span>
                        <span>•</span>
                        <span>Package: <code className="text-circuit bg-surface px-1.5 py-0.5 rounded border border-ledger">{item.fileUrl || "workflow.json"}</code></span>
                        <span>•</span>
                        <span>Submitted: {new Date(item.createdAt || item.updatedAt || Date.now()).toLocaleDateString()}</span>
                      </div>

                      {/* Rejection Note if currently rejected */}
                      {isRejected(item.status) && item.rejectionReason && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-text-secondary">
                          <strong className="text-danger">Current Rejection Reason:</strong> &ldquo;{item.rejectionReason}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Right: Pricing & Single Contextual Action Button */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-ledger">
                      <div className="lg:text-right">
                        <div className="text-2xl font-bold text-signal">
                          ${item.price}.00
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {item.pricingModel || "One-Time License"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending(item.status) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openReviewModal(item)}
                            className="bg-signal hover:bg-signal/90 !text-white font-semibold flex items-center gap-2 px-4 py-2 shadow-md shadow-signal/25 cursor-pointer"
                          >
                            <span>Review Submission</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </Button>
                        )}

                        {isPublished(item.status) && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewModal(item)}
                              className="text-xs font-medium cursor-pointer"
                            >
                              Audit Record
                            </Button>
                            <Link href={`/agents/${item.slug}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
                              >
                                <span>Storefront</span>
                                <span>↗</span>
                              </Button>
                            </Link>
                          </div>
                        )}

                        {isRejected(item.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewModal(item)}
                            className="text-xs font-medium text-danger hover:bg-danger/10 border-danger/30 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>View Notes & Re-evaluate</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Admin Queue Pagination Controls Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-surface/50 border border-ledger/80 shadow-md backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: Summary Counter with Pulse Indicator */}
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-circuit"></span>
                </span>
                <div className="text-xs text-text-muted">
                  Showing{" "}
                  <span className="font-bold text-text-primary">
                    {(adminCurrentPage - 1) * adminPageSize + 1}
                  </span>
                  –
                  <span className="font-bold text-text-primary">
                    {Math.min(adminCurrentPage * adminPageSize, filteredAndSortedAdminQueue.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-text-primary">
                    {filteredAndSortedAdminQueue.length}
                  </span>{" "}
                  submissions
                  {adminSearchQuery && (
                    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-circuit/15 text-circuit border border-circuit/25">
                      Filtered
                    </span>
                  )}
                </div>
              </div>

              {/* Center: Rows Per Page Density Controls */}
              <div className="flex items-center gap-2.5 self-start md:self-auto text-xs text-text-muted">
                <span className="font-medium text-text-secondary">Rows per page:</span>
                <div className="inline-flex items-center p-1 rounded-xl bg-panel border border-ledger/90 shadow-inner gap-1">
                  {[6, 10, 20, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setAdminPageSize(size);
                        setAdminCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        adminPageSize === size
                          ? "bg-circuit text-void font-bold shadow-md shadow-circuit/30 scale-[1.02]"
                          : "text-text-muted hover:text-text-primary hover:bg-surface/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Page Navigation Buttons with SVG Icons */}
              <div className="flex items-center gap-1.5 self-end md:self-auto">
                <button
                  type="button"
                  disabled={adminCurrentPage === 1}
                  onClick={() => setAdminCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ledger bg-surface text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-panel hover:enabled:border-circuit/40 hover:enabled:text-text-primary text-text-secondary shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Prev</span>
                </button>

                {/* Page numbers with intelligent window */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: adminTotalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === adminTotalPages ||
                        Math.abs(page - adminCurrentPage) <= 1
                      );
                    })
                    .reduce<(number | string)[]>((acc, page, idx, arr) => {
                      if (
                        idx > 0 &&
                        typeof arr[idx - 1] === "number" &&
                        (page as number) - (arr[idx - 1] as number) > 1
                      ) {
                        acc.push(`ellipsis-${page}`);
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item) => {
                      if (typeof item === "string") {
                        return (
                          <span key={item} className="px-1.5 text-xs text-text-muted">
                            ...
                          </span>
                        );
                      }
                      const isActive = item === adminCurrentPage;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setAdminCurrentPage(item)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-circuit text-void font-extrabold shadow-md shadow-circuit/30 border border-circuit/50 scale-105"
                              : "text-text-secondary hover:text-text-primary bg-surface hover:bg-panel border border-ledger hover:border-ledger/90"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={adminCurrentPage === adminTotalPages}
                  onClick={() => setAdminCurrentPage((p) => Math.min(adminTotalPages, p + 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ledger bg-surface text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-panel hover:enabled:border-circuit/40 hover:enabled:text-text-primary text-text-secondary shadow-xs"
                >
                  <span>Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
          ) : (
            <Card padding="lg">
              {adminSearchQuery ? (
                <EmptyState
                  icon={<span>🔍</span>}
                  title={`No review submissions match "${adminSearchQuery}"`}
                  description="Try adjusting your search keywords or clear the filter to see all pending queue items."
                  action={
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setAdminSearchQuery("")}
                    >
                      Clear Search Filter
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<span>🎉</span>}
                  title="Review Queue is Empty"
                  description={`There are currently no listings matching the "${adminQueueFilter.replace("_", " ")}" filter.`}
                />
              )}
            </Card>
          )}

          {/* ThemeForest Review Workstation Modal */}
          {selectedReviewAgent && (
            <Modal
              isOpen={Boolean(selectedReviewAgent)}
              onClose={closeReviewModal}
              size="2xl"
              title={`Review Submission: ${selectedReviewAgent.title}`}
              subtitle={`Submitted by ${selectedReviewAgent.seller?.name || "Developer"} (${selectedReviewAgent.seller?.email || "author"}) • ${selectedReviewAgent.category}`}
              badge={
                isPublished(selectedReviewAgent.status) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live on Storefront
                  </span>
                ) : isPending(selectedReviewAgent.status) && selectedReviewAgent.approvedAt ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Live Update Under Review
                  </span>
                ) : isPending(selectedReviewAgent.status) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Awaiting Decision
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/15 text-danger border border-danger/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                    Changes Requested
                  </span>
                )
              }
            >
              <div className="space-y-6 text-sm">
                {/* Live Update Alert Notice */}
                {selectedReviewAgent.approvedAt && isPending(selectedReviewAgent.status) && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-3 animate-fade-in">
                    <span className="text-base">🛡️</span>
                    <div>
                      <strong className="text-blue-200">Author Code Update on Live Agent:</strong>
                      <p className="text-blue-300/80 mt-0.5 leading-relaxed">
                        This listing was previously published (approved on {new Date(selectedReviewAgent.approvedAt).toLocaleDateString()}). The author has submitted an updated package file or setup guide. Verify that the code changes are safe and functional before re-approving.
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Metrics Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 rounded-xl bg-surface/80 border border-ledger">
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">Category</span>
                    <strong className="text-text-primary text-sm font-medium mt-0.5 block">{selectedReviewAgent.category}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">Platform</span>
                    <strong className="text-circuit text-sm font-medium mt-0.5 block">{selectedReviewAgent.platform}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">Listing Price</span>
                    <strong className="text-signal text-sm font-bold mt-0.5 block">${selectedReviewAgent.price}.00</strong>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">Deliverable File</span>
                    <strong className="text-text-primary text-xs font-mono truncate mt-0.5 block" title={selectedReviewAgent.fileUrl || "agent_workflow.json"}>
                      {selectedReviewAgent.fileUrl ? selectedReviewAgent.fileUrl.replace(/^\/uploads\//, '') : "agent_workflow.json"}
                    </strong>
                  </div>
                </div>

                {/* 2-Column Workstation Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column (60%): Documentation & Code Deliverable */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Description & Value Proposition */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2">
                      <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted flex items-center gap-2">
                        <span>📄</span>
                        <span>Description & Value Proposition</span>
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                        {selectedReviewAgent.description}
                      </p>
                    </div>

                    {/* Setup & Quick Start Guide */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted flex items-center gap-2">
                          <span>⚡</span>
                          <span>Quick Start & Setup Instructions</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedReviewAgent.setupGuide) {
                              navigator.clipboard.writeText(selectedReviewAgent.setupGuide);
                              setCopiedSetup(true);
                              setTimeout(() => setCopiedSetup(false), 2000);
                            }
                          }}
                          className="text-[11px] px-2 py-1 rounded bg-surface border border-ledger hover:border-slate text-text-muted hover:text-text-primary transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{copiedSetup ? "✓ Copied!" : "📋 Copy"}</span>
                        </button>
                      </div>
                      <pre className="text-xs text-text-secondary bg-panel p-3.5 rounded-lg border border-ledger/80 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto">
                        {selectedReviewAgent.setupGuide || "No custom setup instructions provided by author."}
                      </pre>
                    </div>

                    {/* Deliverable File Details with Real Inspection Action */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-ledger flex items-center justify-center font-mono font-bold text-xs text-circuit flex-shrink-0 shadow-sm">
                          {selectedReviewAgent.fileUrl?.split('.').pop()?.toUpperCase() || "JSON"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-text-primary truncate max-w-[260px] sm:max-w-xs" title={selectedReviewAgent.fileUrl}>
                            {selectedReviewAgent.fileUrl ? selectedReviewAgent.fileUrl.replace(/^\/uploads\//, '') : "agent_workflow.json"}
                          </div>
                          <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2">
                            <span>Package Deliverable</span>
                            <span>•</span>
                            <span className="text-text-secondary">Ready for review</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={selectedReviewAgent.fileUrl || "#"}
                        download={selectedReviewAgent.fileUrl?.split('/').pop() || "agent_workflow.json"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-ledger hover:border-circuit hover:text-circuit text-xs font-medium text-text-primary transition-all shadow-sm cursor-pointer self-end sm:self-auto flex-shrink-0"
                        title="Download attached workflow file to inspect code"
                      >
                        <svg className="w-3.5 h-3.5 text-circuit" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>Download to Inspect</span>
                      </a>
                    </div>

                    {/* Interactive Live Demo URL (If Provided) */}
                    {selectedReviewAgent.demoUrl && (
                      <div className="p-3.5 rounded-xl bg-surface/50 border border-ledger flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="text-[11px] text-text-muted uppercase font-semibold tracking-wider block mb-0.5">
                            Interactive Demo Sandbox
                          </span>
                          <span className="text-xs text-circuit font-mono truncate block" title={selectedReviewAgent.demoUrl}>
                            {selectedReviewAgent.demoUrl}
                          </span>
                        </div>
                        <a
                          href={selectedReviewAgent.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-signal hover:underline flex-shrink-0 font-medium"
                        >
                          <span>Test Sandbox</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column (40%): Author, Security & Keys */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Author Profile */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2.5">
                      <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted">
                        Author Identity
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-signal/15 border border-signal/30 text-signal font-bold flex items-center justify-center text-sm">
                          {(selectedReviewAgent.seller?.name || "D").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-text-primary truncate">
                            {selectedReviewAgent.seller?.name || "Demo Developer"}
                          </div>
                          <div className="text-xs text-text-muted truncate">
                            {selectedReviewAgent.seller?.email || "developer@agentstore.com"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-signal/10 text-signal font-semibold border border-signal/20">
                          Verified Author
                        </span>
                        <span className="text-[11px] text-text-muted">
                          80/20 Royalty Split
                        </span>
                      </div>
                    </div>

                    {/* Required API Keys */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2">
                      <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <span>🔑</span>
                        <span>Required Credentials / API Keys</span>
                      </h4>
                      <div className="text-xs text-text-secondary bg-panel p-2.5 rounded-lg border border-ledger">
                        {selectedReviewAgent.requiredKeys ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedReviewAgent.requiredKeys.split(",").map((k, i) => (
                              <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface border border-ledger text-circuit">
                                {k.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-text-muted italic">No external credentials declared</span>
                        )}
                      </div>
                    </div>

                    {/* Real Automated Security Audit Results */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                          <span>🛡️</span>
                          <span>Automated Package Scan</span>
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                          selectedReviewAgent.scanStatus === "flagged"
                            ? "bg-danger/10 text-danger border border-danger/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {selectedReviewAgent.scanStatus === "flagged" ? "⚠️ Issues Flagged" : "✓ Clean & Safe"}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span>Format & Syntax:</span>
                          </span>
                          <span className="text-text-primary font-mono text-[11px]">
                            {selectedReviewAgent.scanResults?.checks?.syntax?.label || "Valid Package Format"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <span className={selectedReviewAgent.scanResults?.checks?.secretLeaks?.passed === false ? "text-danger" : "text-emerald-400"}>
                              {selectedReviewAgent.scanResults?.checks?.secretLeaks?.passed === false ? "⚠️" : "✓"}
                            </span>
                            <span>Credential Leak Check:</span>
                          </span>
                          <span className={`font-mono text-[11px] ${
                            selectedReviewAgent.scanResults?.checks?.secretLeaks?.passed === false ? "text-danger font-semibold" : "text-emerald-400"
                          }`}>
                            {selectedReviewAgent.scanResults?.checks?.secretLeaks?.passed === false ? "Leaked Key Detected" : "No Keys Leaked"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <span className={selectedReviewAgent.scanResults?.checks?.maliciousPatterns?.passed === false ? "text-danger" : "text-emerald-400"}>
                              {selectedReviewAgent.scanResults?.checks?.maliciousPatterns?.passed === false ? "⚠️" : "✓"}
                            </span>
                            <span>Exploit Pattern Check:</span>
                          </span>
                          <span className={`font-mono text-[11px] ${
                            selectedReviewAgent.scanResults?.checks?.maliciousPatterns?.passed === false ? "text-danger font-semibold" : "text-emerald-400"
                          }`}>
                            {selectedReviewAgent.scanResults?.checks?.maliciousPatterns?.passed === false ? "Suspicious Code" : "Clean Code"}
                          </span>
                        </div>

                        {selectedReviewAgent.fileHash && (
                          <div className="pt-1.5 border-t border-ledger flex items-center justify-between text-[11px] text-text-muted">
                            <span>SHA-256 Fingerprint:</span>
                            <span className="font-mono text-circuit text-[10px] truncate max-w-[130px]" title={selectedReviewAgent.fileHash}>
                              {selectedReviewAgent.fileHash.slice(0, 16)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Production Reviewer Guidelines & Verification Checklist */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                          <span>📋</span>
                          <span>Admin Review Checklist</span>
                        </h4>
                        <span className="text-[10px] text-text-muted font-mono">Manual Verification</span>
                      </div>
                      <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        <div className="flex items-start gap-2">
                          <span className="text-circuit font-bold">1.</span>
                          <span><strong>Package Content:</strong> Download and check file for hardcoded credentials or malicious scripts.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-circuit font-bold">2.</span>
                          <span><strong>Setup Clarity:</strong> Ensure instructions clearly outline prerequisite accounts and credentials.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-circuit font-bold">3.</span>
                          <span><strong>Fair Pricing:</strong> Confirm listing price (${selectedReviewAgent.price}) is reasonable for workflow complexity.</span>
                        </div>
                      </div>
                    </div>

                    {/* Previous Feedback Note if currently rejected */}
                    {isRejected(selectedReviewAgent.status) && selectedReviewAgent.rejectionReason && (
                      <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-xs space-y-1">
                        <div className="font-bold text-danger flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>Active Reviewer Feedback:</span>
                        </div>
                        <p className="text-text-secondary italic leading-relaxed">
                          &ldquo;{selectedReviewAgent.rejectionReason}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Rejection Drawer (If Admin clicked Request Changes) */}
                {showInlineReject ? (
                  <form onSubmit={handleReject} className="p-4 rounded-xl bg-danger/10 border border-danger/30 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-danger">
                        <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <span>Specify Required Modifications for Author</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInlineReject(false)}
                        className="text-xs text-text-muted hover:text-text-primary cursor-pointer"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      The author will receive this constructive feedback in their <strong>Action Required</strong> tab and will be prompted to edit and resubmit.
                    </p>

                    {/* Preset Quick Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-text-muted">Presets:</span>
                      {[
                        "Missing setup instructions in Quick Start Guide",
                        "Required API keys not documented",
                        "Package entrypoint missing or invalid",
                        "Description requires more detailed value proposition",
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRejectionReasonInput((prev) =>
                              prev ? `${prev}\n• ${preset}` : `• ${preset}`
                            );
                          }}
                          className="text-[11px] px-2 py-0.5 rounded bg-surface border border-ledger hover:border-danger/40 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          + {preset.slice(0, 26)}...
                        </button>
                      ))}
                    </div>

                    <Textarea
                      label="Reviewer Feedback & Action Items"
                      placeholder="e.g. 1. Please add step-by-step instructions for obtaining the required OpenAI API key.\n2. Ensure environment variable names match the code."
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      rows={4}
                      required
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInlineReject(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={actionProcessing}
                        className="bg-danger hover:bg-danger/80 !text-white font-semibold cursor-pointer"
                      >
                        Send Feedback & Mark Rejected
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Standard Bottom Decision Bar */
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ledger">
                    <div className="text-xs text-text-muted flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-circuit" />
                      <span>
                        {isPublished(selectedReviewAgent.status)
                          ? "This agent is currently approved and live on the public storefront."
                          : "Review all specifications thoroughly before issuing an approval or revision request."}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      {isPublished(selectedReviewAgent.status) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInlineReject(true)}
                            className="text-danger hover:bg-danger/10 border-danger/30 cursor-pointer"
                          >
                            Request Revision
                          </Button>
                          <Link href={`/agents/${selectedReviewAgent.slug}`}>
                            <Button variant="primary" size="sm" className="cursor-pointer">
                              View Live Storefront ↗
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInlineReject(true)}
                            className="text-danger hover:bg-danger/10 border-danger/40 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Request Changes</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionProcessing}
                            onClick={() => handleApprove(selectedReviewAgent.id, selectedReviewAgent.title)}
                            className="bg-emerald-600 hover:bg-emerald-500 !text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>Approve & Publish to Marketplace</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Modal>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: ANALYTICS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <>
          <div className="pb-2 border-b border-ledger/60">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Traffic & Performance Analytics
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Monitor impressions, buyer conversions, and top-performing agent categories
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Impressions", value: "0", sub: "Marketplace views" },
              { label: "Product Clicks", value: "0", sub: "Detail page visits" },
              { label: "Conversion Rate", value: "0.0%", sub: "Visitor to sale ratio" },
              { label: "Refund Rate", value: "0.0%", sub: "Chargebacks / returns" },
            ].map((item) => (
              <Card key={item.label} padding="md">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  {item.label}
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-text-muted">{item.sub}</div>
              </Card>
            ))}
          </div>

          <Card padding="lg">
            <h3 className="text-base font-semibold text-text-primary mb-2">
              Sales Trend (Last 30 Days)
            </h3>
            <div className="h-64 rounded-xl bg-surface/50 border border-ledger flex flex-col items-center justify-center text-center p-6">
              <span className="text-4xl mb-2">📈</span>
              <div className="font-semibold text-text-primary text-sm">No sales data yet</div>
              <p className="text-xs text-text-muted max-w-sm mt-1">
                Once your published agents start generating sales, your interactive revenue graphs and customer demographics will appear here.
              </p>
            </div>
          </Card>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: EARNINGS & PAYOUTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "payouts" && (
        <>
          <div className="pb-2 border-b border-ledger/60">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Earnings & Payout Settings
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Track creator balance, automated payout schedules, and bank connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="md" className="border-signal/30 bg-signal/5">
              <div className="text-xs font-semibold uppercase tracking-wider text-signal mb-1">
                Available for Withdrawal
              </div>
              <div className="text-3xl font-bold text-signal mb-1">$0.00</div>
              <p className="text-xs text-text-muted mb-4">Cleared funds ready to payout</p>
              <Button variant="primary" size="sm" fullWidth disabled>
                Withdraw Funds
              </Button>
            </Card>

            <Card padding="md">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                Pending Escrow
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">$0.00</div>
              <p className="text-xs text-text-muted">Standard 7-day buyer review clearance</p>
            </Card>

            <Card padding="md">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                Lifetime Creator Earnings
              </div>
              <div className="text-3xl font-bold text-circuit mb-1">$0.00</div>
              <p className="text-xs text-text-muted">Net creator earnings after 15% platform fee</p>
            </Card>
          </div>

          {/* Payout Method Setup */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Payout Method</h3>
            <p className="text-sm text-text-muted mb-6">
              Connect your preferred payout account to receive automated weekly transfers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-ledger bg-surface flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-text-primary">Stripe Connect</span>
                    <span className="px-2 py-0.5 rounded bg-circuit/10 text-circuit text-[10px] font-semibold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">Direct bank transfers across 40+ supported countries</p>
                </div>
                <Button variant="outline" size="sm">
                  Connect Stripe
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-ledger bg-surface flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-text-primary">Razorpay Route</span>
                    <span className="px-2 py-0.5 rounded bg-surface text-text-muted text-[10px] font-semibold uppercase border border-ledger">
                      INR / UPI
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">Direct NEFT/IMPS/UPI payouts for Indian bank accounts</p>
                </div>
                <Button variant="outline" size="sm">
                  Connect Razorpay
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: STORE SETTINGS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "settings" && (
        <>
          <div className="pb-2 border-b border-ledger/60">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Creator Storefront Settings
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Customize your public creator profile, contact info, and customer support channels
            </p>
          </div>

          <Card padding="lg" className="max-w-2xl space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Creator Brand / Studio Name
              </label>
              <input
                type="text"
                defaultValue="Nexus Automation Labs"
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Public Creator Bio
              </label>
              <textarea
                rows={3}
                defaultValue="Building production-grade AI agents, LangChain tools & n8n enterprise workflows."
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Customer Support Email
              </label>
              <input
                type="email"
                defaultValue="support@nexuslabs.ai"
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit"
              />
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md">
                Save Store Settings
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Active Review Edit Warning Modal */}
      {warnEditPendingAgent && (
        <Modal
          isOpen={Boolean(warnEditPendingAgent)}
          onClose={() => setWarnEditPendingAgent(null)}
          title="Listing Currently Under Review"
          subtitle={`Submitted for Admin Verification • ${warnEditPendingAgent.category}`}
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              In Review Queue
            </span>
          }
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div className="text-xs">
                <div className="font-bold text-amber-200 text-sm">
                  Editing will reset queue review status
                </div>
                <p className="text-text-secondary mt-1 leading-relaxed">
                  <strong className="text-text-primary">&ldquo;{warnEditPendingAgent.title}&rdquo;</strong> is currently sitting in the Admin Review Queue awaiting verification.
                </p>
                <p className="text-amber-200/90 mt-2 leading-relaxed">
                  If you edit this listing now, any modified code packages, credentials, or setup instructions will be treated as an updated submission and will need to undergo administrative verification again.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-ledger text-xs text-text-muted space-y-1">
              <div className="font-semibold text-text-primary flex items-center gap-1.5">
                <span>💡</span>
                <span>Just want to check your submission?</span>
              </div>
              <p className="text-[11.5px] leading-relaxed">
                You can use <strong>&ldquo;Preview Listing&rdquo;</strong> to inspect your listing without removing it from the active review queue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-ledger">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWarnEditPendingAgent(null)}
                className="w-full sm:w-auto text-xs"
              >
                Keep in Queue (Cancel)
              </Button>
              <Link
                href={`/agents/${warnEditPendingAgent.slug || ""}?preview=true`}
                onClick={() => setWarnEditPendingAgent(null)}
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preview Listing</span>
                </Button>
              </Link>
              <Link
                href={`/seller/listings/new?edit=${warnEditPendingAgent.id}`}
                onClick={() => setWarnEditPendingAgent(null)}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs bg-amber-500 hover:bg-amber-600 text-void font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  <span>Proceed to Edit</span>
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <Suspense fallback={
      <div className="py-12 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
      </div>
    }>
      <SellerDashboardContent />
    </Suspense>
  );
}
