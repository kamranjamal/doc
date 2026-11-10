"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  FileText,
  LogOut,
  ChevronDown,
  UserCheck,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

export function AppHeader() {
  const { user, logout, switchDemoUser, demoAccounts } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = async (email: string) => {
    if (user?.email === email) {
      setDropdownOpen(false);
      return;
    }
    setIsSwitching(email);
    try {
      await switchDemoUser(email);
      setDropdownOpen(false);
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <header className="h-16 border-b border-[#D5C9B8] bg-[#FAF7F2] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Brand with Tactile Copper Seal */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl tactile-avatar-ring flex items-center justify-center shadow-md">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-[#2D251E] tracking-tight">
              Draftly
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono text-[#8C4F2A] bg-[#F7EBE4] border border-[#C87B50]/40">
              Tactile Kit
            </span>
          </div>
          <div className="text-[10px] text-[#74675B] font-medium leading-none mt-0.5">
            MongoDB Neo-Skeuomorphic System
          </div>
        </div>
      </div>

      {/* User Identity & Switcher */}
      {user && (
        <div className="flex items-center gap-3">
          {/* User switcher dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#D5C9B8] tactile-elevation-1 transition-all text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full tactile-avatar-ring flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#2D251E] leading-tight">
                  {user.name}
                </div>
                <div className="text-[11px] text-[#74675B] font-mono leading-none mt-0.5">
                  {user.email}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#74675B]" />
            </button>

            {/* Dropdown Menu (Styled as Raised Tactile Paper Dialog) */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#D5C9B8] mb-2 bg-[#FFFFFF] rounded-xl tactile-elevation-1">
                  <div className="text-xs font-bold text-[#2D251E]">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-[#74675B] font-mono truncate mt-0.5">
                    {user.email}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#4E9A68]">
                    <UserCheck className="w-3 h-3" />
                    <span>Active Authenticated Session</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9C8E80]">
                    Switch Demo User (P0 Requirement)
                  </div>
                  <div className="space-y-1.5 mt-1">
                    {demoAccounts.map((account) => {
                      const isCurrent = user.email === account.email;
                      const switchingThis = isSwitching === account.email;
                      return (
                        <button
                          key={account.email}
                          type="button"
                          disabled={switchingThis}
                          onClick={() => handleSwitch(account.email)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-[#FFFFFF] border border-[#C97D52] tactile-elevation-1"
                              : "hover:bg-[#EFE8DE] border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full tactile-avatar-ring flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {account.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#2D251E]">
                                  {account.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold text-[#8C4F2A] bg-[#F7EBE4]">
                                  {account.role}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#74675B] font-mono">
                                {account.email}
                              </div>
                            </div>
                          </div>
                          {switchingThis ? (
                            <Loader2 className="w-3.5 h-3.5 text-[#C97D52] animate-spin" />
                          ) : isCurrent ? (
                            <Check className="w-4 h-4 text-[#4E9A68]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[#D5C9B8] pt-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#BA4E3E] hover:bg-[#FBEBE8] border border-transparent hover:border-[#E5877A] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
