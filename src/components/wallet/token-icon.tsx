"use client";

import { cn } from "@/lib/utils";

interface TokenIconProps {
  symbol: string;
  color: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
}

export function TokenIcon({ symbol, color, icon, size = "md" }: TokenIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        sizeClasses[size]
      )}
      style={{ backgroundColor: color }}
    >
      {icon || symbol.charAt(0)}
    </div>
  );
}
