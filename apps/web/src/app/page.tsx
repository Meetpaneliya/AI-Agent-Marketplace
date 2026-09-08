import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import { AGENTS_CATALOG } from "@/lib/agents-data";

// ─── Demo Data ───
const categories = [
  { name: "Sales & CRM", slug: "Sales & CRM", icon: "💼", count: 28 },
  { name: "Customer Support", slug: "Customer Support", icon: "🎧", count: 35 },
  { name: "Marketing & Content", slug: "Marketing & Content", icon: "📢", count: 42 },
  { name: "Engineering & DevOps", slug: "Engineering & DevOps", icon: "⚙️", count: 19 },
  { name: "Data & Analytics", slug: "Data & Analytics", icon: "📊", count: 24 },
  { name: "Workflow Automation", slug: "Workflow Automation", icon: "⚡", count: 53 },
  { name: "Finance & Accounting", slug: "Finance & Operations", icon: "💰", count: 16 },
  { name: "HR & Recruiting", slug: "HR & Recruiting", icon: "👥", count: 12 },
];

const platforms = [
  { name: "n8n", slug: "n8n" },
  { name: "LangChain", slug: "langchain" },
  { name: "Make.com", slug: "make" },
  { name: "Flowise", slug: "flowise" },
  { name: "AutoGen", slug: "autogen" },
  { name: "CrewAI", slug: "crewai" },
  { name: "Custom Python API", slug: "custom-api" },
];

const featuredAgents = AGENTS_CATALOG;

const stats = [
  { label: "AI Agents Listed", value: "500+" },
  { label: "Active Sellers", value: "120+" },
  { label: "Downloads", value: "10K+" },
  { label: "Avg. Rating", value: "4.7★" },
];

const howItWorks = [
  {
    step: "01",
    title: "Browse & Discover",
    description: "Search our marketplace for AI agents matching your use case. Filter by platform, category, and rating.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Purchase & Download",
    description: "Buy with one click via Stripe or Razorpay. Instantly download the agent file — JSON, Python, or workflow zip.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Deploy & Run",
    description: "Import into your platform, plug in your own API keys, and your agent is live. Full setup guides included.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-signal/5 rounded-full blur-3xl" />
            <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-circuit/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="text-center max-w-3xl mx-auto">
              {/* Label */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-signal/10 border border-signal/20 text-signal text-sm font-medium mb-6 animate-fade-in">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                The #1 Marketplace for AI Agents
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Buy & Sell{" "}
                <span className="text-signal">AI Agents</span>
                <br />
                Like Never Before
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Browse production-ready automation workflows for n8n, Make, LangChain & more.
                Download, plug in your API keys, and deploy in minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Link href="/agents">
                  <Button size="lg" variant="primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Agents
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Start Selling
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-text-primary">{stat.value}</div>
                    <div className="text-sm text-text-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Platform Tags ─── */}
        <section className="border-y border-ledger bg-panel/50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-sm text-text-muted mr-2">Compatible with:</span>
              {platforms.map((p) => (
                <Badge key={p.slug} variant="platform" size="md">
                  {p.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Agents ─── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                  🔥 Featured Agents
                </h2>
                <p className="text-text-muted">
                  Top-rated agents hand-picked by our team
                </p>
              </div>
              <Link href="/agents" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  View All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.map((agent, i) => (
                <Link key={agent.id} href={`/agents/${agent.slug}`}>
                  <Card hover padding="none" className="h-full group animate-fade-in" >
                    {/* Card Thumbnail */}
                    <div className="h-40 bg-surface rounded-t-xl flex items-center justify-center border-b border-ledger relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-signal/5 to-circuit/5" />
                      <span className="text-5xl relative z-10">{categories.find(c => c.name === agent.category)?.icon || "🤖"}</span>
                    </div>

                    <div className="p-5">
                      {/* Platform + Category */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="platform" size="sm">{agent.platform}</Badge>
                        <Badge variant="category" size="sm">{agent.category}</Badge>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-text-primary mb-2 group-hover:text-signal transition-colors line-clamp-1">
                        {agent.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-text-muted mb-4 line-clamp-2">
                        {agent.tagline || agent.description}
                      </p>

                      {/* Rating + Sales */}
                      <div className="flex items-center gap-3 mb-4">
                        <Rating value={agent.rating} size="sm" count={agent.reviewsCount} />
                        <span className="text-xs text-text-muted">• {agent.salesCount} sales</span>
                      </div>

                      {/* Price + Seller */}
                      <div className="flex items-center justify-between pt-4 border-t border-ledger">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface border border-ledger flex items-center justify-center text-xs font-medium text-text-muted">
                            {agent.seller.name[0]}
                          </div>
                          <span className="text-sm text-text-secondary">{agent.seller.name}</span>
                          {agent.seller.verified && (
                            <svg className="w-4 h-4 text-circuit" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-lg font-bold text-signal">
                          ${agent.price}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Mobile view all */}
            <div className="mt-8 text-center sm:hidden">
              <Link href="/agents">
                <Button variant="outline" size="md">View All Agents</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Browse by Category ─── */}
        <section className="py-16 sm:py-20 bg-panel/30">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                Browse by Category
              </h2>
              <p className="text-text-muted max-w-lg mx-auto">
                Find the perfect AI agent for your specific use case
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/agents?category=${cat.slug}`}>
                  <Card hover padding="md" className="text-center group">
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <h3 className="font-semibold text-text-primary text-sm group-hover:text-signal transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">{cat.count} agents</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="py-16 sm:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                How It Works
              </h2>
              <p className="text-text-muted max-w-lg mx-auto">
                Get your AI agent running in 3 simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {howItWorks.map((item, i) => (
                <div key={item.step} className="text-center relative">
                  {/* Connector line */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-ledger" />
                  )}

                  {/* Step circle */}
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface border border-ledger flex items-center justify-center text-signal">
                    {item.icon}
                  </div>

                  {/* Step number */}
                  <span className="inline-block text-xs font-mono text-circuit bg-circuit/10 px-2 py-0.5 rounded-full mb-3">
                    Step {item.step}
                  </span>

                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Seller CTA ─── */}
        <section className="py-16 sm:py-20 bg-panel/30">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-circuit/10 border border-circuit/20 text-circuit text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Earn passive income
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
                Build Once, Sell Forever
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
                Turn your AI agents and automation workflows into a recurring revenue stream. 
                List on AgentStore and reach thousands of buyers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Start Selling Today
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </Link>
              </div>

              {/* Seller Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                {[
                  { title: "Low 15% Commission", desc: "Introductory rate — you keep 85% of every sale" },
                  { title: "Instant Payouts", desc: "Bi-weekly payouts via Stripe, Razorpay, or PayPal" },
                  { title: "Full Analytics", desc: "Track views, conversions, revenue, and buyer insights" },
                ].map((benefit) => (
                  <Card key={benefit.title} padding="md">
                    <h4 className="font-semibold text-text-primary mb-1 text-sm">{benefit.title}</h4>
                    <p className="text-xs text-text-muted">{benefit.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
