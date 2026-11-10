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
    <header className="h-14 border-b border-[#262D3A] bg-[#10131A] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#7665F5] flex items-center justify-center shadow-md shadow-[#8B7CFF]/15">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#F3F5F8] tracking-tight">
            Draftly
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#151A23] border border-[#262D3A] text-[#8B7CFF]">
            MongoDB Powered
          </span>
        </div>
      </div>

      {/* User identity & Switcher */}
      {user && (
        <div className="flex items-center gap-3">
          {/* User switcher dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#151A23] hover:bg-[#1C2330] border border-[#262D3A] transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30 flex items-center justify-center text-xs font-semibold">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-[#F3F5F8] flex items-center gap-1.5 leading-none mb-0.5">
                  <span>{user.name}</span>
                </div>
                <div className="text-[10px] text-[#6F7A8C] leading-none">
                  {user.email}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6F7A8C]" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#151A23] border border-[#262D3A] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#262D3A] mb-1">
                  <div className="text-xs font-medium text-[#F3F5F8]">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-[#6F7A8C] truncate">
                    {user.email}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-[#39C98A]">
                    <UserCheck className="w-3 h-3" />
                    <span>Active Authenticated Session</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6F7A8C]">
                    Switch Demo User (P0 Requirement)
                  </div>
                  {demoAccounts.map((account) => {
                    const isCurrent = user.email === account.email;
                    const switchingThis = isSwitching === account.email;
                    return (
                      <button
                        key={account.email}
                        type="button"
                        disabled={switchingThis}
                        onClick={() => handleSwitch(account.email)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isCurrent
                            ? "bg-[#1C2330] text-[#F3F5F8] font-medium"
                            : "hover:bg-[#1C2330]/60 text-[#A1AABA]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#F3F5F8]">
                              {account.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#8B7CFF]/15 text-[#8B7CFF]">
                              {account.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#6F7A8C]">
                            {account.email}
                          </div>
                        </div>
                        {switchingThis ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#8B7CFF] animate-spin" />
                        ) : isCurrent ? (
                          <Check className="w-3.5 h-3.5 text-[#39C98A]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#262D3A] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#F16F78] hover:bg-[#F16F78]/10 transition-colors flex items-center gap-2"
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

