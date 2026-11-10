"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { DocumentItem } from "../documents/document-card";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Share2,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  MessageSquare,
  Edit3,
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
  permission: "EDIT" | "COMMENT" | "VIEW";
  createdAt: string;
}

export function ShareDialog({ document, isOpen, onClose }: ShareDialogProps) {
  const { demoAccounts } = useAuth();
  const [shares, setShares] = useState<ShareMember[]>([]);
  const [selectedRole, setSelectedRole] = useState<"EDIT" | "COMMENT" | "VIEW">("EDIT");
  const [customEmail, setCustomEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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
    const targetEmail = (emailToShare || customEmail).trim();
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
        body: JSON.stringify({ email: targetEmail, permission: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to grant access");
      } else {
        setSuccess(data.message || `Shared with ${targetEmail}`);
        setCustomEmail("");
        fetchShares();
      }
    } catch {
      setError("Network error while granting access");
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdatePermission = async (userId: string, newPermission: "EDIT" | "COMMENT" | "VIEW") => {
    setUpdatingId(userId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/documents/${document.id}/share/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission: newPermission }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update permission");
      } else {
        setSuccess(data.message || `Permission updated to ${newPermission}`);
        fetchShares();
      }
    } catch {
      setError("Network error updating permission");
    } finally {
      setUpdatingId(null);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Document"
      subtitle={document.title}
      maxWidth="lg"
      icon={
        <div className="w-10 h-10 rounded-xl tactile-avatar-ring flex items-center justify-center text-white shrink-0">
          <Share2 className="w-5 h-5" />
        </div>
      }
    >
      {/* Notifications */}
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[#FBEBE8] border border-[#E5877A] text-[#BA4E3E] text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[#EBF5EE] border border-[#4E9A68]/40 text-[#4E9A68] text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-[#4A3F35] mb-1.5 uppercase tracking-wider">
          Permission Level to Grant
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole("EDIT")}
            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
              selectedRole === "EDIT"
                ? "bg-white border-[#C97D52] shadow-xs text-[#2D251E]"
                : "bg-[#FAF7F2] border-[#D5C9B8] text-[#74675B] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#C97D52]" />
              <span className="text-xs font-bold">Can Edit</span>
            </div>
            <p className="text-[10px] text-[#74675B] mt-0.5 leading-tight">Full edit & autosave</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("COMMENT")}
            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
              selectedRole === "COMMENT"
                ? "bg-white border-[#C97D52] shadow-xs text-[#2D251E]"
                : "bg-[#FAF7F2] border-[#D5C9B8] text-[#74675B] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#D48B38]" />
              <span className="text-xs font-bold">Can Comment</span>
            </div>
            <p className="text-[10px] text-[#74675B] mt-0.5 leading-tight">Read & leave feedback</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("VIEW")}
            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
              selectedRole === "VIEW"
                ? "bg-white border-[#C97D52] shadow-xs text-[#2D251E]"
                : "bg-[#FAF7F2] border-[#D5C9B8] text-[#74675B] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#3B6E8C]" />
              <span className="text-xs font-bold">Can View</span>
            </div>
            <p className="text-[10px] text-[#74675B] mt-0.5 leading-tight">Read-only protection</p>
          </button>
        </div>
      </div>

      {/* Quick Share with Team Members */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-[#4A3F35] mb-1.5 uppercase tracking-wider">
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
                    <div className="font-bold text-[#2D251E]">{account.name}</div>
                    <div className="text-[10px] text-[#74675B] font-mono">{account.email}</div>
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
      <div className="mb-5">
        <label className="block text-xs font-bold text-[#4A3F35] mb-1.5 uppercase tracking-wider">
          Or Share By Email
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="colleague@draftly.demo"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!customEmail.trim() || isSharing}
            isLoading={isSharing}
            onClick={() => handleShare(customEmail)}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Grant</span>
          </Button>
        </div>
      </div>

      {/* Access List */}
      <div className="pt-3 border-t border-[#D5C9B8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider">
            People With Access
          </span>
          <span className="text-[10px] text-[#9C8E80] font-mono">
            {shares.length + 1} member(s)
          </span>
        </div>

        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {/* Owner Row */}
          <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2D9CC] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full tactile-avatar-ring flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {document.owner?.name.split(" ").map((n) => n[0]).join("") || "O"}
              </div>
              <div>
                <div className="text-xs font-bold text-[#2D251E] flex items-center gap-1.5">
                  <span>{document.owner?.name}</span>
                  <Badge variant="copper">Owner</Badge>
                </div>
                <div className="text-[10px] text-[#74675B] font-mono">
                  {document.owner?.email}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-[#74675B] font-mono">Full Control</span>
          </div>

          {/* Shared Members */}
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
                  <div className="w-7 h-7 rounded-full tactile-avatar-ring flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {share.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D251E] flex items-center gap-1.5">
                      <span>{share.name}</span>
                      <Badge
                        variant={
                          share.permission === "EDIT"
                            ? "success"
                            : share.permission === "COMMENT"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {share.permission === "EDIT"
                          ? "Can Edit"
                          : share.permission === "COMMENT"
                          ? "Can Comment"
                          : "Can View"}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-[#74675B] font-mono">{share.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Permission Selector */}
                  <select
                    value={share.permission}
                    disabled={updatingId === share.userId}
                    onChange={(e) =>
                      handleUpdatePermission(
                        share.userId,
                        e.target.value as "EDIT" | "COMMENT" | "VIEW"
                      )
                    }
                    className="bg-[#FAF7F2] border border-[#D5C9B8] rounded-lg px-2 py-1 text-[11px] font-semibold text-[#2D251E] focus:outline-none focus:border-[#C97D52] cursor-pointer"
                  >
                    <option value="EDIT">Can Edit</option>
                    <option value="COMMENT">Can Comment</option>
                    <option value="VIEW">Can View</option>
                  </select>

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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-[#D5C9B8] flex justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
