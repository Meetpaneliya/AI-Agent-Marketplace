"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

function SellerDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [listingFilter, setListingFilter] = useState("all");

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
              { label: "Total Revenue", value: "$0.00", icon: "💰", color: "text-signal", sub: "Lifetime gross sales" },
              { label: "Total Sales", value: "0", icon: "📦", color: "text-circuit", sub: "Licenses delivered" },
              { label: "Active Listings", value: "0", icon: "📋", color: "text-text-primary", sub: "Live on marketplace" },
              { label: "Avg. Rating", value: "—", icon: "⭐", color: "text-signal", sub: "From verified buyers" },
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
                  View All Listings →
                </Button>
              </Link>
            </div>

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
          <div className="flex items-center gap-2 border-b border-ledger pb-3">
            {[
              { id: "all", label: "All Listings (0)" },
              { id: "published", label: "Published (0)" },
              { id: "pending", label: "Under Review (0)" },
              { id: "draft", label: "Drafts (0)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setListingFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  listingFilter === tab.id
                    ? "bg-signal text-white font-semibold shadow-sm shadow-signal/25"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Listings Table / Empty State */}
          <Card padding="lg">
            <EmptyState
              icon={<span>📦</span>}
              title="No agents found in this category"
              description="You haven't added any listings matching this filter yet. Ready to start selling?"
              action={
                <Link href="/seller/listings/new">
                  <Button variant="primary" size="md">
                    Create New Listing Now
                  </Button>
                </Link>
              }
            />
          </Card>
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
