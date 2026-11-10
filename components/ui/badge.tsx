"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "copper" | "success" | "neutral" | "warning" | "danger";
}

export function Badge({ className = "", variant = "neutral", children, ...props }: BadgeProps) {
  const variants = {
    copper: "bg-[#F7EBE4] border-[#C87B50]/40 text-[#C97D52]",
    success: "bg-[#EBF5EE] border-[#4E9A68]/30 text-[#4E9A68]",
    neutral: "bg-[#EFE8DE] border-[#D5C9B8] text-[#74675B]",
    warning: "bg-[#FEF7EC] border-[#D48B38]/40 text-[#D48B38]",
    danger: "bg-[#FBEBE8] border-[#E5877A] text-[#BA4E3E]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider select-none font-['Poppins',sans-serif] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
