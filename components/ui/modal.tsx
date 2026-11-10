"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 font-['Poppins',sans-serif]">
      <div
        className={`w-full ${maxWidths[maxWidth]} bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-[#9C8E80] hover:text-[#2D251E] hover:bg-[#EFE8DE] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {(title || icon) && (
          <div className="flex items-start gap-3 mb-4 pb-3 border-b border-[#E2D9CC]">
            {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
            <div>
              {title && (
                <h3 className="text-sm sm:text-base font-extrabold text-[#2D251E] leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#74675B] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}

