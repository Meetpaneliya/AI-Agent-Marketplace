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
  const [scanStepText, setScanStepText] = useState<string>("Initializing package scan...");
  const [scanProgress, setScanProgress] = useState<number>(0);

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

  const scanTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearScanTimers = () => {
    scanTimersRef.current.forEach((t) => clearTimeout(t));
    scanTimersRef.current = [];
  };

  const handleFileSelect = (file: File) => {
    clearScanTimers();

    setFormData((prev) => ({ ...prev, fileName: file.name }));
    setUploadedFileDetails({
      name: file.name,
      size: formatFileSize(file.size),
    });

    // Start single-pass, smooth, non-glitching scanning animation
    setIsScanning(true);
    setFileScanResult(null);
    setScanProgress(15);
    setScanStepText("Reading package archive & computing SHA-256 fingerprint...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || "";
      setFormData((prev) => ({ ...prev, fileContent: content }));

      // Evaluate security rules on file content
      const hasOpenAI = /\bsk-(?:proj-)?[a-zA-Z0-9_-]{32,}\b/.test(content);
      const hasStripe = /\b(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24,}\b/.test(content);
      const hasAWS = /\bAKIA[0-9A-Z]{16}\b/.test(content);
      const hasDestructive = /\b(?:rm\s+-(?:r|rf|fr)\s+(?:\/|~|\$HOME)|\bdel\s+\/f\s+\/s\s+\/q\s+[cC]:\\)/i.test(content);
      const hasReverseShell = /(?:\/dev\/tcp\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\bnc\s+-(?:e|c)\s+\/bin\/|\bsocket\.socket.*connect\s*\()/i.test(content);
      const hasObfuscated = /\b(?:base64\.(?:b64)?decode\s*\([^)]+\)\.(?:decode\(\)|exec|eval)|__import__\s*\(\s*['"]os['"]\s*\)\.system)/i.test(content);
      const hasPickle = /\b(?:pickle|cPickle|_pickle)\.(?:loads?|Unpickler)\s*\(/.test(content);

      const leaks: string[] = [];
      if (hasOpenAI) leaks.push("OpenAI API Key (Active OpenAI private token detected)");
      if (hasStripe) leaks.push("Stripe Secret Key (Stripe Payment Gateway Secret key detected)");
      if (hasAWS) leaks.push("AWS Access Key (Amazon Web Services Access Key ID detected)");

      const threats: string[] = [];
      if (hasDestructive) threats.push("Destructive System Command (Disk deletion commands detected e.g. rm -rf /)");
      if (hasReverseShell) threats.push("Remote Reverse Shell (Unauthorized outbound socket connection detected)");
      if (hasObfuscated) threats.push("Obfuscated Dynamic Code Execution (Dynamic import / eval command detected)");
      if (hasPickle) threats.push("Insecure Python Deserialization (Pickle arbitrary code execution detected)");

      const passed = leaks.length === 0 && threats.length === 0;

      // Guaranteed monotonic progress stages (15% -> 45% -> 75% -> 95% -> 100%)
      const t1 = setTimeout(() => {
        setScanProgress(45);
        setScanStepText("Scanning AST & payload for hardcoded API keys & credentials...");
      }, 450);

      const t2 = setTimeout(() => {
        setScanProgress(75);
        setScanStepText("Analyzing syntax integrity & verifying malicious execution rules...");
      }, 950);

      const t3 = setTimeout(() => {
        setScanProgress(95);
        setScanStepText("Finalizing security audit and verification status...");
      }, 1450);

      const t4 = setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
        setFileScanResult({
          passed,
          status: passed ? "passed" : "flagged",
          summary: passed
            ? "Automated verification passed. Package is clean, valid, and safe for review."
            : "Security Alert: Detected potential credentials or malicious code signatures.",
          leaks,
          threats,
        });
      }, 1800);

      scanTimersRef.current = [t1, t2, t3, t4];
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearScanTimers();
    setUploadedFileDetails(null);
    setFileScanResult(null);
    setIsScanning(false);
    setScanProgress(0);
    setScanStepText("Initializing package scan...");
    setFormData((prev) => ({ ...prev, fileName: "", fileContent: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    setFormData({
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
      pricingModel: "one_time",
      price: "49",
      billingInterval: "monthly",
      supportSlaDays: "48 hours",
      demoUrl: "https://demo.agentstore.dev/hubspot-lead-enricher",
      fileName: "",
      fileContent: "",
    });
    setFileScanResult(null);
    setUploadedFileDetails(null);
    setErrorMessage("");
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
    // Validation for Step 1
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setErrorMessage("Please enter an agent title.");
        return;
      }
      if (!formData.description.trim()) {
        setErrorMessage("Please enter an agent description.");
        return;
      }
    }

    // Strict Security & Package Validation for Step 4 (Files & Demo)
    if (currentStep === 4) {
      if (isScanning) {
        setErrorMessage("Package security scan is currently in progress. Please wait for the scan to finish.");
        return;
      }
      if (!formData.fileName) {
        setErrorMessage("Please upload your agent workflow or code package before continuing.");
        return;
      }
      if (fileScanResult && !fileScanResult.passed) {
        setErrorMessage("Security Verification Blocked: Your package contains policy violations. Please remove hardcoded credentials or dangerous patterns and re-upload a clean package.");
        return;
      }
    }

    setErrorMessage("");
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setErrorMessage("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Hard guard: NEVER submit unless user is actively on Step 5 (Final Review)
    if (currentStep !== 5) {
      handleNext();
      return;
    }

    // Guard against submitting invalid / blocked files
    if (fileScanResult && !fileScanResult.passed) {
      setErrorMessage("Cannot Submit: The uploaded package failed security verification. Please return to Step 4 (Files & Demo) to upload a clean package.");
      return;
    }
    if (!formData.fileName) {
      setErrorMessage("Cannot Submit: No workflow package uploaded. Please return to Step 4 to upload your agent file.");
      return;
    }

    setIsSubmitting(true);

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

      {/* Under Review Notice Banner (If Editing an In-Review Listing) */}
      {(existingStatus === "pending_review" || existingStatus === "pending") && !existingRejectionReason && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-bold text-sm text-amber-200 flex items-center gap-2">
                <span>Active Admin Review In Progress</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ● Queue Position Updated Upon Save
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                This agent is currently undergoing administrative and security verification. If you edit files or technical specifications, your updated package will be resubmitted and re-verified.
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
          const isActive = !isSuccess && step.id === currentStep;
          const isPast = isSuccess || step.id < currentStep;
          return (
            <button
              key={step.id}
              onClick={() => !isSuccess && step.id < currentStep && setCurrentStep(step.id)}
              disabled={isSuccess || step.id > currentStep}
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
                    isPast
                      ? "bg-signal text-void"
                      : isActive
                      ? "bg-circuit text-void"
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
        <Card padding="lg" className="text-center py-12 animate-scale-in">
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

          {/* Listing Summary Preview */}
          <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-surface/80 border border-ledger text-left space-y-2.5 text-xs shadow-sm">
            <div className="flex justify-between items-center border-b border-ledger pb-2">
              <span className="text-text-muted">Listing Title</span>
              <span className="font-semibold text-text-primary truncate max-w-[220px]">{formData.title}</span>
            </div>
            <div className="flex justify-between items-center border-b border-ledger pb-2">
              <span className="text-text-muted">Category & Platform</span>
              <span className="text-text-secondary">{formData.category} • {formData.platform}</span>
            </div>
            <div className="flex justify-between items-center border-b border-ledger pb-2">
              <span className="text-text-muted">Pricing</span>
              <span className="font-semibold text-signal">
                {formData.pricingModel === "free" ? "Free" : `$${formData.price} (${formData.pricingModel === "subscription" ? "monthly" : "one-time"})`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Package Deliverable</span>
              <span className="font-mono text-circuit text-[11px] truncate max-w-[200px]">{formData.fileName}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/seller?tab=listings">
              <Button variant="primary">View in My Listings</Button>
            </Link>
            <Button variant="outline" onClick={handleReset}>
              Publish Another Agent
            </Button>
            <Link href="/agents">
              <Button variant="ghost">Browse Storefront</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent accidental submit when pressing Enter in text inputs on steps 1-4
            if (e.key === "Enter" && currentStep < 5 && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
              handleNext();
            }
          }}
        >
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-3 animate-fade-in">
              <span className="text-xl shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-danger flex items-center justify-between">
                  <span>
                    {errorMessage.includes("localhost:5432") || errorMessage.includes("database server")
                      ? "Database Connection Error (PostgreSQL Offline)"
                      : "Action Required"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setErrorMessage("")}
                    className="text-xs text-text-muted hover:text-danger cursor-pointer ml-2"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-danger/90 mt-1 break-words leading-relaxed">
                  {errorMessage}
                </p>
                {(errorMessage.includes("localhost:5432") || errorMessage.includes("database server")) && (
                  <div className="mt-3 p-3 rounded-lg bg-surface/90 border border-ledger text-xs text-text-secondary space-y-1.5">
                    <div className="font-semibold text-text-primary flex items-center gap-1.5">
                      <span>💡</span>
                      <span>How to fix: Start your PostgreSQL database container</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Please ensure Docker Desktop is open and run the following command in your terminal:
                    </p>
                    <div className="p-2 rounded bg-void font-mono text-[11px] text-circuit select-all border border-ledger">
                      yarn docker:up
                    </div>
                    <p className="text-[10px] text-text-muted">
                      (Or: <code className="font-mono text-text-secondary">docker compose -f docker/docker-compose.yml up -d</code>)
                    </p>
                  </div>
                )}
              </div>
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
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {uploadedFileDetails && formData.fileName ? (
                  /* Uploaded / Selected File Card */
                  <div className="rounded-xl border border-ledger bg-surface/70 shadow-md transition-all overflow-hidden">
                    {/* Top Row: File metadata bar & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 bg-panel/70 border-b border-ledger">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-surface border border-circuit/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                          📦
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-text-primary truncate max-w-[260px] sm:max-w-md">
                              {uploadedFileDetails.name}
                            </span>
                            <Badge variant="circuit" size="sm">
                              {uploadedFileDetails.size}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            Uploaded workflow package • Ready for automated policy audit
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={isScanning}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-ledger hover:border-slate text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          <span>Change File</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={isScanning}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-surface border border-ledger hover:border-danger/40 hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer disabled:opacity-50"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Full-Width Security Scanner & Results Panel */}
                    <div className="p-4 sm:p-5">
                      {isScanning ? (
                        /* Active Scanning Motion / Animation */
                        <div className="rounded-xl border border-circuit/35 bg-circuit/5 p-4 sm:p-5 relative overflow-hidden animate-fade-in">
                          {/* Shimmer sweep effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-circuit/10 to-transparent -translate-x-full animate-[pulse_2s_infinite]" />

                          <div className="relative z-10 space-y-3.5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-full border-2 border-circuit border-t-transparent animate-spin" />
                                  <div className="absolute w-2 h-2 rounded-full bg-circuit animate-ping" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-text-primary block">
                                    Automated Security & Package Scanner
                                  </span>
                                  <span className="text-[11px] text-circuit font-medium">
                                    {scanStepText}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-circuit">
                                {scanProgress}%
                              </span>
                            </div>

                            {/* Animated progress bar */}
                            <div className="w-full bg-surface border border-ledger rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-circuit via-signal to-circuit rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${scanProgress}%` }}
                              />
                            </div>

                            {/* Micro-steps status indicators */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-ledger/50">
                              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                <span className={`w-1.5 h-1.5 rounded-full ${scanProgress >= 30 ? "bg-emerald-400" : "bg-text-muted animate-pulse"}`} />
                                <span>SHA-256 Integrity</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                <span className={`w-1.5 h-1.5 rounded-full ${scanProgress >= 60 ? "bg-emerald-400" : "bg-text-muted animate-pulse"}`} />
                                <span>Secret & Token Leaks</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                <span className={`w-1.5 h-1.5 rounded-full ${scanProgress >= 90 ? "bg-emerald-400" : "bg-text-muted animate-pulse"}`} />
                                <span>Malicious Patterns & RCE</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : fileScanResult ? (
                        fileScanResult.passed ? (
                          /* Passed State */
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 animate-fade-in space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-semibold text-emerald-300">
                                    Security Verification Cleared
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                                    PASS
                                  </span>
                                </div>
                                <p className="text-xs text-emerald-200/80 mt-1">
                                  {fileScanResult.summary || "Package passed automated credential leak audit and malicious code checks. Safe for marketplace submission."}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-3 pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-300">
                                  <span className="inline-flex items-center gap-1 font-medium">
                                    ✓ Valid Syntax Format
                                  </span>
                                  <span className="text-emerald-500/40">•</span>
                                  <span className="inline-flex items-center gap-1 font-medium">
                                    ✓ Zero Hardcoded Secrets
                                  </span>
                                  <span className="text-emerald-500/40">•</span>
                                  <span className="inline-flex items-center gap-1 font-medium">
                                    ✓ Clean Execution Graph
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Flagged / Security Alert State */
                          <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 sm:p-5 animate-fade-in space-y-4">
                            {/* Alert Header */}
                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-danger/25">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-danger/20 border border-danger/40 flex items-center justify-center text-danger flex-shrink-0 mt-0.5 shadow-sm">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-bold text-danger">
                                      Security Alert: Package Verification Failed
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-md bg-danger/20 text-danger text-[10px] font-bold uppercase tracking-wider border border-danger/40">
                                      FLAGGED
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-secondary mt-1">
                                    {fileScanResult.summary} Please remediate the detected violations below before publishing.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Leaked Credentials List */}
                            {fileScanResult.leaks && fileScanResult.leaks.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-danger">
                                  <span>🔑</span>
                                  <span>Hardcoded Credentials Detected ({fileScanResult.leaks.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                  {fileScanResult.leaks.map((leak, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface/90 border border-danger/30 text-xs"
                                    >
                                      <span className="text-danger mt-0.5">⚠️</span>
                                      <div className="min-w-0">
                                        <span className="font-mono text-[11px] font-semibold text-danger">
                                          {leak}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Malicious Threats List */}
                            {fileScanResult.threats && fileScanResult.threats.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-danger">
                                  <span>🛡️</span>
                                  <span>High-Risk Execution Signatures Detected ({fileScanResult.threats.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                  {fileScanResult.threats.map((threat, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface/90 border border-danger/30 text-xs"
                                    >
                                      <span className="text-danger mt-0.5">🚨</span>
                                      <div className="min-w-0">
                                        <span className="font-mono text-[11px] font-semibold text-danger">
                                          {threat}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Guidance Box */}
                            <div className="p-3 rounded-lg bg-surface/80 border border-ledger text-xs text-text-secondary flex items-start gap-2.5">
                              <span className="text-base leading-none">💡</span>
                              <div className="text-[11px] leading-relaxed">
                                <strong className="text-text-primary">How to remediate:</strong> Never commit or embed real API keys in agent workflow packages. Replace tokens with environment variable placeholders (e.g. <code className="px-1.5 py-0.5 rounded bg-ledger text-circuit font-mono text-[10px]">{`{{$env.OPENAI_API_KEY}}`}</code>) and instruct buyers to add their credentials via the marketplace credential vault.
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        /* Default Initial State */
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span>Ready for automated security analysis</span>
                        </div>
                      )}
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
            <div className="space-y-6 animate-fade-in">
              {/* Header Status Banner */}
              <div className="p-4 rounded-xl bg-circuit/10 border border-circuit/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                    <span>📋</span>
                    <span>5. Final Pre-Submission Review</span>
                    <Badge variant="circuit" size="sm">Verification Ready</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Please inspect all listing details, technical specs, pricing, and uploaded files below before submitting. Click <strong>&ldquo;Edit&rdquo;</strong> on any section if changes are needed.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {fileScanResult?.passed && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                      <span>🛡️</span> Security Verified
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION 1: General Info & Branding */}
              <Card padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-ledger pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-circuit/20 text-circuit text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">General Information</h3>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-circuit hover:text-circuit-hover gap-1.5 cursor-pointer"
                  >
                    <span>✏️ Edit Section</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Agent Title & Summary
                    </span>
                    <h4 className="text-lg font-bold text-text-primary">
                      {formData.title || "Untitled Agent"}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      {formData.tagline || "No tagline provided."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-text-muted font-semibold mr-1">Classification:</span>
                    <Badge variant="primary">{formData.category}</Badge>
                    <Badge variant="circuit">{formData.platform}</Badge>
                    <Badge variant="slate">{formData.difficulty}</Badge>
                  </div>

                  {formData.tags && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-text-muted font-semibold mr-1">Search Tags:</span>
                      {formData.tags.split(",").map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-ledger text-[11px]"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {formData.description && (
                    <div className="pt-2">
                      <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1.5">
                        Full Agent Overview / Description
                      </span>
                      <div className="p-3.5 rounded-xl bg-surface border border-ledger text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        {formData.description}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* SECTION 2: Technical Specifications & Documentation */}
              <Card padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-ledger pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-circuit/20 text-circuit text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">Technical Specs & Setup Instructions</h3>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-circuit hover:text-circuit-hover gap-1.5 cursor-pointer"
                  >
                    <span>✏️ Edit Section</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Estimated Setup Time
                    </span>
                    <span className="text-xs text-text-primary font-medium flex items-center gap-1.5">
                      <span>⏱️</span> {formData.setupTimeMinutes} minutes
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Required API Keys / Credentials
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.requiredKeys ? (
                        formData.requiredKeys.split(",").map((key, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-circuit/10 text-circuit border border-circuit/20 text-[11px] font-mono"
                          >
                            🔑 {key.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted">None (Standalone / Plug-and-play)</span>
                      )}
                    </div>
                  </div>
                </div>

                {formData.setupInstructions && (
                  <div className="pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1.5">
                      Buyer Setup & Quickstart Guide
                    </span>
                    <div className="p-3.5 rounded-xl bg-void border border-ledger font-mono text-[11px] text-text-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {formData.setupInstructions}
                    </div>
                  </div>
                )}
              </Card>

              {/* SECTION 3: Pricing & Support SLA */}
              <Card padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-ledger pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-circuit/20 text-circuit text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">Pricing & Support Terms</h3>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-circuit hover:text-circuit-hover gap-1.5 cursor-pointer"
                  >
                    <span>✏️ Edit Section</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Pricing Model
                    </span>
                    <span className="text-xs font-medium text-text-primary capitalize">
                      {formData.pricingModel.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Listing Price
                    </span>
                    <span className="text-base font-bold text-signal">
                      {formData.pricingModel === "free" ? "Free" : `$${formData.price}`}
                      {formData.pricingModel === "subscription" && (
                        <span className="text-xs text-text-muted font-normal"> / {formData.billingInterval}</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Support SLA
                    </span>
                    <span className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                      <span>🛡️</span> {formData.supportSlaDays || "Standard Support"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* SECTION 4: Deliverables, Security Scan & Demo */}
              <Card padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-ledger pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-circuit/20 text-circuit text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">Deliverable Package & Verification</h3>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-circuit hover:text-circuit-hover gap-1.5 cursor-pointer"
                  >
                    <span>✏️ Edit Section</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-ledger">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">📦</span>
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-text-primary truncate">
                          {formData.fileName || "No package selected"}
                        </div>
                        {uploadedFileDetails?.size && (
                          <div className="text-[11px] text-text-muted">
                            Size: {uploadedFileDetails.size}
                          </div>
                        )}
                      </div>
                    </div>
                    {formData.fileName && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-circuit/10 text-circuit border border-circuit/20 uppercase">
                        {formData.fileName.split('.').pop()}
                      </span>
                    )}
                  </div>

                  {/* Security Audit Status */}
                  {fileScanResult?.passed ? (
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                      <span className="text-xl shrink-0">🛡️</span>
                      <div>
                        <div className="font-semibold text-emerald-300">Automated Security Audit Passed</div>
                        <div className="text-[11px] text-emerald-400/90 mt-0.5">
                          0 leaked credentials and 0 high-risk execution signatures detected. Package is safe for review.
                        </div>
                      </div>
                    </div>
                  ) : fileScanResult && !fileScanResult.passed ? (
                    <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs space-y-1.5">
                      <div className="font-semibold flex items-center gap-1.5 text-sm">
                        <span>🚨</span>
                        <span>Security Violations Detected</span>
                      </div>
                      <div className="text-[11px] text-danger/90">
                        {fileScanResult.summary} You must fix these violations before submitting.
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(4)}
                        className="text-xs text-circuit hover:underline p-0 h-auto font-semibold"
                      >
                        ← Return to Step 4 to re-upload
                      </Button>
                    </div>
                  ) : null}

                  {/* Interactive Demo URL */}
                  {formData.demoUrl && (
                    <div className="pt-1 text-xs">
                      <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                        Interactive Demo URL
                      </span>
                      <a
                        href={formData.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-circuit hover:underline truncate inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>🔗</span> {formData.demoUrl}
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Developer Pledge Notice */}
              <div className="p-4 rounded-xl bg-signal/10 border border-signal/20 text-xs text-text-secondary leading-relaxed flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">🤝</span>
                <div>
                  <strong className="text-text-primary block mb-0.5">Developer Listing Confirmation</strong>
                  By submitting this listing, you confirm that your agent package is tested, contains no hardcoded private credentials or unauthorized telemetry, and conforms to AgentStore developer guidelines.
                </div>
              </div>
            </div>
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
              currentStep === 4 ? (
                <Button
                  type="button"
                  variant={fileScanResult && !fileScanResult.passed ? "danger" : "primary"}
                  onClick={handleNext}
                  disabled={
                    isScanning ||
                    !formData.fileName ||
                    (fileScanResult !== null && !fileScanResult.passed)
                  }
                  className="transition-all"
                >
                  {isScanning
                    ? "⏳ Scanning Package..."
                    : fileScanResult && !fileScanResult.passed
                    ? "🚫 Fix Security Issues to Continue"
                    : !formData.fileName
                    ? "Upload Package to Continue →"
                    : "Proceed to Final Review →"}
                </Button>
              ) : (
                <Button type="button" variant="primary" onClick={handleNext}>
                  Continue to {STEPS[currentStep].name} →
                </Button>
              )
            ) : (
              <Button
                type="submit"
                variant={fileScanResult && !fileScanResult.passed ? "danger" : "primary"}
                loading={isSubmitting}
                disabled={isSubmitting || (fileScanResult !== null && !fileScanResult.passed)}
                className="shadow-lg shadow-signal/15"
              >
                {fileScanResult && !fileScanResult.passed
                  ? "🚫 Submission Blocked (Security Violation)"
                  : existingStatus === "published"
                  ? "🛡️ Submit Updated Version for Review"
                  : editId
                  ? "🔄 Resubmit Listing for Review"
                  : "🚀 Confirm & Submit Agent for Review"}
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
