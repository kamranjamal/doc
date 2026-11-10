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

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F5F8] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#8B7CFF]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#151A23] border border-[#262D3A] text-xs text-[#A1AABA] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
          <span>MongoDB Native Document Workspace</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#7665F5] flex items-center justify-center shadow-lg shadow-[#8B7CFF]/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#F3F5F8]">
            Draftly
          </h1>
        </div>
        <p className="text-sm text-[#A1AABA] mt-2 max-w-sm mx-auto">
          Your team&apos;s documents, without the clutter.
        </p>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Main Card */}
        <div className="bg-[#151A23] border border-[#262D3A] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex bg-[#10131A] p-1 rounded-xl border border-[#262D3A]/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-[#151A23] text-[#F3F5F8] shadow-sm border border-[#262D3A]"
                  : "text-[#6F7A8C] hover:text-[#A1AABA]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-[#151A23] text-[#F3F5F8] shadow-sm border border-[#262D3A]"
                  : "text-[#6F7A8C] hover:text-[#A1AABA]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F16F78]/10 border border-[#F16F78]/25 text-[#F16F78] text-xs mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-[#A1AABA] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6F7A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    className="w-full bg-[#10131A] border border-[#262D3A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#F3F5F8] placeholder-[#6F7A8C] focus:outline-none focus:border-[#8B7CFF] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#A1AABA] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6F7A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@draftly.demo"
                  required
                  className="w-full bg-[#10131A] border border-[#262D3A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#F3F5F8] placeholder-[#6F7A8C] focus:outline-none focus:border-[#8B7CFF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1AABA] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F7A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#10131A] border border-[#262D3A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#F3F5F8] placeholder-[#6F7A8C] focus:outline-none focus:border-[#8B7CFF] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#6F7A8C] mt-1">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-[#8B7CFF] hover:bg-[#7665F5] disabled:opacity-50 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-[#8B7CFF]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Demo Accounts Card */}
        <div className="bg-[#151A23]/60 border border-[#262D3A] rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-[#A1AABA]">
            <Users className="w-4 h-4 text-[#8B7CFF]" />
            <span>Instant Demo Accounts (1-Click Login)</span>
          </div>
          <p className="text-xs text-[#6F7A8C] mb-3">
            Switch between seeded accounts to test document creation, access control, and sharing:
          </p>
          <div className="space-y-2">
            {demoAccounts.map((account) => {
              const isLoadingThis = loadingDemoEmail === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  disabled={loadingDemoEmail !== null || isSubmitting}
                  onClick={() => handleDemoLogin(account.email)}
                  className="w-full text-left p-3 rounded-xl bg-[#10131A] hover:bg-[#1C2330] border border-[#262D3A] transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#151A23] border border-[#262D3A] flex items-center justify-center text-xs font-semibold text-[#8B7CFF] group-hover:border-[#8B7CFF]/50 transition-colors">
                      {account.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#F3F5F8]">
                          {account.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">
                          {account.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F7A8C]">
                        {account.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 text-[#8B7CFF] animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#6F7A8C] group-hover:text-[#F3F5F8] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature summary */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#6F7A8C]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#39C98A]" />
            MongoDB Storage
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#39C98A]" />
            Bcrypt Hashing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#39C98A]" />
            JWT Session Cookie
          </span>
        </div>
      </div>
    </div>
  );
}

