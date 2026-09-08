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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPlatform("All Platforms");
    setSelectedPricing("all");
    setSortBy("popular");
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
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit cursor-pointer"
          >
            {PLATFORMS.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>

          {/* Pricing Filter */}
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit cursor-pointer"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free / Open Source</option>
            <option value="one_time">One-Time Purchase</option>
            <option value="subscription">Subscription</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
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
