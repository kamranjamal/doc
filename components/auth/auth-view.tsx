"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  FileText,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

export function AuthView() {
  const { login, register, switchDemoUser, demoAccounts } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDemoEmail, setLoadingDemoEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || "Failed to sign in");
        }
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setIsSubmitting(false);
          return;
        }
        const result = await register(name, email, password);
        if (!result.success) {
          setError(result.error || "Failed to create account");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoadingDemoEmail(demoEmail);
    try {
      const result = await switchDemoUser(demoEmail);
      if (!result.success) {
        setError(result.error || "Demo login failed");
      }
    } finally {
      setLoadingDemoEmail(null);
    }
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || "U").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#2D251E] flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden select-none font-['Poppins',sans-serif]">
      {/* Neo-Skeuomorphic Board Header (Matching Reference Image) */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between border-b-2 border-[#D5C9B8] pb-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C8E80] tactile-tag px-2 py-0.5 rounded">
                Foundations & Controls
              </span>
              <span className="text-[11px] font-mono text-[#C97D52] bg-[#F7EBE4] border border-[#DE956C]/50 px-2 py-0.5 rounded-full font-semibold">
                Neo-Skeuomorphic Tactile System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D251E] tracking-tight mt-1.5 flex items-center gap-2.5">
              <span>Draftly Workspace</span>
              <span className="text-xs font-normal text-[#74675B] bg-[#EFE8DE] px-2.5 py-1 rounded-md border border-[#D5C9B8]">
                MongoDB v7.0
              </span>
            </h1>
            <p className="text-xs text-[#74675B] mt-0.5">
              Tactile paper-and-copper interface for team document management.
            </p>
          </div>

          {/* Decorative origami folded stamp */}
          <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl tactile-elevation-2 border border-[#C87B50]/40 bg-gradient-to-br from-[#FAF7F2] to-[#EFE8DE] relative">
            <div className="w-8 h-8 rounded-full tactile-avatar-ring flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-6">
        {/* Main Authentication Card - Raised Tactile Surface (Level 2 Elevation) */}
        <div className="tactile-elevation-2 rounded-2xl p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2D9CC] relative">
          {/* Subtle paper top ribbon */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md tactile-tag text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#C97D52]" />
              <span>Identity Verification</span>
            </div>
            <div className="text-[11px] text-[#9C8E80] font-mono">
              Elevation: Level 2
            </div>
          </div>

          {/* Tactile Inset Tabs */}
          <div className="tactile-inset p-1.5 rounded-xl flex items-center gap-1.5 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "login"
                  ? "bg-[#FFFFFF] text-[#2D251E] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  mode === "login" ? "bg-[#C97D52]" : "bg-[#D5C9B8]"
                }`}
              />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "register"
                  ? "bg-[#FFFFFF] text-[#2D251E] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  mode === "register" ? "bg-[#C97D52]" : "bg-[#D5C9B8]"
                }`}
              />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error Banner with Terracotta Tactile Styling */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FBEBE8] border-2 border-[#E5877A] text-[#BA4E3E] text-xs font-medium mb-5 shadow-inner">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#BA4E3E]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form with Neo-Skeuomorphic Sunken Text Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#4A3F35]">
                    Full Name
                  </label>
                  <span className="text-[10px] text-[#9C8E80] font-mono">
                    Text Field: Default
                  </span>
                </div>
                <div className="relative tactile-inset rounded-xl tactile-input-focus transition-all duration-150">
                  <UserIcon className="w-4 h-4 text-[#9C8E80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#4A3F35]">
                  Email Address
                </label>
                <span className="text-[10px] text-[#9C8E80] font-mono">
                  Text Field: {email ? "Active" : "Default"}
                </span>
              </div>
              <div className="relative tactile-inset rounded-xl tactile-input-focus transition-all duration-150">
                <Mail className="w-4 h-4 text-[#9C8E80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@draftly.demo"
                  required
                  className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#74675B] mt-1 pl-1 italic">
                We&apos;ll never share your email.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#4A3F35]">
                  Password
                </label>
                <span className="text-[10px] text-[#9C8E80] font-mono">
                  Min 6 chars
                </span>
              </div>
              <div className="relative tactile-inset rounded-xl tactile-input-focus transition-all duration-150">
                <Lock className="w-4 h-4 text-[#9C8E80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-5 rounded-xl font-bold text-sm tactile-btn-copper flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </>
                ) : mode === "login" ? (
                  <>
                    <span>Submit Sign In</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPassword("");
                  setError(null);
                }}
                className="py-3 px-5 rounded-xl font-bold text-sm tactile-btn-secondary cursor-pointer"
              >
                Cancel / Reset
              </button>
            </div>
          </form>
        </div>

        {/* Demo Accounts Section - Styled as "DATA DISPLAY / AVATARS" */}
        <div className="tactile-elevation-1 rounded-2xl p-5 sm:p-6 bg-[#FAF7F2] border border-[#E2D9CC]">
          <div className="flex items-center justify-between mb-3 border-b border-[#E2D9CC] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full tactile-avatar-ring flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xs font-bold text-[#2D251E] tracking-wider uppercase">
                Seeded Identity Switcher (P0 Demo Specification)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#C97D52] bg-[#F7EBE4] px-2 py-0.5 rounded border border-[#DE956C]/40 font-semibold">
              1-Click Auth
            </span>
          </div>

          <p className="text-xs text-[#74675B] mb-4">
            Instant 1-click test login for reviewers to verify ownership and access control boundaries:
          </p>

          <div className="space-y-2.5">
            {demoAccounts.map((account) => {
              const isLoadingThis = loadingDemoEmail === account.email;
              return (
                <div
                  key={account.email}
                  className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2D9CC] tactile-elevation-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#C97D52] transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Concentric tactile avatar medal with crisp initials */}
                    <div className="w-9 h-9 rounded-full tactile-avatar-ring flex items-center justify-center text-xs font-extrabold text-white shadow-sm shrink-0 tracking-wider">
                      {getInitials(account.name)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2D251E]">
                          {account.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold text-[#8C4F2A] bg-[#F7EBE4] border border-[#C87B50]/40">
                          {account.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#74675B] font-mono mt-0.5">
                        {account.email}
                      </div>
                      <div className="text-[11px] text-[#9C8E80] mt-0.5">
                        {account.description}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loadingDemoEmail !== null || isSubmitting}
                    onClick={() => handleDemoLogin(account.email)}
                    className="py-1.5 px-3.5 rounded-lg text-xs font-bold tactile-btn-copper shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Select User</span>
                        <ArrowRight className="w-3 h-3 text-white" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactile System Micro-Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#74675B] px-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C97D52] shadow-sm inline-block" />
            <span>Copper: #C97D52</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FAF7F2] border border-[#D5C9B8] shadow-sm inline-block" />
            <span>Paper: #FAF7F2</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EFE8DE] border border-[#D5C9B8] inline-block shadow-inner" />
            <span>Inset Deboss: #EFE8DE</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-[#4E9A68]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>MongoDB Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
