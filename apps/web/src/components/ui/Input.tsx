import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  mono?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  mono = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-surface border border-ledger
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30
            transition-all duration-200
            ${icon ? "pl-10" : ""}
            ${error ? "border-danger focus:border-danger focus:ring-danger/30" : ""}
            ${mono ? "font-mono text-sm" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
