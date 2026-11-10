"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full font-['Poppins',sans-serif]">
        {label && (
          <label className="block text-xs font-bold text-[#74675B] mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl tactile-inset tactile-input-focus flex items-center transition-all">
          {leftIcon && (
            <div className="pl-3.5 pr-1 text-[#9C8E80] flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-transparent py-2.5 px-3 text-xs sm:text-sm font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none disabled:opacity-50 ${
              leftIcon ? "pl-1.5" : ""
            } ${rightIcon ? "pr-10" : ""} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8E80] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[11px] font-semibold text-[#BA4E3E]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

