"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { logoutUser } from "@/lib/api";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  userName?: string;
  userRole?: string;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userRole,
}: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoggingOut) {
        onClose();
      }
    },
    [onClose, isLoggingOut]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const handleLogout = () => {
    setIsLoggingOut(true);
    if (onConfirm) {
      onConfirm();
    } else {
      logoutUser();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={() => {
          if (!isLoggingOut) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-panel border border-ledger rounded-2xl p-6 shadow-2xl shadow-black/80 animate-scale-in z-10">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/25 text-danger flex items-center justify-center text-xl mb-4 shadow-sm shadow-danger/20">
          <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-text-primary tracking-tight mb-2">
          Confirm Sign Out
        </h3>
        <p className="text-sm text-text-muted leading-relaxed mb-4">
          Are you sure you want to sign out? You will need to log back in to access your dashboard, purchased agents, or seller studio.
        </p>

        {/* Account Info Pill */}
        {(userName || userRole) && (
          <div className="py-2 px-3 rounded-xl bg-surface border border-ledger flex items-center justify-between text-xs mb-6">
            <span className="text-text-muted">Signed in as</span>
            <div className="flex items-center gap-2 font-medium text-text-primary">
              <span>{userName || "User"}</span>
              {userRole && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-signal/15 text-signal border border-signal/30">
                  {userRole}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface border border-ledger transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoggingOut ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Yes, Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
