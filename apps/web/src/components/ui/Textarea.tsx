import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export default function Textarea({
  label,
  error,
  helperText,
  showCount = false,
  maxLength,
  value,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const charCount = typeof value === "string" ? value.length : 0;

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
      <textarea
        id={inputId}
        value={value}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg min-h-[120px] resize-y
          bg-surface border border-ledger
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-circuit focus:ring-1 focus:ring-circuit/30
          transition-all duration-200
          ${error ? "border-danger focus:border-danger focus:ring-danger/30" : ""}
          ${className}
        `}
        {...props}
      />
      <div className="flex items-center justify-between">
        {error && <p className="text-xs text-danger">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
        {showCount && maxLength && (
          <p className="text-xs text-text-muted ml-auto">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
