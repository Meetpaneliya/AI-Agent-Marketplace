"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar, Footer } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";

const STEPS = [
  { id: 1, name: "General Info", desc: "Title, category & platform" },
  { id: 2, name: "Technical Specs", desc: "Integrations & requirements" },
  { id: 3, name: "Pricing & License", desc: "Pricing model & support" },
  { id: 4, name: "Files & Demo", desc: "Workflow files & preview" },
  { id: 5, name: "Review & Submit", desc: "Final verification" },
];

const CATEGORIES = [
  "Sales & CRM",
  "Customer Support",
  "Marketing & Content",
  "Data & Analytics",
  "Engineering & DevOps",
  "Finance & Operations",
  "HR & Recruiting",
  "Workflow Automation",
];

const PLATFORMS = [
  "n8n",
  "LangChain",
  "Flowise",
  "Make.com",
  "AutoGen",
  "CrewAI",
  "LlamaIndex",
  "Custom API / Python",
];

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    category: "Sales & CRM",
    platform: "n8n",
    tags: "leads, hubspot, automation",
    difficulty: "Beginner",
    setupTimeMinutes: 15,
    requiredKeys: "OpenAI API Key, HubSpot Private App Token",
    setupInstructions: "1. Import the .json workflow into your n8n workspace.\n2. Configure OpenAI and HubSpot credentials in the credentials vault.\n3. Activate webhook trigger and test with sample lead.",
    pricingModel: "one_time", // 'free' | 'one_time' | 'subscription'
    price: "49",
    billingInterval: "monthly",
    supportSlaDays: "48 hours",
    demoUrl: "https://demo.agentstore.dev/hubspot-lead-enricher",
    fileName: "hubspot_lead_enricher_v1.0.json",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-void py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/seller" className="hover:text-text-primary transition-colors">
              Seller Dashboard
            </Link>
            <span>/</span>
            <span className="text-text-primary">Create New Agent Listing</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Publish an AI Agent
            </h1>
            <p className="text-text-secondary mt-1">
              Share your autonomous agent, workflow, or template with thousands of enterprise buyers and developers.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-circuit/10 border-circuit text-circuit ring-1 ring-circuit/30"
                      : isPast
                      ? "bg-surface border-ledger text-text-primary hover:border-slate cursor-pointer"
                      : "bg-panel/40 border-ledger/50 text-text-muted cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? "bg-circuit text-void"
                          : isPast
                          ? "bg-signal text-void"
                          : "bg-ledger text-text-muted"
                      }`}
                    >
                      {isPast ? "✓" : step.id}
                    </span>
                    <span className="text-xs font-semibold">{step.name}</span>
                  </div>
                  <p className="text-[11px] truncate opacity-70 hidden sm:block">
                    {step.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {isSuccess ? (
            <Card padding="lg" className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-signal/20 text-signal flex items-center justify-center text-3xl mx-auto mb-4">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Agent Submitted for Review!
              </h2>
              <p className="text-text-secondary max-w-md mx-auto mb-6 text-sm">
                Your agent <strong className="text-text-primary">"{formData.title || "New Agent"}"</strong> has been queued for automated security sandboxing and metadata verification. Approval usually takes 2-4 hours.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/seller">
                  <Button variant="outline">Go to Seller Dashboard</Button>
                </Link>
                <Link href="/agents">
                  <Button variant="primary">Browse Marketplace</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: General Info */}
              {currentStep === 1 && (
                <Card padding="lg" className="space-y-6">
                  <h2 className="text-xl font-semibold text-text-primary border-b border-ledger pb-3">
                    1. General Information
                  </h2>

                  <div>
                    <Input
                      label="Agent Title"
                      placeholder="e.g. Autonomous Lead Qualification & HubSpot Sync Agent"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                      helperText="A clear, outcome-focused title highlighting value."
                    />
                  </div>

                  <div>
                    <Input
                      label="Tagline / Short Summary"
                      placeholder="e.g. Enriches inbound leads from forms, evaluates ICP fit via Claude 3.5, and syncs to CRM in 30 seconds."
                      value={formData.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      required
                      helperText="Max 140 characters. Displayed on marketplace listing cards."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Target Platform / Runtime
                      </label>
                      <select
                        value={formData.platform}
                        onChange={(e) => handleChange("platform", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30"
                      >
                        {PLATFORMS.map((plat) => (
                          <option key={plat} value={plat}>
                            {plat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Textarea
                      label="Detailed Description"
                      placeholder="Explain how this agent works, what problem it solves, architecture decisions, and business impact..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Keywords / Tags"
                      placeholder="lead-gen, crm, hubspot, n8n, automation"
                      value={formData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                      helperText="Comma-separated tags for search discoverability."
                    />
                  </div>
                </Card>
              )}

              {/* STEP 2: Technical Specs */}
              {currentStep === 2 && (
                <Card padding="lg" className="space-y-6">
                  <h2 className="text-xl font-semibold text-text-primary border-b border-ledger pb-3">
                    2. Technical Specifications & Requirements
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Setup Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => handleChange("difficulty", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-ledger text-sm text-text-primary focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30"
                      >
                        <option value="Beginner">Beginner (No coding required, plug & play)</option>
                        <option value="Intermediate">Intermediate (Basic API keys & webhook setup)</option>
                        <option value="Advanced">Advanced (Custom Docker container or self-hosted runtime)</option>
                      </select>
                    </div>

                    <div>
                      <Input
                        label="Estimated Setup Time (Minutes)"
                        type="number"
                        value={formData.setupTimeMinutes.toString()}
                        onChange={(e) => handleChange("setupTimeMinutes", parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Required API Keys & Third-Party Accounts"
                      placeholder="e.g. OpenAI API Key, Slack Webhook, HubSpot API Key"
                      value={formData.requiredKeys}
                      onChange={(e) => handleChange("requiredKeys", e.target.value)}
                      helperText="List credentials the buyer must supply themselves."
                    />
                  </div>

                  <div>
                    <Textarea
                      label="Quick Start / Setup Instructions"
                      value={formData.setupInstructions}
                      onChange={(e) => handleChange("setupInstructions", e.target.value)}
                      rows={5}
                      helperText="Provide step-by-step onboarding for the buyer."
                    />
                  </div>
                </Card>
              )}

              {/* STEP 3: Pricing & Licensing */}
              {currentStep === 3 && (
                <Card padding="lg" className="space-y-6">
                  <h2 className="text-xl font-semibold text-text-primary border-b border-ledger pb-3">
                    3. Pricing & Licensing
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      Select Pricing Model
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          id: "one_time",
                          title: "One-Time Purchase",
                          desc: "Buyer pays once and gets perpetual license + 1 year of updates",
                        },
                        {
                          id: "subscription",
                          title: "Recurring Subscription",
                          desc: "Continuous updates, priority maintenance & hosting access",
                        },
                        {
                          id: "free",
                          title: "Free / Open Source",
                          desc: "Free for community adoption, build reputation & lead gen",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleChange("pricingModel", item.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            formData.pricingModel === item.id
                              ? "bg-circuit/10 border-circuit ring-1 ring-circuit/30"
                              : "bg-surface border-ledger hover:border-slate"
                          }`}
                        >
                          <div className="font-semibold text-text-primary text-sm mb-1">
                            {item.title}
                          </div>
                          <div className="text-xs text-text-muted leading-relaxed">
                            {item.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.pricingModel !== "free" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label={formData.pricingModel === "subscription" ? "Monthly Subscription ($ USD)" : "Listing Price ($ USD)"}
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                          placeholder="49"
                          required
                          helperText="Platform fee is 15%. You receive 85% of net proceeds."
                        />
                      </div>
                      <div>
                        <Input
                          label="Support Response SLA"
                          value={formData.supportSlaDays}
                          onChange={(e) => handleChange("supportSlaDays", e.target.value)}
                          placeholder="e.g. 24 hours / 48 hours"
                          helperText="Guaranteed seller response SLA for buyer disputes."
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-surface border border-ledger text-sm text-text-secondary">
                    <div className="font-semibold text-text-primary mb-1">🛡️ Buyer Protection & Escrow</div>
                    <p className="text-xs text-text-muted">
                      Funds are held in platform escrow for 14 days during the guarantee period. Downloads are automatically granted upon checkout via secure expiring signed URLs.
                    </p>
                  </div>
                </Card>
              )}

              {/* STEP 4: Files & Demo */}
              {currentStep === 4 && (
                <Card padding="lg" className="space-y-6">
                  <h2 className="text-xl font-semibold text-text-primary border-b border-ledger pb-3">
                    4. Files, Package & Interactive Demo
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Upload Agent Package (.json / .zip / .py)
                    </label>
                    <div className="border-2 border-dashed border-ledger hover:border-circuit rounded-xl p-8 text-center bg-surface/50 transition-colors">
                      <div className="text-3xl mb-2">📦</div>
                      <div className="text-sm font-medium text-text-primary mb-1">
                        Drag and drop your agent workflow file here, or click to browse
                      </div>
                      <div className="text-xs text-text-muted mb-4">
                        Supports .json, .zip, .yaml, .py, .ipynb up to 50MB
                      </div>
                      <Badge variant="circuit">{formData.fileName}</Badge>
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Interactive Live Demo URL (Optional)"
                      placeholder="https://your-demo-endpoint.com or sandbox link"
                      value={formData.demoUrl}
                      onChange={(e) => handleChange("demoUrl", e.target.value)}
                      helperText="Allows prospective buyers to test agent output with sandboxed inputs."
                    />
                  </div>
                </Card>
              )}

              {/* STEP 5: Review & Submit */}
              {currentStep === 5 && (
                <Card padding="lg" className="space-y-6">
                  <h2 className="text-xl font-semibold text-text-primary border-b border-ledger pb-3">
                    5. Review Your Agent Listing
                  </h2>

                  <div className="p-5 rounded-xl bg-surface border border-ledger space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="primary">{formData.category}</Badge>
                          <Badge variant="circuit">{formData.platform}</Badge>
                          <Badge variant="slate">{formData.difficulty}</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">
                          {formData.title || "Untitled Agent"}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {formData.tagline || "No tagline provided."}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-signal">
                          {formData.pricingModel === "free" ? "Free" : `$${formData.price}`}
                        </div>
                        <div className="text-xs text-text-muted">
                          {formData.pricingModel === "subscription" ? "per month" : "one-time"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-ledger">
                      <div>
                        <span className="text-text-muted block">Setup Time:</span>
                        <span className="text-text-primary font-semibold">{formData.setupTimeMinutes} mins</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Support SLA:</span>
                        <span className="text-text-primary font-semibold">{formData.supportSlaDays}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">File Asset:</span>
                        <span className="text-text-primary font-semibold truncate block">{formData.fileName}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Escrow Protected:</span>
                        <span className="text-signal font-semibold">14-Day Guarantee</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-signal/10 border border-signal/20 text-xs text-text-secondary leading-relaxed">
                    By submitting this listing, you confirm that your agent does not contain hardcoded private secrets or malicious payload code, and conforms to AgentStore Developer Guidelines.
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-ledger">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    ← Back
                  </Button>
                ) : (
                  <Link href="/seller">
                    <Button type="button" variant="ghost">
                      Cancel
                    </Button>
                  </Link>
                )}

                {currentStep < STEPS.length ? (
                  <Button type="button" variant="primary" onClick={handleNext}>
                    Continue to {STEPS[currentStep].name} →
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" loading={isSubmitting}>
                    🚀 Submit Listing for Review
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
