"use client";

import { useState, useRef, useEffect } from "react";

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  menuWidth?: string;
  ariaLabel?: string;
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  menuWidth = "min-w-[190px]",
  ariaLabel,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface border border-ledger hover:border-slate text-sm text-text-primary focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30 transition-all cursor-pointer shadow-xs select-none"
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-circuit" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 sm:left-auto sm:right-0 mt-1.5 ${menuWidth} rounded-xl bg-[#0e131f] border border-ledger shadow-2xl p-1.5 z-50 animate-in fade-in-50 zoom-in-95`}
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-circuit/15 text-circuit font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/80"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 text-circuit shrink-0 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
