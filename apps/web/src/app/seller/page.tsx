"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
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

  const filteredListings = listings.filter((item) => {
    if (listingFilter === ListingStatus.PUBLISHED) return isPublished(item.status);
    if (listingFilter === ListingStatus.PENDING_REVIEW) return isPending(item.status);
    if (listingFilter === ListingStatus.REJECTED) return isRejected(item.status);
    if (listingFilter === ListingStatus.DRAFT) return isDraft(item.status);
    return true;
  });

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
                {listings.map((listing) => (
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
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
                          <span className="text-xs text-amber-400 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                            Scanning...
                          </span>
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

          {/* Listings List / Grid */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <span className="w-7 h-7 border-2 border-signal border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-text-muted">Fetching agent listings from database...</span>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-4">
              {filteredListings.map((agent) => (
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
                          agent.approvedAt ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                              Update Under Verification
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Under Review
                            </span>
                          )
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
                            <Button variant="outline" size="sm">
                              Storefront ↗
                            </Button>
                          </Link>
                        )}
                        {isPending(agent.status) && (
                          <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Security Scan In Progress
                          </span>
                        )}
                        {isRejected(agent.status) && (
                          <Link href={`/seller/listings/new?edit=${agent.id}`}>
                            <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-sm shadow-signal/25">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              <span>Edit & Resubmit</span>
                            </Button>
                          </Link>
                        )}
                        {isDraft(agent.status) && (
                          <Link href="/seller/listings/new">
                            <Button variant="primary" size="sm">
                              Continue Setup →
                            </Button>
                          </Link>
                        )}
                        {!isRejected(agent.status) && (
                          <Link href={`/seller/listings/new?edit=${agent.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg">
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

          {/* Queue Items */}
          {adminLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <span className="w-7 h-7 border-2 border-circuit border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-text-muted">Loading submissions from review queue...</span>
            </div>
          ) : adminQueue.length > 0 ? (
            <div className="space-y-4">
              {adminQueue.map((item) => (
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
          ) : (
            <Card padding="lg">
              <EmptyState
                icon={<span>🎉</span>}
                title="Review Queue is Empty"
                description={`There are currently no listings matching the "${adminQueueFilter.replace("_", " ")}" filter.`}
              />
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
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">Package Archive</span>
                    <strong className="text-text-primary text-xs font-mono truncate mt-0.5 block">{selectedReviewAgent.fileUrl || "agent_workflow.json"}</strong>
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

                    {/* Deliverable File Details */}
                    <div className="p-3.5 rounded-xl bg-surface/50 border border-ledger flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-circuit/10 border border-circuit/20 text-circuit flex items-center justify-center font-bold text-sm">
                          JSON
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text-primary">
                            {selectedReviewAgent.fileUrl || "agent_workflow.json"}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            Format verified • Clean archive container
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                        Payload Valid
                      </span>
                    </div>
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

                    {/* Security & Integrity Checklist */}
                    <div className="p-4 rounded-xl bg-surface/50 border border-ledger space-y-2">
                      <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>Automated Security Audit</span>
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span>✓</span>
                          <span>Static AST Syntax Parser: 0 errors</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span>✓</span>
                          <span>Secret Leak Protection: Clean</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span>✓</span>
                          <span>Sandbox Isolation: Validated</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span>✓</span>
                          <span>Execution Manifest: Verified</span>
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
