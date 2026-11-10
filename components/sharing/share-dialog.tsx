"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { DocumentItem } from "../documents/document-card";
import {
  Share2,
  X,
  UserPlus,
  Trash2,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";

interface ShareDialogProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  permission: string;
  createdAt: string;
}

export function ShareDialog({ document, isOpen, onClose }: ShareDialogProps) {
  const { demoAccounts } = useAuth();
  const [shares, setShares] = useState<ShareMember[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    if (!document) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${document.id}/share`);
      const data = await res.json();
      if (res.ok) {
        setShares(data.shares || []);
      } else {
        setError(data.error || "Failed to load access list");
      }
    } catch {
      setError("Network error loading shares");
    } finally {
      setIsLoading(false);
    }
  }, [document]);

  useEffect(() => {
    if (isOpen && document) {
      fetchShares();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, document, fetchShares]);

  if (!isOpen || !document) return null;

  const handleShare = async (emailToShare: string) => {
    const targetEmail = (emailToShare || customEmail || selectedEmail).trim();
    if (!targetEmail) {
      setError("Please select or enter an email address to share with.");
      return;
    }

    setIsSharing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, permission: "EDIT" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to grant access");
      } else {
        setSuccess(data.message || `Shared with ${targetEmail}`);
        setCustomEmail("");
        setSelectedEmail("");
        fetchShares();
      }
    } catch {
      setError("Network error while granting access");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    setRevokingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to revoke access");
      } else {
        setSuccess(data.message || "Access revoked successfully");
        fetchShares();
      }
    } catch {
      setError("Network error while revoking access");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-6 sm:p-7 relative select-none">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#D5C9B8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl tactile-avatar-ring flex items-center justify-center text-white shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#2D251E]">
                Share Document
              </h2>
              <p className="text-xs text-[#74675B] font-medium truncate max-w-xs mt-0.5">
                {document.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#FBEBE8] border border-[#E5877A] text-[#BA4E3E] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#EBF5EE] border border-[#4E9A68]/40 text-[#4E9A68] text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Share with Seeded Accounts (Quick Select) */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-[#4A3F35] mb-2 uppercase tracking-wider">
            Quick Share With Team Members
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoAccounts
              .filter((acc) => acc.email !== document.owner?.email)
              .map((account) => {
                const isAlreadyShared = shares.some(
                  (s) => s.email.toLowerCase() === account.email.toLowerCase()
                );
                return (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isAlreadyShared || isSharing}
                    onClick={() => handleShare(account.email)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                      isAlreadyShared
                        ? "bg-[#EFE8DE] border-[#D5C9B8] opacity-60 cursor-not-allowed"
                        : "bg-[#FFFFFF] border-[#E2D9CC] hover:border-[#C97D52] tactile-elevation-1"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#2D251E]">
                        {account.name}
                      </div>
                      <div className="text-[10px] text-[#74675B] font-mono">
                        {account.email}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#C97D52]">
                      {isAlreadyShared ? "Added" : "+ Add"}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Custom Email Input */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-[#4A3F35] mb-1.5 uppercase tracking-wider">
            Or Share By Email
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative tactile-inset rounded-xl tactile-input-focus">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="colleague@draftly.demo"
                className="w-full bg-transparent px-3.5 py-2.5 text-xs font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={!customEmail.trim() || isSharing}
              onClick={() => handleShare(customEmail)}
              className="py-2 px-4 rounded-xl font-bold text-xs tactile-btn-copper flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Grant</span>
            </button>
          </div>
        </div>

        {/* Access List */}
        <div className="mt-6 pt-4 border-t border-[#D5C9B8]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider">
              People With Access
            </span>
            <span className="text-[10px] text-[#9C8E80] font-mono">
              {shares.length + 1} member(s)
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {/* Owner Row */}
            <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2D9CC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full tactile-avatar-ring flex items-center justify-center text-[10px] font-bold text-white">
                  {document.owner?.name.split(" ").map((n) => n[0]).join("") || "O"}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D251E] flex items-center gap-1.5">
                    <span>{document.owner?.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold text-[#8C4F2A] bg-[#F7EBE4]">
                      Owner
                    </span>
                  </div>
                  <div className="text-[10px] text-[#74675B] font-mono">
                    {document.owner?.email}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#9C8E80] font-mono">
                Full Control
              </span>
            </div>

            {/* Shared Users */}
            {isLoading ? (
              <div className="p-4 text-center text-xs text-[#74675B] flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C97D52]" />
                <span>Loading access list...</span>
              </div>
            ) : shares.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#9C8E80] italic bg-[#EFE8DE] rounded-xl border border-[#D5C9B8]">
                Only the owner has access to this document.
              </div>
            ) : (
              shares.map((share) => (
                <div
                  key={share.id}
                  className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2D9CC] flex items-center justify-between hover:border-[#C97D52]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full tactile-avatar-ring flex items-center justify-center text-[10px] font-bold text-white">
                      {share.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D251E] flex items-center gap-1.5">
                        <span>{share.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold text-[#4E9A68] bg-[#EBF5EE]">
                          Can Edit
                        </span>
                      </div>
                      <div className="text-[10px] text-[#74675B] font-mono">
                        {share.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={revokingId === share.userId}
                    onClick={() => handleRevoke(share.userId)}
                    className="p-1.5 rounded-lg text-[#BA4E3E] hover:bg-[#FBEBE8] border border-transparent hover:border-[#E5877A] transition-colors cursor-pointer"
                    title="Revoke access"
                  >
                    {revokingId === share.userId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#D5C9B8] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

