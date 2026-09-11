"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, upgradeToSeller, UserProfile } from "@/lib/api";
import { Navbar, Footer } from "@/components/layout";
import SellerSidebar from "@/components/layout/SellerSidebar";
import SellerTopbar from "@/components/layout/SellerTopbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function SellerLayoutContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError("");
    try {
      const updated = await upgradeToSeller();
      setUser(updated.user);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upgrade account. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-signal/10 border border-signal/20 text-signal flex items-center justify-center text-2xl mx-auto mb-4">
              🔒
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Seller Authentication Required
            </h1>
            <p className="text-sm text-text-muted mb-6">
              Please log in with your Seller account to manage listings, view revenue analytics, or publish AI agents.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button variant="primary" fullWidth size="md">
                  Log In to Continue
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" fullWidth size="md">
                  Create a Seller Account
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  const role = (user.role || "").toUpperCase();
  const isSeller = role === "SELLER" || role === "ADMIN" || user.isSeller;

  // Logged in as BUYER
  if (!isSeller) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-lg w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-signal/10 border border-signal/30 text-signal flex items-center justify-center text-3xl mx-auto mb-4">
              ⚡
            </div>
            <span className="inline-block px-2.5 py-1 rounded-full bg-circuit/10 text-circuit text-xs font-semibold mb-3">
              Current Role: Buyer ({user.email})
            </span>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Seller Access Required
            </h1>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Your account is currently registered as a <strong className="text-text-primary">Buyer</strong>. Publishing new AI agent listings, tracking creator revenue, and seller payout tools are exclusively reserved for Seller accounts.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={handleUpgrade}
                loading={upgrading}
              >
                ⚡ Upgrade to Seller (Instant)
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost" size="md">
                  Go to Buyer Dashboard →
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  // Seller or Admin: Render Dedicated Sidebar Dashboard Shell
  return (
    <div className="min-h-screen bg-void flex text-text-primary">
      {/* Left Navigation Sidebar */}
      <SellerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <SellerTopbar onToggleMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 sm:pb-36">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
      </div>
    }>
      <SellerLayoutContent>{children}</SellerLayoutContent>
    </Suspense>
  );
}
