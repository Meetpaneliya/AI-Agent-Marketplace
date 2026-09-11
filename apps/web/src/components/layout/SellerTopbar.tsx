"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getCurrentUser, logoutUser, UserProfile } from "@/lib/api";
import { useEffect, useState } from "react";
import LogoutModal from "../ui/LogoutModal";

interface SellerTopbarProps {
  onToggleMobileSidebar: () => void;
}

export default function SellerTopbar({ onToggleMobileSidebar }: SellerTopbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const getPageTitle = () => {
    if (pathname === "/seller/listings/new") return "Publish New Agent";
    if (currentTab === "listings") return "My Listings & Workflows";
    if (currentTab === "analytics") return "Performance & Analytics";
    if (currentTab === "payouts") return "Earnings & Payouts";
    if (currentTab === "settings") return "Store & Account Settings";
    return "Creator Dashboard Overview";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-panel/90 backdrop-blur-xl border-b border-ledger px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-text-muted text-xs sm:text-sm">Creator Studio</span>
          <svg className="w-3.5 h-3.5 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-text-primary font-semibold text-xs sm:text-sm capitalize">
            {pathname === "/seller/listings/new" ? "Publish Agent" : currentTab}
          </span>
        </div>
      </div>

      {/* Right: Live Status, Quick Action & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Store Live & Accepting Orders
        </div>

        {/* Action: New Listing (if not already on the new listing page) */}
        {pathname !== "/seller/listings/new" && (
          <Link
            href="/seller/listings/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-signal hover:bg-signal-hover !text-white text-xs font-semibold shadow-sm shadow-signal/25 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>New Agent</span>
          </Link>
        )}

        {/* Store Link */}
        <Link
          href="/agents"
          className="hidden md:inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface transition-colors"
          title="View Public Marketplace"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Storefront
        </Link>

        {/* User Mini Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-ledger">
          <div className="w-8 h-8 rounded-full bg-signal/15 border border-signal/30 text-signal flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-xs text-text-muted hover:text-danger px-2 py-1 rounded hover:bg-danger/10 transition-colors cursor-pointer"
            title="Log Out"
          >
            Logout
          </button>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={user?.name}
        userRole={user?.role || "Seller"}
      />
    </header>
  );
}
