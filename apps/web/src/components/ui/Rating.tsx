import React from "react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
}

const sizeMap = {
  sm: "w-3.5 h-3.5",
  md: "w-4.5 h-4.5",
  lg: "w-5.5 h-5.5",
};

function StarIcon({ filled, partial, size }: { filled: boolean; partial?: number; size: string }) {
  if (partial !== undefined && partial > 0 && partial < 1) {
    return (
      <svg className={`${size} shrink-0`} viewBox="0 0 20 20" fill="none">
        <defs>
          <clipPath id={`star-clip-${partial}`}>
            <rect x="0" y="0" width={20 * partial} height="20" />
          </clipPath>
        </defs>
        {/* Background (empty) star */}
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="#1F2733"
        />
        {/* Filled partial star */}
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="#E8A33D"
          clipPath={`url(#star-clip-${partial})`}
        />
      </svg>
    );
  }

  return (
    <svg className={`${size} shrink-0`} viewBox="0 0 20 20" fill="none">
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill={filled ? "#E8A33D" : "#1F2733"}
      />
    </svg>
  );
}

export default function Rating({
  value,
  max = 5,
  size = "md",
  showValue = true,
  count,
  className = "",
}: RatingProps) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(value)) {
      stars.push(<StarIcon key={i} filled size={sizeMap[size]} />);
    } else if (i === Math.ceil(value) && value % 1 !== 0) {
      stars.push(<StarIcon key={i} filled={false} partial={value % 1} size={sizeMap[size]} />);
    } else {
      stars.push(<StarIcon key={i} filled={false} size={sizeMap[size]} />);
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showValue && (
        <span className="text-sm font-medium text-text-secondary">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-sm text-text-muted">({count})</span>
      )}
    </div>
  );
}
