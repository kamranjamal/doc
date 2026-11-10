"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { AuthView } from "@/components/auth/auth-view";
import { AppHeader } from "@/components/layout/app-header";
import {
  Database,
  CheckCircle2,
  ShieldCheck,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  KeyRound,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading, demoAccounts, switchDemoUser } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#7665F5] flex items-center justify-center animate-pulse mb-4 shadow-lg shadow-[#8B7CFF]/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <p className="text-xs text-[#A1AABA] animate-pulse">
          Connecting to MongoDB & verifying session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-[#151A23] border border-[#262D3A] rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39C98A]/10 border border-[#39C98A]/30 text-xs text-[#39C98A] mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Step 1 Complete: MongoDB & Authentication Live</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-[#F3F5F8] tracking-tight mb-2">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-[#A1AABA] max-w-2xl">
              You are signed in to Draftly with a verified session. The database layer has been successfully migrated from PostgreSQL to <strong className="text-[#F3F5F8]">MongoDB</strong> using Mongoose with bcrypt password hashing and JWT cookies.
            </p>

            {/* Active user details card */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#262D3A]">
                <div className="text-[11px] text-[#6F7A8C] mb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>Database</span>
                </div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  MongoDB (Local / 27017)
                </div>
                <div className="text-[11px] text-[#39C98A] mt-0.5">
                  Connected & Synchronized
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#262D3A]">
                <div className="text-[11px] text-[#6F7A8C] mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>Authentication</span>
                </div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  Bcrypt + JWT Cookie
                </div>
                <div className="text-[11px] text-[#A1AABA] mt-0.5 truncate">
                  User ID: {user.id}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#262D3A]">
                <div className="text-[11px] text-[#6F7A8C] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>Active Identity</span>
                </div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  {user.email}
                </div>
                <div className="text-[11px] text-[#8B7CFF] mt-0.5">
                  Session Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Identity Switcher Showcase */}
        <div className="bg-[#151A23] border border-[#262D3A] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F3F5F8] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B7CFF]" />
                Demo User Switcher (P0 Specification)
              </h2>
              <p className="text-xs text-[#A1AABA] mt-0.5">
                Switch between seeded users to verify identity-isolated document access:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {demoAccounts.map((account) => {
              const isActive = user.email === account.email;
              return (
                <div
                  key={account.email}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-[#1C2330] border-[#8B7CFF] shadow-lg shadow-[#8B7CFF]/10"
                      : "bg-[#10131A] border-[#262D3A] hover:border-[#8B7CFF]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#F3F5F8]">
                      {account.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        isActive
                          ? "bg-[#8B7CFF] text-white font-medium"
                          : "bg-[#8B7CFF]/15 text-[#8B7CFF]"
                      }`}
                    >
                      {account.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6F7A8C] mb-3">
                    {account.description}
                  </p>
                  <div className="text-[11px] text-[#A1AABA] font-mono mb-3">
                    {account.email}
                  </div>

                  {isActive ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#39C98A] font-medium py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Current Active User</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchDemoUser(account.email)}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#151A23] hover:bg-[#8B7CFF] hover:text-white border border-[#262D3A] text-xs font-medium text-[#A1AABA] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Switch to {account.name.split(" ")[0]}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap to Next Steps */}
        <div className="bg-[#151A23] border border-[#262D3A] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#F3F5F8] flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#8B7CFF]" />
            Workflow & Roadmap
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#39C98A]/30 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#39C98A]/20 text-[#39C98A] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  Step 1: MongoDB & Authentication (Current Step)
                </div>
                <div className="text-[11px] text-[#A1AABA] mt-0.5">
                  MongoDB connection, User model, bcrypt hashing, JWT session cookies, registration, login, logout, and 1-click seeded user switching.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#262D3A] flex items-start gap-3 opacity-80">
              <div className="w-6 h-6 rounded-full bg-[#262D3A] text-[#A1AABA] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                2
              </div>
              <div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  Step 2: Document Model & Dashboard
                </div>
                <div className="text-[11px] text-[#A1AABA] mt-0.5">
                  Document and DocumentShare MongoDB schemas, `/api/documents` CRUD endpoints, owned vs shared document queries, search, create, and rename.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#262D3A] flex items-start gap-3 opacity-80">
              <div className="w-6 h-6 rounded-full bg-[#262D3A] text-[#A1AABA] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                3
              </div>
              <div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  Step 3: Tiptap Rich-Text Editor & Debounced Autosave
                </div>
                <div className="text-[11px] text-[#A1AABA] mt-0.5">
                  Editor toolbar (Bold, Italic, Underline, H1/H2, Lists), Tiptap JSON persistence in MongoDB, debounced autosave with visual save status.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#10131A] border border-[#262D3A] flex items-start gap-3 opacity-80">
              <div className="w-6 h-6 rounded-full bg-[#262D3A] text-[#A1AABA] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                4
              </div>
              <div>
                <div className="text-xs font-semibold text-[#F3F5F8]">
                  Step 4: Sharing, Access Control & File Import (.txt / .md)
                </div>
                <div className="text-[11px] text-[#A1AABA] mt-0.5">
                  Server-side authorization guards, Share dialog (grant/revoke), and markdown/text import.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
