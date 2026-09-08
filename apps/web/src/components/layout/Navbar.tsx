"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";

const navLinks = [
  { label: "Browse Agents", href: "/agents" },
  { label: "Categories", href: "/categories" },
  { label: "Seller Dashboard", href: "/seller" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/agents?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    } else {
      router.push("/agents");
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-panel/90 backdrop-blur-xl border-b border-ledger">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-signal flex items-center justify-center shadow-md shadow-signal/20 group-hover:bg-signal-hover transition-colors">
              <svg className="w-5 h-5 text-void" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">
              Agent<span className="text-signal">Store</span>
            </span>
          </Link>

          {/* Search Bar — Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI agents, workflows, templates (e.g. n8n, CRM)..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-ledger text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30 transition-all"
              />
            </div>
          </form>

          {/* Nav Links — Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Buttons — Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/seller/listings/new">
              <Button variant="primary" size="sm">
                Publish Agent
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-ledger mt-2 pt-4 animate-slide-up">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-circuit"
              />
            </form>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="md" fullWidth>Log In</Button>
              </Link>
              <Link href="/seller/listings/new" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" fullWidth>Publish Agent</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
