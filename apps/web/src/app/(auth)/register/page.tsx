"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { registerUser, UserRole } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!acceptTerms) {
      setError("You must accept the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      await registerUser(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        role
      );
      if (role === "SELLER") {
        router.push("/seller");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg" className="animate-scale-in max-w-lg w-full mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Create your account
        </h1>
        <p className="text-sm text-text-muted">
          Choose your account type to get started on AgentStore
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
          Select Your Account Role
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Buyer Card */}
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              role === "BUYER"
                ? "bg-circuit/10 border-circuit shadow-sm shadow-circuit/20 text-text-primary"
                : "bg-surface border-ledger text-text-secondary hover:border-ledger-hover hover:bg-ledger/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🛒</span>
              {role === "BUYER" && (
                <span className="w-5 h-5 rounded-full bg-circuit text-void flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="font-semibold text-sm text-text-primary">Buyer</div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Explore, purchase & deploy AI agents for business
            </p>
          </button>

          {/* Seller Card */}
          <button
            type="button"
            onClick={() => setRole("SELLER")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              role === "SELLER"
                ? "bg-signal/10 border-signal shadow-sm shadow-signal/20 text-text-primary"
                : "bg-surface border-ledger text-text-secondary hover:border-ledger-hover hover:bg-ledger/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚡</span>
              {role === "SELLER" && (
                <span className="w-5 h-5 rounded-full bg-signal text-void flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="font-semibold text-sm text-text-primary">Seller</div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Publish & sell AI workflows, prompts & earn money
            </p>
          </button>
        </div>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={() => setError("Google OAuth credentials will be active once provided")}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-surface border border-ledger text-text-primary text-sm font-medium hover:bg-ledger transition-colors mb-5 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign up with Google as {role === "BUYER" ? "Buyer" : "Seller"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 h-px bg-ledger" />
        <span className="text-xs text-text-muted uppercase tracking-wider">or sign up with email</span>
        <div className="flex-1 h-px bg-ledger" />
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <label className="flex items-start gap-2.5 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-ledger bg-surface accent-signal"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-circuit hover:text-circuit-hover">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-circuit hover:text-circuit-hover">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Create {role === "BUYER" ? "Buyer" : "Seller"} Account
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-sm text-text-muted text-center mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-signal hover:text-signal-hover font-medium transition-colors"
        >
          Log in
        </Link>
      </p>
    </Card>
  );
}
