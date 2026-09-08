interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeStyles[size]} rounded-full object-cover border border-ledger ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeStyles[size]} rounded-full
        bg-surface border border-ledger
        flex items-center justify-center
        font-semibold text-text-muted
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
