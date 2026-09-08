"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
    }, 1000);
  };

  return (
    <Card padding="lg" className="w-full">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-circuit/10 border border-circuit/30 text-circuit flex items-center justify-center text-xl mx-auto mb-3">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Set New Password</h1>
        <p className="text-sm text-text-muted mt-1">
          Enter your new password below to regain access to your account
        </p>
      </div>

      {completed ? (
        <div className="text-center py-4 space-y-4">
          <div className="p-4 rounded-xl bg-signal/10 border border-signal/20 text-signal text-sm">
            🎉 Your password has been successfully reset! You can now log in with your new credentials.
          </div>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Proceed to Login →
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Minimum 8 characters with letters & numbers"
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Update Password
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}
