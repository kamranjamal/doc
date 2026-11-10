"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Tactile Toast Stack (Matching "TOAST STACK" in Reference Board) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none font-['Poppins',sans-serif]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl tactile-elevation-2 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border ${
              toast.type === "success"
                ? "bg-[#FAF7F2] border-[#4E9A68]/40 text-[#2D251E]"
                : toast.type === "error"
                ? "bg-[#FBEBE8] border-[#E5877A] text-[#BA4E3E]"
                : toast.type === "warning"
                ? "bg-[#FAF7F2] border-[#D48B38]/50 text-[#8C4F2A]"
                : "bg-[#FAF7F2] border-[#D5C9B8] text-[#2D251E]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-[#4E9A68] shrink-0" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-4 h-4 text-[#BA4E3E] shrink-0" />
              )}
              {toast.type === "warning" && (
                <AlertCircle className="w-4 h-4 text-[#D48B38] shrink-0" />
              )}
              {toast.type === "info" && (
                <Info className="w-4 h-4 text-[#C97D52] shrink-0" />
              )}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-[#9C8E80] hover:text-[#2D251E] p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

