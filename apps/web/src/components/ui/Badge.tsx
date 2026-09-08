import React from "react";

export type BadgeVariant =
  | "platform"
  | "status"
  | "price"
  | "seller"
  | "category"
  | "primary"
  | "circuit"
  | "signal"
  | "slate"
  | "default";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  platform: "bg-circuit/15 text-circuit border border-circuit/25",
  status: "bg-success/15 text-success border border-success/25",
  price: "bg-signal/15 text-signal border border-signal/25",
  seller: "bg-circuit/15 text-circuit border border-circuit/25",
  category: "bg-surface text-text-secondary border border-ledger",
  primary: "bg-circuit/15 text-circuit border border-circuit/30",
  circuit: "bg-circuit/15 text-circuit border border-circuit/30",
  signal: "bg-signal/15 text-signal border border-signal/30",
  slate: "bg-surface text-text-muted border border-ledger",
  default: "bg-surface text-text-muted border border-ledger",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  icon,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        rounded-full whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
