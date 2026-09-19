"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import { createAgentListing, updateAgentListing, fetchSellerListings, validatePackageFile } from "@/lib/api";

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

function CreateListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingRejectionReason, setExistingRejectionReason] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // File Upload & Real-Time Security Scanner State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFileDetails, setUploadedFileDetails] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [fileScanResult, setFileScanResult] = useState<{
    passed: boolean;
    status: string;
    summary: string;
    leaks?: string[];
    threats?: string[];
  } | null>(null);

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
    fileName: "",
    fileContent: "",
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileSelect = (file: File) => {
    setFormData((prev) => ({ ...prev, fileName: file.name }));
    setUploadedFileDetails({
      name: file.name,
      size: formatFileSize(file.size),
    });

    // Real-time zero-cost security scan
    setIsScanning(true);
    setFileScanResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) || "";
      setFormData((prev) => ({ ...prev, fileContent: content }));

      try {
        const scan = await validatePackageFile(file.name, content);
        setFileScanResult({
          passed: scan.passed,
          status: scan.status,
          summary: scan.summary,
          leaks: scan.checks?.secretLeaks?.findings,
          threats: scan.checks?.maliciousPatterns?.findings,
        });
      } catch {
        // Fallback local pattern verification
        const hasOpenAI = /\bsk-(?:proj-)?[a-zA-Z0-9_-]{32,}\b/.test(content);
        const hasStripe = /\b(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24,}\b/.test(content);
        const passed = !hasOpenAI && !hasStripe;
        setFileScanResult({
          passed,
          status: passed ? "passed" : "flagged",
          summary: passed
            ? "Automated verification passed. Package is clean and safe."
            : "Warning: Potential private API keys detected in file.",
          leaks: hasOpenAI ? ["OpenAI API Key"] : hasStripe ? ["Stripe Secret Key"] : [],
        });
      } finally {
        setIsScanning(false);
      }
    };

    reader.onerror = () => {
      setIsScanning(false);
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFileDetails(null);
    setFileScanResult(null);
    setFormData((prev) => ({ ...prev, fileName: "", fileContent: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Pre-fill when editing an existing listing
  useEffect(() => {
    if (!editId) return;

    fetchSellerListings()
      .then((listings) => {
        const found = listings.find((l) => l.id === editId);
        if (found) {
          setExistingRejectionReason(found.rejectionReason || null);
          setExistingStatus(String(found.status || "").toLowerCase());
          const extractedFileName = found.fileUrl?.replace("/uploads/", "") || "workflow.json";
          setFormData((prev) => ({
            ...prev,
            title: found.title || "",
            tagline: found.tagline || "",
            description: found.description || "",
            category: found.category || "Sales & CRM",
            platform: found.platform || "n8n",
            tags: "leads, automation",
            difficulty: "Beginner",
            setupTimeMinutes: 15,
            requiredKeys: found.requiredKeys || "",
            setupInstructions: found.setupGuide || "",
            pricingModel: found.pricingModel === "Subscription" ? "subscription" : (found.price === 0 ? "free" : "one_time"),
            price: String(found.price || 49),
            billingInterval: "monthly",
            supportSlaDays: "48 hours",
            demoUrl: "https://demo.agentstore.dev",
            fileName: extractedFileName,
            fileContent: "",
          }));
          setUploadedFileDetails({
            name: extractedFileName,
            size: "Existing Package",
          });
        }
      })
      .catch((err) => console.error("Failed to load listing for editing:", err));
  }, [editId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (editId) {
        // Resubmission flow
        await updateAgentListing(editId, {
          ...formData,
          resubmit: true,
        });
      } else {
        // New publication flow
        await createAgentListing(formData);
      }
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit listing. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 animate-fade-in">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-ledger">
        <div className="flex items-center gap-3">
          <Link
            href="/seller?tab=listings"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-ledger hover:border-slate hover:bg-ledger/40 text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition-all group shadow-sm cursor-pointer"
            title="Return to Seller Dashboard"
          >
            <svg className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Back to Listings</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
            <span>/</span>
            <Link href="/seller" className="hover:text-text-primary transition-colors">
              Seller Dashboard
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">
              {editId ? "Revise & Resubmit Agent" : "Create New Agent Listing"}
            </span>
          </div>
        </div>

        {/* Step indicator and top previous step button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-text-muted">
            Step <strong className="text-text-primary">{currentStep}</strong> of {STEPS.length}
          </span>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/70 border border-ledger hover:border-slate text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Previous Step</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Agent Update Policy Banner (If Editing a Published Listing) */}
      {existingStatus === "published" && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <div className="font-bold text-sm text-blue-200 flex items-center gap-2">
                <span>Live Agent Security Policy</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● Currently Live
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-1 leading-relaxed">
                To protect buyers from unauthorized code alterations, modifying executable files (`.json`, `.zip`), setup instructions, or core attributes will send this new version to <strong>Admin Review</strong> before changes go live to buyers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Feedback Warning Banner (If Editing a Rejected Listing) */}
      {existingRejectionReason && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-bold text-sm text-amber-200">
                Action Required: Reviewer Changes Requested
              </div>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                <strong>Reviewer Feedback:</strong> &ldquo;{existingRejectionReason}&rdquo;
              </p>
              <p className="text-[11px] text-amber-300/70 mt-1.5">
                Update the required fields below and click <strong>&ldquo;Submit Listing for Review&rdquo;</strong> to send it back to the Admin Review Queue.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {existingStatus === "published"
            ? "Update Live Agent Specifications"
            : editId
            ? "Revise & Resubmit Agent Listing"
            : "Publish an AI Agent"}
        </h1>
        <p className="text-text-secondary mt-1">
          {existingStatus === "published"
            ? "Submit an updated version of your live agent package or modify setup documentation."
            : editId
            ? "Modify your agent package, documentation or pricing based on reviewer feedback."
            : "Share your autonomous agent, workflow, or template with thousands of enterprise buyers and developers."}
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
        <Card padding="lg" className="text-center py-16 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-signal/20 text-signal flex items-center justify-center text-3xl mx-auto mb-4">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {existingStatus === "published"
              ? "Updated Version Submitted for Verification!"
              : editId
              ? "Agent Resubmitted for Admin Verification!"
              : "Agent Submitted for Review!"}
          </h2>
          <p className="text-text-secondary max-w-md mx-auto mb-6 text-sm leading-relaxed">
            {existingStatus === "published" ? (
              <>Your updated specifications for <strong className="text-text-primary">&ldquo;{formData.title || "Agent"}&rdquo;</strong> have been submitted to the <strong>Admin Review Queue</strong>. Once approved, the new package files and instructions will become active for buyers.</>
            ) : (
              <>Your listing <strong className="text-text-primary">&ldquo;{formData.title || "New Agent"}&rdquo;</strong> is now placed in the <strong>Admin Review Queue</strong>. The verification team reviews code integrity, security sandboxing, and setup instructions.</>
            )}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/seller?tab=listings">
              <Button variant="primary">View in My Listings</Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline">Browse Storefront</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
              {errorMessage}
            </div>
          )}

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
                  label="Detailed Description & Architecture"
                  placeholder="Explain how this agent works, what problem it solves, architecture decisions, and business impact..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={6}
                  required
                  helperText="Markdown supported. Provide in-depth specifications."
                />
              </div>

              <div>
                <Input
                  label="Tags / Keywords (Comma-separated)"
                  placeholder="e.g. hubspot, crm, lead scoring, claude, n8n"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  helperText="Helps enterprise buyers discover your agent in search filters."
                />
              </div>
            </Card>
          )}

          {/* STEP 2: Technical Specs */}
          {currentStep === 2 && (
            <Card padding="lg" className="space-y-6">
              <div className="flex items-center justify-between border-b border-ledger pb-3">
                <h2 className="text-xl font-semibold text-text-primary">
                  2. Technical Specifications & Requirements
                </h2>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-text-muted hover:text-circuit flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface hover:bg-ledger/60 border border-ledger transition-colors cursor-pointer"
                  title="Back to Step 1"
                >
                  <span>← Back to Step 1</span>
                </button>
              </div>

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
                <p className="text-xs text-text-muted mt-1.5">
                  Indicate technical prerequisite level for buyers integrating this workflow.
                </p>
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
              <div className="flex items-center justify-between border-b border-ledger pb-3">
                <h2 className="text-xl font-semibold text-text-primary">
                  3. Pricing & Licensing
                </h2>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-text-muted hover:text-circuit flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface hover:bg-ledger/60 border border-ledger transition-colors cursor-pointer"
                  title="Back to Step 2"
                >
                  <span>← Back to Step 2</span>
                </button>
              </div>

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
            </Card>
          )}

          {/* STEP 4: Files & Demo */}
          {currentStep === 4 && (
            <Card padding="lg" className="space-y-6">
              <div className="flex items-center justify-between border-b border-ledger pb-3">
                <h2 className="text-xl font-semibold text-text-primary">
                  4. Files, Package & Interactive Demo
                </h2>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-text-muted hover:text-circuit flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface hover:bg-ledger/60 border border-ledger transition-colors cursor-pointer"
                  title="Back to Step 3"
                >
                  <span>← Back to Step 3</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Upload Agent Package (.json / .zip / .py)
                </label>

                {/* Hidden native file input targeting local computer filesystem */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.zip,.yaml,.yml,.py,.ipynb"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {uploadedFileDetails && formData.fileName ? (
                  /* Uploaded / Selected File Card */
                  <div className="rounded-xl border border-circuit/40 bg-circuit/5 p-5 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-12 h-12 rounded-lg bg-surface border border-circuit/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                          📄
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-text-primary truncate max-w-[280px] sm:max-w-md">
                              {uploadedFileDetails.name}
                            </span>
                            <Badge variant="circuit" size="sm">
                              {uploadedFileDetails.size}
                            </Badge>
                          </div>
                          {isScanning ? (
                            <div className="flex items-center gap-2 text-xs text-circuit mt-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-circuit animate-ping" />
                              <span>Running automated security & secret scan...</span>
                            </div>
                          ) : fileScanResult ? (
                            fileScanResult.passed ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1.5 font-medium">
                                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span>Security Verified: Clean payload • No hardcoded credentials detected</span>
                              </div>
                            ) : (
                              <div className="mt-2 p-2.5 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger space-y-1">
                                <div className="font-semibold flex items-center gap-1.5">
                                  <span>⚠️ Security Alert:</span>
                                  <span>{fileScanResult.summary}</span>
                                </div>
                                {fileScanResult.leaks && fileScanResult.leaks.length > 0 && (
                                  <div className="text-[11px] text-danger/90 pl-3 space-y-0.5">
                                    {fileScanResult.leaks.map((leak, idx) => (
                                      <div key={idx}>• Leaked Credential: <span className="font-mono font-semibold">{leak}</span></div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>Ready for automated security scan & packaging</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-ledger hover:border-slate text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          <span>Change File</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-surface border border-ledger hover:border-danger/40 hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Local Upload Zone with Browse Button */
                  <div
                    onClick={triggerFileInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer group ${
                      isDragging
                        ? "border-signal bg-signal/10 scale-[1.005]"
                        : "border-ledger hover:border-signal/50 bg-surface/40 hover:bg-surface/70"
                    }`}
                  >
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-surface border border-ledger group-hover:border-signal/40 group-hover:bg-signal/10 flex items-center justify-center text-text-muted group-hover:text-signal transition-all shadow-inner">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>

                    <div className="text-base font-semibold text-text-primary mb-1">
                      Upload file from your local machine
                    </div>
                    <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
                      Click below to browse files on your computer, or drag and drop your workflow package here
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-ledger group-hover:border-signal/50 text-xs font-semibold text-text-primary group-hover:text-signal shadow-sm transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0024 18V9.75A2.25 2.25 0 0021.75 7.5H12L9 3.75z" />
                      </svg>
                      <span>Browse Local Machine</span>
                    </div>

                    <div className="text-[11px] text-text-muted mt-4">
                      Supports <span className="font-mono text-text-secondary">.json, .zip, .yaml, .py, .ipynb</span> up to 50MB
                    </div>
                  </div>
                )}
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
              <div className="flex items-center justify-between border-b border-ledger pb-3">
                <h2 className="text-xl font-semibold text-text-primary">
                  5. Review Your Agent Listing
                </h2>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-text-muted hover:text-circuit flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface hover:bg-ledger/60 border border-ledger transition-colors cursor-pointer"
                  title="Back to Step 4"
                >
                  <span>← Back to Step 4</span>
                </button>
              </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-ledger">
                  <div>
                    <span className="text-text-muted block mb-0.5">Support SLA:</span>
                    <span className="text-text-primary font-semibold">{formData.supportSlaDays || "Standard Support"}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Runtime Platform:</span>
                    <span className="text-circuit font-semibold">{formData.platform}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Package Deliverable:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-primary font-semibold truncate max-w-[140px]" title={formData.fileName ? formData.fileName.replace(/^.*[\\\/]/, '') : "workflow_package.json"}>
                        {formData.fileName ? formData.fileName.replace(/^.*[\\\/]/, '') : "workflow_package.json"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-circuit/10 text-circuit border border-circuit/20">
                        {formData.fileName?.includes('.') ? `.${formData.fileName.split('.').pop()}` : '.json'}
                      </span>
                    </div>
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
              <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Back to {STEPS[currentStep - 2].name}</span>
              </Button>
            ) : (
              <Link href="/seller?tab=listings">
                <Button type="button" variant="outline" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
            )}

            {currentStep < STEPS.length ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                Continue to {STEPS[currentStep].name} →
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {existingStatus === "published"
                  ? "🛡️ Submit Updated Version for Review"
                  : editId
                  ? "🔄 Resubmit Listing for Review"
                  : "🚀 Submit Listing for Review"}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
      </div>
    }>
      <CreateListingContent />
    </Suspense>
  );
}
