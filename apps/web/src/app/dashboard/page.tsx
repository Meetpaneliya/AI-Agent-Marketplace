import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Dashboard",
};

export default function BuyerDashboard() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
            <p className="text-text-muted">Manage your purchases, downloads, and account</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Purchases", value: "0", icon: "🛒" },
              { label: "Downloads", value: "0", icon: "📥" },
              { label: "Active Subscriptions", value: "0", icon: "🔄" },
              { label: "Reviews Given", value: "0", icon: "⭐" },
            ].map((stat) => (
              <Card key={stat.label} padding="md">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Purchases */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Recent Purchases</h2>
              <Link href="/dashboard/purchases">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            <EmptyState
              icon={<span>🛒</span>}
              title="No purchases yet"
              description="Browse our marketplace to find the perfect AI agent for your needs."
              action={
                <Link href="/agents">
                  <Button variant="primary" size="md">Browse Agents</Button>
                </Link>
              }
            />
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
