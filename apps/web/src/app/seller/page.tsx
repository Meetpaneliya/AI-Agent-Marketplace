import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Seller Dashboard",
};

export default function SellerDashboard() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Seller Dashboard</h1>
              <p className="text-text-muted">Manage your listings, sales, and payouts</p>
            </div>
            <Link href="/seller/listings/new">
              <Button variant="primary" size="md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Listing
              </Button>
            </Link>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", value: "$0.00", icon: "💰", color: "text-signal" },
              { label: "Total Sales", value: "0", icon: "📦", color: "text-circuit" },
              { label: "Active Listings", value: "0", icon: "📋", color: "text-text-primary" },
              { label: "Avg. Rating", value: "—", icon: "⭐", color: "text-signal" },
            ].map((stat) => (
              <Card key={stat.label} padding="md">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Listings */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Your Listings</h2>
              <Link href="/seller/listings">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            <EmptyState
              icon={<span>🚀</span>}
              title="No listings yet"
              description="Create your first AI agent listing and start earning. It only takes a few minutes."
              action={
                <Link href="/seller/listings/new">
                  <Button variant="primary" size="md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Your First Listing
                  </Button>
                </Link>
              }
            />
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              {
                title: "Seller Guidelines",
                desc: "Learn how to create great listings that sell",
                icon: "📖",
                href: "/docs/seller-guidelines",
              },
              {
                title: "Payout Settings",
                desc: "Configure your payout method and schedule",
                icon: "🏦",
                href: "/seller/settings/payouts",
              },
              {
                title: "Analytics",
                desc: "Track views, conversions, and revenue",
                icon: "📊",
                href: "/seller/analytics",
              },
            ].map((action) => (
              <Link key={action.title} href={action.href}>
                <Card hover padding="md" className="h-full">
                  <span className="text-2xl mb-3 block">{action.icon}</span>
                  <h3 className="font-semibold text-text-primary text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-text-muted">{action.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
