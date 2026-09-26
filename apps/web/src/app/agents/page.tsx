"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import EmptyState from "@/components/ui/EmptyState";
import Dropdown from "@/components/ui/Dropdown";
import { AGENTS_CATALOG } from "@/lib/agents-data";

const CATEGORIES = [
  "All",
  "Sales & CRM",
  "Customer Support",
  "Marketing & Content",
  "Engineering & DevOps",
  "Data & Analytics",
];

const PLATFORMS = [
  "All Platforms",
  "n8n",
  "LangChain",
  "Make.com",
  "Flowise",
  "Custom API / Python",
];

const PLATFORM_OPTIONS = PLATFORMS.map((p) => ({ label: p, value: p }));

const PRICING_OPTIONS = [
  { label: "All Pricing", value: "all" },
  { label: "Free / Open Source", value: "free" },
  { label: "One-Time Purchase", value: "one_time" },
  { label: "Subscription", value: "subscription" },
];

const SORT_OPTIONS_STORE = [
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

function AgentsMarketplaceContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedPricing, setSelectedPricing] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get("category");
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtering Logic
  const filteredAgents = useMemo(() => {
    return AGENTS_CATALOG.filter((agent) => {
      // Search
      const matchesSearch =
        searchQuery.trim() === "" ||
        agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === "All" || agent.category.toLowerCase() === selectedCategory.toLowerCase();

      // Platform
      const matchesPlatform =
        selectedPlatform === "All Platforms" || agent.platform.toLowerCase() === selectedPlatform.toLowerCase();

      // Pricing
      const matchesPricing =
        selectedPricing === "all" || agent.pricingModel === selectedPricing;

      return matchesSearch && matchesCategory && matchesPlatform && matchesPricing;
    }).sort((a, b) => {
      if (sortBy === "popular") return b.salesCount - a.salesCount;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedPlatform, selectedPricing, sortBy]);

  // Pagination State for Storefront Catalog
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedPlatform, selectedPricing, sortBy]);

  const totalPages = Math.ceil(filteredAgents.length / pageSize) || 1;
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAgents.slice(start, start + pageSize);
  }, [filteredAgents, currentPage, pageSize]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPlatform("All Platforms");
    setSelectedPricing("all");
    setSortBy("popular");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          Explore AI Agents & Workflows
        </h1>
        <p className="text-text-secondary mt-2 max-w-2xl text-sm sm:text-base">
          Discover verified, production-tested AI agents ready to automate your enterprise workflows, sales pipelines, customer support, and developer operations.
        </p>
      </div>

      {/* Search & Main Filter Controls */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search agents by name, workflow, tech stack, or tags (e.g. n8n, hubspot, RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-ledger text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            )}
          </div>

          {/* Platform Selector */}
          <Dropdown
            value={selectedPlatform}
            onChange={(val) => setSelectedPlatform(val)}
            options={PLATFORM_OPTIONS}
            className="w-full sm:w-auto"
            menuWidth="w-full sm:w-56"
          />

          {/* Pricing Filter */}
          <Dropdown
            value={selectedPricing}
            onChange={(val) => setSelectedPricing(val)}
            options={PRICING_OPTIONS}
            className="w-full sm:w-auto"
            menuWidth="w-full sm:w-52"
          />

          {/* Sort Selector */}
          <Dropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={SORT_OPTIONS_STORE}
            className="w-full sm:w-auto"
            menuWidth="w-full sm:w-52"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-circuit text-void shadow-sm shadow-circuit/20 font-semibold"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-ledger hover:border-slate"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-text-muted mb-6">
        <div>
          Showing <span className="text-text-primary font-semibold">{filteredAgents.length}</span>{" "}
          {filteredAgents.length === 1 ? "agent" : "agents"}
        </div>
        {(searchQuery || selectedCategory !== "All" || selectedPlatform !== "All Platforms" || selectedPricing !== "all") && (
          <button
            onClick={resetFilters}
            className="text-signal hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAgents.map((agent) => (
              <Card
                key={agent.id}
                hover
                padding="none"
                className="flex flex-col h-full overflow-hidden group border-ledger hover:border-circuit/40 transition-all duration-300"
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Top Metadata Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="category">{agent.category}</Badge>
                      <Badge variant="platform">{agent.platform}</Badge>
                    </div>
                    {agent.featured && (
                      <span className="text-[11px] font-semibold text-signal flex items-center gap-1">
                        ⚡ Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/agents/${agent.slug}`}>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-circuit transition-colors line-clamp-2 mb-2">
                      {agent.title}
                    </h3>
                  </Link>

                  {/* Tagline */}
                  <p className="text-xs text-text-muted line-clamp-3 mb-4 flex-1">
                    {agent.tagline}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[11px] bg-void border border-ledger text-text-muted font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Seller Info & Rating */}
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-ledger/60 mb-4">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-surface border border-ledger flex items-center justify-center text-[10px]">
                        👤
                      </span>
                      <span className="font-medium text-text-primary">{agent.seller.name}</span>
                      {agent.seller.verified && (
                        <span className="text-circuit text-[11px]" title="Verified Seller">
                          ✓
                        </span>
                      )}
                    </div>
                    <Rating value={agent.rating} count={agent.reviewsCount} size="sm" />
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-2xl font-bold text-signal">
                        {agent.pricingModel === "free" ? "Free" : `$${agent.price}`}
                      </span>
                      {agent.pricingModel === "subscription" && (
                        <span className="text-xs text-text-muted ml-1">/mo</span>
                      )}
                    </div>
                    <Link href={`/agents/${agent.slug}`}>
                      <Button variant="outline" size="sm" className="group-hover:border-circuit group-hover:text-circuit">
                        View Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Agents Catalog Pagination Controls Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-surface/50 border border-ledger/80 shadow-md backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Summary Counter with Pulse Indicator */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 w-full md:w-auto text-center md:text-left">
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
                  {Math.min(currentPage * pageSize, filteredAgents.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-text-primary">
                  {filteredAgents.length}
                </span>{" "}
                agents
                {(searchQuery || selectedCategory !== "All" || selectedPlatform !== "All Platforms" || selectedPricing !== "all") && (
                  <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-signal/15 text-signal border border-signal/25">
                    Filtered
                  </span>
                )}
              </div>
            </div>

            {/* Center: Rows Per Page Density Controls */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 w-full md:w-auto text-xs text-text-muted">
              <span className="font-medium text-text-secondary">Agents per page:</span>
              <div className="inline-flex items-center p-1 rounded-xl bg-panel border border-ledger/90 shadow-inner gap-1">
                {[6, 9, 18, 36].map((size) => (
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
            <div className="flex items-center justify-center md:justify-end gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
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
                        onClick={() => {
                          setCurrentPage(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
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
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
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
        <Card padding="lg" className="text-center py-16">
          <EmptyState
            icon={
              <svg className="w-12 h-12 text-text-muted mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="No agents matched your criteria"
            description="Try adjusting your keywords, selecting a different platform or category, or clearing active filters."
            action={
              <Button variant="primary" onClick={resetFilters}>
                Clear All Filters
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}

export default function AgentsMarketplacePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-void py-8 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="max-w-[1440px] mx-auto py-12 text-center text-text-muted">Loading agent catalog...</div>}>
          <AgentsMarketplaceContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
