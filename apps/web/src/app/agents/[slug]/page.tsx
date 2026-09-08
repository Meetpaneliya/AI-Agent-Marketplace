"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import Modal from "@/components/ui/Modal";
import { AGENTS_CATALOG, AgentItem } from "@/lib/agents-data";

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Find agent or fallback to first
  const agent: AgentItem =
    AGENTS_CATALOG.find((a) => a.slug === slug) || AGENTS_CATALOG[0];

  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "reviews" | "demo">("overview");
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [demoInput, setDemoInput] = useState("Acme Corp - 250 employees, looking to automate B2B inbound CRM lead qualification");
  const [demoOutput, setDemoOutput] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const runDemo = () => {
    setDemoRunning(true);
    setDemoOutput("");
    setTimeout(() => {
      setDemoOutput(
        JSON.stringify(
          {
            status: "QUALIFIED_TIER_1",
            icp_score: 94,
            reasoning: "Enterprise size (>200 FTE), high CRM automation budget, high urgency B2B inbound intent.",
            recommended_action: "Priority 1-hour BDR follow-up + assign to Enterprise AE team",
            enrichment: {
              industry: "Enterprise SaaS",
              estimated_arr: "$25M - $50M",
              crm_detected: "HubSpot Enterprise",
            },
            generated_email_draft: "Subject: Streamlining Acme Corp's inbound lead pipeline with autonomous workflows...",
          },
          null,
          2
        )
      );
      setDemoRunning(false);
    }, 1200);
  };

  const handleCheckout = () => {
    setPurchaseSuccess(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-void py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
            <Link href="/" className="hover:text-text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/agents" className="hover:text-text-primary transition-colors">
              Agents
            </Link>
            <span>/</span>
            <span className="text-text-secondary">{agent.category}</span>
            <span>/</span>
            <span className="text-text-primary font-medium truncate max-w-xs">
              {agent.title}
            </span>
          </div>

          {/* Top Hero / Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <Badge variant="primary">{agent.category}</Badge>
              <Badge variant="circuit">{agent.platform}</Badge>
              <Badge variant="slate">{agent.difficulty}</Badge>
              <span className="text-xs text-text-muted">Updated {agent.updatedAt}</span>
              <span className="text-xs text-text-muted">• {agent.version}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight mb-3">
              {agent.title}
            </h1>

            <p className="text-base text-text-secondary max-w-4xl leading-relaxed mb-4">
              {agent.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Rating value={agent.rating} count={agent.reviewsCount} size="md" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-text-primary font-semibold">{agent.salesCount}</span>
                <span>deployments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>By</span>
                <span className="text-text-primary font-medium">{agent.seller.name}</span>
                {agent.seller.verified && (
                  <span className="text-circuit font-bold" title="Verified Developer">
                    ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Grid: Left Content (70%) + Right Sticky Sidebar (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Navigation Tabs */}
              <div className="flex border-b border-ledger gap-1 sm:gap-2">
                {[
                  { id: "overview", label: "Overview & Features" },
                  { id: "demo", label: "Interactive Simulator" },
                  { id: "setup", label: "Prerequisites & Setup" },
                  { id: "reviews", label: `Reviews (${agent.reviewsCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? "border-circuit text-circuit bg-circuit/5"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <Card padding="lg">
                    <h2 className="text-lg font-bold text-text-primary mb-3">
                      About this Agent
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6">
                      {agent.description}
                    </p>

                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
                      Key Capabilities & Deliverables
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {agent.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                          <span className="w-5 h-5 rounded-full bg-signal/10 text-signal flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            ✓
                          </span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Architecture / How it Works Card */}
                  <Card padding="lg">
                    <h2 className="text-lg font-bold text-text-primary mb-3">
                      Architecture & Data Flow
                    </h2>
                    <div className="p-4 rounded-xl bg-surface border border-ledger text-xs font-mono text-circuit leading-relaxed overflow-x-auto">
                      {`[Incoming Webhook / Event]
      │
      ▼
[Input Validation & Data Sanitizer]
      │
      ▼
[Enrichment Layer (Clearbit / Custom API)]
      │
      ▼
[LLM Reasoning Engine (${agent.platform} + GPT-4o / Claude 3.5)]
      │
      ├── [Confidence Score >= 85%] ──► [Auto-Trigger CRM Sync & Alert]
      │
      └── [Edge Case / Low Score]   ──► [Queue for Human-in-the-Loop Review]`}
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 2: INTERACTIVE SIMULATOR */}
              {activeTab === "demo" && (
                <Card padding="lg" className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      Test-Drive Agent in Sandboxed Simulator
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                      Input sample data to watch the agent process reasoning and return formatted payload outputs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Sample Input Payload
                    </label>
                    <textarea
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-ledger text-xs text-text-primary focus:outline-none focus:border-circuit font-mono"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={runDemo}
                    loading={demoRunning}
                  >
                    ⚡ Execute Agent Workflow
                  </Button>

                  {demoOutput && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                        <span>Autonomous Agent Execution Output (JSON)</span>
                        <span className="text-signal">Response in 184ms • Simulated</span>
                      </div>
                      <pre className="p-4 rounded-xl bg-panel border border-ledger text-xs font-mono text-signal overflow-x-auto">
                        {demoOutput}
                      </pre>
                    </div>
                  )}
                </Card>
              )}

              {/* TAB 3: SETUP & REQUIREMENTS */}
              {activeTab === "setup" && (
                <Card padding="lg" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary mb-2">
                      System Prerequisites
                    </h2>
                    <div className="space-y-2">
                      {agent.prerequisites.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="w-2 h-2 rounded-full bg-circuit"></span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-ledger">
                    <h3 className="text-base font-semibold text-text-primary mb-2">
                      Quick Start Guide
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
                      <li>Download the package file ({agent.platformSlug}_agent_package.json) after checkout.</li>
                      <li>Open your {agent.platform} console and click <strong>Import Workflow</strong>.</li>
                      <li>Add your API keys to the environment variables or credentials vault.</li>
                      <li>Enable the workflow trigger and run the initial health test.</li>
                    </ol>
                  </div>
                </Card>
              )}

              {/* TAB 4: REVIEWS */}
              {activeTab === "reviews" && (
                <Card padding="lg" className="space-y-6">
                  <div className="flex items-center justify-between border-b border-ledger pb-4">
                    <div>
                      <div className="text-3xl font-bold text-text-primary">{agent.rating}</div>
                      <Rating value={agent.rating} count={agent.reviewsCount} size="md" />
                    </div>
                    <div className="text-right text-xs text-text-muted">
                      100% Verified Buyer Reviews
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Marcus Vance",
                        role: "VP of Growth @ CloudScale",
                        stars: 5,
                        date: "3 days ago",
                        comment: "Saved our SDR team at least 15 hours a week. Imported directly into our self-hosted n8n in under 10 minutes without any glitches.",
                      },
                      {
                        name: "Sarah Jenkins",
                        role: "Head of Operations @ Apex AI",
                        stars: 5,
                        date: "2 weeks ago",
                        comment: "Exceptional prompt engineering. The ICP qualification logic handled our edge cases flawlessly. Highly recommended!",
                      },
                    ].map((rev, i) => (
                      <div key={i} className="p-4 rounded-xl bg-surface border border-ledger space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-text-primary text-sm">{rev.name}</span>
                            <span className="text-xs text-text-muted ml-2">{rev.role}</span>
                          </div>
                          <span className="text-xs text-text-muted">{rev.date}</span>
                        </div>
                        <Rating value={rev.stars} size="sm" />
                        <p className="text-xs text-text-secondary leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-6 sticky top-20">
              {/* Purchase Card */}
              <Card padding="lg" className="border-circuit/30 shadow-lg shadow-circuit/5">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-signal">
                      {agent.pricingModel === "free" ? "Free" : `$${agent.price}`}
                    </span>
                    {agent.pricingModel === "subscription" && (
                      <span className="text-xs text-text-muted ml-1">/ month</span>
                    )}
                  </div>
                  <Badge variant={agent.pricingModel === "free" ? "signal" : "circuit"}>
                    {agent.pricingModel === "free" ? "Open Source" : "Commercial License"}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base font-semibold"
                    onClick={() => setPurchaseModalOpen(true)}
                  >
                    {agent.pricingModel === "free" ? "Download Agent Free" : `Get Agent ($${agent.price})`}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => setActiveTab("demo")}
                  >
                    ⚡ Try Live Simulator
                  </Button>
                </div>

                {/* Guarantees & Features Checklist */}
                <div className="space-y-2.5 text-xs text-text-secondary pt-4 border-t border-ledger">
                  <div className="flex items-center gap-2">
                    <span className="text-signal">🛡️</span>
                    <span><strong>14-Day Escrow Protection:</strong> Full refund if not satisfied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-signal">⚡</span>
                    <span><strong>Instant Delivery:</strong> Expiring signed download token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-signal">🔄</span>
                    <span><strong>1 Year of Updates:</strong> Bug fixes & runtime compatibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-signal">🔒</span>
                    <span><strong>Security Scanned:</strong> Zero telemetry or malicious code</span>
                  </div>
                </div>
              </Card>

              {/* Developer / Seller Card */}
              <Card padding="md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-circuit/10 border border-circuit/30 text-circuit flex items-center justify-center font-bold text-sm">
                    {agent.seller.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-text-primary text-sm">
                        {agent.seller.name}
                      </span>
                      {agent.seller.verified && (
                        <span className="text-signal text-xs" title="Verified Creator">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">{agent.seller.handle}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-surface rounded-lg mb-3">
                  <div>
                    <span className="text-text-muted block">Rating</span>
                    <span className="text-text-primary font-bold">★ {agent.seller.rating}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Total Sales</span>
                    <span className="text-text-primary font-bold">{agent.seller.salesCount}+</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs">
                  Ask Seller a Question
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase / Checkout Modal */}
      <Modal
        isOpen={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          setPurchaseSuccess(false);
        }}
        title={purchaseSuccess ? "Order Confirmed!" : `Checkout: ${agent.title}`}
      >
        {purchaseSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-signal/20 text-signal flex items-center justify-center text-2xl mx-auto">
              ✓
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              Download Ready!
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Your license has been registered. Your secure expiring download link has been generated and also sent to your account email.
            </p>
            <div className="p-3 rounded-lg bg-surface border border-ledger text-xs font-mono text-circuit truncate">
              https://api.agentstore.dev/v1/downloads/signed_token_{agent.slug}
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  alert("Downloading agent package...");
                  setPurchaseModalOpen(false);
                  setPurchaseSuccess(false);
                }}
              >
                📥 Download Package Now (.json)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-surface border border-ledger flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-text-primary">{agent.title}</div>
                <div className="text-xs text-text-muted">Format: {agent.platform} Workflow Package</div>
              </div>
              <div className="text-base font-bold text-text-primary">
                {agent.pricingModel === "free" ? "Free" : `$${agent.price}`}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-signal/10 border border-signal/20 text-xs text-text-secondary">
              🛡️ <strong>Escrow Guarantee:</strong> 14-day refund window. Funds released to creator only after warranty period.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPurchaseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCheckout}>
                Confirm & Access Download →
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}
