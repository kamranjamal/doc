"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "inset";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    // Base styles
    const baseStyle =
      "inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins',sans-serif]";

    // Variant styles matching the neo-skeuomorphic system
    const variants = {
      primary:
        "tactile-btn-copper text-white shadow-md active:translate-y-0.5",
      secondary:
        "tactile-btn-secondary shadow-xs hover:border-[#B5673A] active:translate-y-0.5",
      danger:
        "bg-[#BA4E3E] hover:bg-[#A33E30] text-white border border-[#8C2E22] shadow-sm active:translate-y-0.5",
      ghost:
        "text-[#74675B] hover:text-[#2D251E] hover:bg-[#EFE8DE] border border-transparent hover:border-[#D5C9B8]",
      inset:
        "tactile-inset text-[#2D251E] hover:bg-[#E7DFD3] border border-[#D5C9B8]",
    };

    // Sizes
    const sizes = {
      sm: "text-xs py-1.5 px-3 gap-1.5",
      md: "text-xs sm:text-sm py-2 px-4 gap-2",
      lg: "text-sm py-2.5 px-6 gap-2.5",
      icon: "w-8 h-8 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

