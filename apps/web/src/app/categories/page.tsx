import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Agent Categories — AgentStore",
  description: "Browse AI agents across sales, customer support, marketing, engineering, devops, and analytics.",
};

const CATEGORIES = [
  {
    name: "Sales & CRM",
    slug: "sales-crm",
    icon: "💼",
    count: 28,
    description: "Inbound lead qualification, CRM enrichment, auto-dialers, deal velocity predictors, and sales draft generation.",
  },
  {
    name: "Customer Support",
    slug: "customer-support",
    icon: "🎧",
    count: 35,
    description: "Omnichannel ticket triage, RAG knowledge-base retrieval, empathetic tier-1 resolution, and SLA churn prediction.",
  },
  {
    name: "Marketing & Content",
    slug: "marketing-content",
    icon: "📢",
    count: 42,
    description: "Autonomous SEO research, viral thread generation, multi-platform publishing, and ad creative optimization.",
  },
  {
    name: "Engineering & DevOps",
    slug: "engineering-devops",
    icon: "⚙️",
    count: 19,
    description: "Kubernetes pod incident self-healing, pull request code security auditing, CI/CD triage, and runbook automation.",
  },
  {
    name: "Data & Analytics",
    slug: "data-analytics",
    icon: "📊",
    count: 24,
    description: "Text-to-SQL querying, automated KPI alerting, cohort analysis, and interactive executive reporting dashboards.",
  },
  {
    name: "Finance & Operations",
    slug: "finance-ops",
    icon: "💳",
    count: 16,
    description: "Invoice OCR extraction, accounts receivable reconciliation, expense categorization, and fraud anomaly detection.",
  },
  {
    name: "HR & Recruiting",
    slug: "hr-recruiting",
    icon: "👥",
    count: 12,
    description: "Resume screening against job descriptions, candidate sourcing sequences, interview scheduling, and onboarding workflows.",
  },
  {
    name: "Workflow Automation",
    slug: "workflow-automation",
    icon: "⚡",
    count: 53,
    description: "General multi-agent systems, webhook routing, Zapier/Make/n8n bridge orchestrators, and browser RPA bots.",
  },
];

export default function CategoriesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-void py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Explore by Category
            </h1>
            <p className="text-text-secondary mt-2 text-sm sm:text-base">
              Find specialized AI agents engineered specifically for your department, tech stack, and industry workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href="/agents">
                <Card hover padding="lg" className="h-full flex flex-col group border-ledger hover:border-circuit/40">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-ledger flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-text-primary text-base mb-1 group-hover:text-circuit transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed flex-1 mb-4">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-circuit font-medium pt-3 border-t border-ledger/50">
                    <span>{cat.count} agents</span>
                    <span>Browse category →</span>
                  </div>
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
