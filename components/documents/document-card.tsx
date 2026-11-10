"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  MoreVertical,
  Share2,
  Trash2,
  Edit2,
  Clock,
  ShieldCheck,
  Users,
  ExternalLink,
  Pin,
} from "lucide-react";

export interface DocumentItem {
  id: string;
  title: string;
  content: any;
  isOwner: boolean;
  isPinned?: boolean;
  permission: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentCardProps {
  document: DocumentItem;
  onOpen: (doc: DocumentItem) => void;
  onRename: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onTogglePin?: (doc: DocumentItem) => void;
}

export function DocumentCard({
  document: docItem,
  onOpen,
  onRename,
  onDelete,
  onShare,
  onTogglePin,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => window.document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div
      onClick={() => onOpen(docItem)}
      className={`tactile-elevation-1 hover:tactile-elevation-2 rounded-2xl p-4.5 bg-[#FFFFFF] transition-all cursor-pointer flex flex-col justify-between group relative select-none font-['Poppins',sans-serif] ${
        docItem.isPinned
          ? "border-2 border-[#C97D52] shadow-md shadow-[#C97D52]/10"
          : "border border-[#E2D9CC] hover:border-[#C97D52]/60"
      }`}
    >
      {/* Pinned ribbon badge if pinned */}
      {docItem.isPinned && (
        <div className="absolute -top-2.5 right-6 bg-[#C97D52] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Pin className="w-2.5 h-2.5 fill-white" />
          <span>PINNED</span>
        </div>
      )}

      <div>
        {/* Top Header: Icon + Badge + Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#D5C9B8] tactile-elevation-1 flex items-center justify-center shrink-0 group-hover:border-[#C97D52] transition-colors">
            <FileText className="w-5 h-5 text-[#C97D52]" />
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Quick Pin Toggle Button */}
            {docItem.isOwner && onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(docItem)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  docItem.isPinned
                    ? "text-[#C97D52] bg-[#F7EBE4] border border-[#C87B50]/30"
                    : "text-[#9C8E80] hover:text-[#C97D52] hover:bg-[#EFE8DE]"
                }`}
                title={docItem.isPinned ? "Unpin document" : "Pin document"}
              >
                <Pin className={`w-3.5 h-3.5 ${docItem.isPinned ? "fill-[#C97D52]" : ""}`} />
              </button>
            )}

            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-mono ${
                docItem.isOwner
                  ? "bg-[#F7EBE4] text-[#8C4F2A] border border-[#C87B50]/30"
                  : "bg-[#EBF5EE] text-[#4E9A68] border border-[#4E9A68]/30"
              }`}
            >
              {docItem.isOwner ? "Owner" : "Shared"}
            </span>

            {/* Overflow Action Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpen(docItem);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#2D251E] hover:bg-[#EFE8DE] flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C97D52]" />
                    <span>Open Editor</span>
                  </button>

                  {docItem.isOwner && (
                    <>
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onTogglePin(docItem);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#2D251E] hover:bg-[#EFE8DE] flex items-center gap-2 cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5 text-[#C97D52]" />
                          <span>{docItem.isPinned ? "Unpin Document" : "Pin Document"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onRename(docItem);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#2D251E] hover:bg-[#EFE8DE] flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#74675B]" />
                        <span>Rename Title</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onShare(docItem);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#2D251E] hover:bg-[#EFE8DE] flex items-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#C97D52]" />
                        <span>Manage Sharing</span>
                      </button>

                      <div className="border-t border-[#D5C9B8] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(docItem);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#BA4E3E] hover:bg-[#FBEBE8] flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#BA4E3E]" />
                        <span>Delete Document</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#2D251E] line-clamp-2 mb-2 group-hover:text-[#C97D52] transition-colors leading-snug">
          {docItem.title}
        </h3>
      </div>

      {/* Footer Info: Owner / Shared-by & Last Updated */}
      <div className="pt-3 border-t border-[#E2D9CC] flex items-center justify-between text-[11px] text-[#74675B] mt-2">
        <div className="flex items-center gap-1.5 truncate max-w-[150px]">
          {docItem.isOwner ? (
            <span className="flex items-center gap-1 text-[#9C8E80]">
              <ShieldCheck className="w-3 h-3 text-[#C97D52]" />
              <span>You</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 truncate text-[#4E9A68] font-medium">
              <Users className="w-3 h-3" />
              <span>{docItem.owner?.name || "Shared"}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[#9C8E80] font-mono">
          <Clock className="w-3 h-3" />
          <span>{formatDate(docItem.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
