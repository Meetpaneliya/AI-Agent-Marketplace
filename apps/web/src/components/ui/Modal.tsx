"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  "3xl": "max-w-6xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  size = "md",
  className = "",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={`
          relative w-full ${sizeStyles[size] || "max-w-lg"}
          bg-panel border border-ledger rounded-2xl
          shadow-2xl shadow-black/90
          my-auto flex flex-col max-h-[90vh]
          animate-scale-in
          overflow-hidden
          z-10
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ledger bg-panel/95 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-ledger transition-all shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

