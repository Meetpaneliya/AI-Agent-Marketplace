"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import LogoutModal from "../ui/LogoutModal";
import { getCurrentUser, logoutUser, UserProfile } from "@/lib/api";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/agents?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    } else {
      router.push("/agents");
    }
  };

  const role = (user?.role || "").toUpperCase();
  const isSeller = role === "SELLER" || user?.isSeller;
  const isAdmin = role === "ADMIN";

  return (
    <nav className="sticky top-0 z-40 bg-panel/90 backdrop-blur-xl border-b border-ledger">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-signal flex items-center justify-center shadow-md shadow-signal/25 group-hover:bg-signal-hover transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-text-primary">Agent</span>
              <span className="text-signal ml-1">Store</span>
            </span>
          </Link>

          {/* Search Bar — Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
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
                placeholder="Search AI agents, workflows, prompts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-ledger text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30 transition-all"
              />
            </div>
          </form>

          {/* Nav Links — Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/agents"
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
            >
              Browse Agents
            </Link>
            <Link
              href="/categories"
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
            >
              Categories
            </Link>
          </div>

          {/* Right Action Buttons — Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* Seller Quick Action: Publish */}
                {(isSeller || isAdmin) ? (
                  <Link href="/seller/listings/new">
                    <Button variant="primary" size="sm">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Publish Agent
                    </Button>
                  </Link>
                ) : (
                  <Link href="/seller">
                    <Button variant="outline" size="sm" className="border-signal/40 text-signal hover:bg-signal/10">
                      ⚡ Become a Seller
                    </Button>
                  </Link>
                )}

                {/* Dashboard Link Button */}
                <Link href={isSeller || isAdmin ? "/seller" : "/dashboard"}>
                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                    {isSeller || isAdmin ? "⚡ Creator Studio" : "🛒 My Dashboard"}
                  </Button>
                </Link>

                {/* Clean User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdown((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-ledger bg-surface hover:border-ledger-hover transition-all cursor-pointer"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isAdmin
                        ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                        : isSeller
                        ? "bg-signal/15 text-signal border border-signal/30"
                        : "bg-circuit/15 text-circuit border border-circuit/30"
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <svg className={`w-4 h-4 text-text-muted transition-transform ${userDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-panel border border-ledger shadow-xl shadow-void/80 p-2 z-50 animate-scale-in">
                      <div className="px-3 py-2 border-b border-ledger mb-1">
                        <div className="font-semibold text-sm text-text-primary truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-text-muted truncate">
                          {user.email}
                        </div>
                        <div className="mt-1.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : isSeller
                              ? "bg-signal/10 text-signal border border-signal/20"
                              : "bg-circuit/10 text-circuit border border-circuit/20"
                          }`}>
                            {user.role || "User"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href={isSeller || isAdmin ? "/seller" : "/dashboard"}
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        >
                          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                          </svg>
                          <span>{isSeller || isAdmin ? "Seller Studio Dashboard" : "Buyer Purchases Dashboard"}</span>
                        </Link>

                        {(isSeller || isAdmin) && (
                          <Link
                            href="/seller/listings/new"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-signal hover:bg-signal/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Publish New Agent</span>
                          </Link>
                        )}
                      </div>

                      <div className="mt-1 pt-1 border-t border-ledger">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdown(false);
                            setShowLogoutModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
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
              <Link
                href="/agents"
                className="px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Browse Agents
              </Link>
              <Link
                href="/categories"
                className="px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Categories
              </Link>

              {user && (
                <Link
                  href={isSeller || isAdmin ? "/seller" : "/dashboard"}
                  className="px-3 py-2.5 text-sm text-signal font-medium rounded-lg bg-signal/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {isSeller || isAdmin ? "⚡ Seller Studio Dashboard" : "🛒 Buyer Purchases Dashboard"}
                </Link>
              )}
            </div>

            {/* Mobile Auth Buttons */}
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="md" fullWidth>Log In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" fullWidth>Create Account</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-ledger">
                <div className="px-3 py-1.5 flex items-center justify-between text-xs text-text-muted">
                  <span>Logged in as <strong className="text-text-primary">{user.name}</strong></span>
                  <span className="px-2 py-0.5 rounded bg-surface border border-ledger font-semibold text-signal">
                    {user.role}
                  </span>
                </div>
                {isSeller || isAdmin ? (
                  <Link href="/seller/listings/new" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>+ Publish Agent</Button>
                  </Link>
                ) : (
                  <Link href="/seller" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="md" fullWidth className="text-signal border-signal/40">
                      ⚡ Become a Seller
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="text-danger hover:bg-danger/10"
                >
                  Log Out
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={user?.name}
        userRole={isAdmin ? "Admin" : isSeller ? "Seller" : "Buyer"}
      />
    </nav>
  );
}
