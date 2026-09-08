"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <Card padding="lg" className="w-full">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-circuit/10 border border-circuit/30 text-circuit flex items-center justify-center text-xl mx-auto mb-3">
          🔑
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Reset Password</h1>
        <p className="text-sm text-text-muted mt-1">
          Enter your account email and we'll send a password recovery link
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="p-4 rounded-xl bg-signal/10 border border-signal/20 text-signal text-sm">
            Check your inbox! If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
          </div>
          <p className="text-xs text-text-muted">
            Didn't receive the email? Check your spam folder or try again with another address.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                ← Back to Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            helperText="The email associated with your AgentStore account"
          />

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              ← Remember your password? Sign in
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}
