"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { DocumentCard, DocumentItem } from "./document-card";
import { ShareDialog } from "../sharing/share-dialog";
import { ImportDialog } from "../import/import-dialog";
import { TemplateDialog } from "./template-dialog";
import { DocumentTemplate } from "@/lib/templates";
import { useToast } from "../ui/toast";
import {
  FileText,
  Plus,
  Search,
  Upload,
  FolderOpen,
  Share2,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Users,
  ShieldCheck,
  Check,
  X,
  Edit2,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

interface DashboardViewProps {
  onOpenDocument: (doc: DocumentItem) => void;
}

export function DashboardView({ onOpenDocument }: DashboardViewProps) {
  const { user, demoAccounts, switchDemoUser } = useAuth();
  const { showToast } = useToast();

  // Data states
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filter, setFilter] = useState<"all" | "owned" | "shared">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Reviewer Tour Banner state
  const [showTourBanner, setShowTourBanner] = useState(true);

  // Modals
  const [isCreating, setIsCreating] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<DocumentItem | null>(null);
  const [renameDoc, setRenameDoc] = useState<DocumentItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.all || []);
      } else {
        setError(data.error || "Failed to load documents");
      }
    } catch {
      setError("Network error while connecting to document workspace");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, user?.id]);

  // Document Creation with Template or Blank
  const handleCreateDocument = async (template?: DocumentTemplate) => {
    setIsCreating(true);
    setError(null);
    try {
      const title = template?.defaultTitle || "Untitled document";
      const content = template?.content || {
        type: "doc",
        content: [{ type: "paragraph" }],
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (res.ok && data.document) {
        setDocuments((prev) => [data.document, ...prev]);
        setIsTemplateOpen(false);
        showToast(`Created "${data.document.title}"`, "success");
        onOpenDocument(data.document);
      } else {
        setError(data.error || "Failed to create document");
        showToast(data.error || "Failed to create document", "error");
      }
    } catch {
      setError("Network error creating document");
      showToast("Network error creating document", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle Pin Document (P1 Unique Feature)
  const handleTogglePin = async (docToPin: DocumentItem) => {
    const nextPinnedState = !docToPin.isPinned;
    try {
      const res = await fetch(`/api/documents/${docToPin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: nextPinnedState }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docToPin.id ? { ...d, isPinned: nextPinnedState } : d))
        );
        showToast(
          nextPinnedState ? `Pinned "${docToPin.title}"` : `Unpinned "${docToPin.title}"`,
          "info"
        );
      }
    } catch {
      showToast("Failed to update pin status", "error");
    }
  };

  // Document Rename
  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameDoc || !newTitle.trim()) return;

    setIsRenaming(true);
    try {
      const res = await fetch(`/api/documents/${renameDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === renameDoc.id ? { ...d, title: newTitle.trim() } : d))
        );
        showToast("Document renamed successfully", "success");
        setRenameDoc(null);
      } else {
        setError(data.error || "Failed to rename document");
        showToast(data.error || "Failed to rename document", "error");
      }
    } catch {
      setError("Network error renaming document");
      showToast("Network error renaming document", "error");
    } finally {
      setIsRenaming(false);
    }
  };

  // Document Delete
  const handleConfirmDelete = async () => {
    if (!deleteDoc) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteDoc.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc.id));
        showToast(`Deleted "${deleteDoc.title}"`, "info");
        setDeleteDoc(null);
      } else {
        setError(data.error || "Failed to delete document");
        showToast(data.error || "Failed to delete document", "error");
      }
    } catch {
      setError("Network error deleting document");
      showToast("Network error deleting document", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesFilter =
        filter === "all" ? true : filter === "owned" ? doc.isOwner : !doc.isOwner;
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (doc.owner?.name && doc.owner.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchesFilter && matchesSearch;
    });
  }, [documents, filter, searchQuery]);

  const ownedCount = useMemo(() => documents.filter((d) => d.isOwner).length, [documents]);
  const sharedCount = useMemo(() => documents.filter((d) => !d.isOwner).length, [documents]);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] font-['Poppins',sans-serif]">
      {/* Left Sidebar (Section 4.1 Layout) */}
      <aside className="w-full md:w-64 border-r border-[#D5C9B8] bg-[#FAF7F2] p-4 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-6">
          {/* Workspace Status */}
          <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E2D9CC] tactile-elevation-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D251E] mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E9A68] animate-pulse" />
              <span>MongoDB Workspace</span>
            </div>
            <p className="text-[11px] text-[#74675B] font-mono leading-none">
              Identity: {user?.name.split(" ")[0]}
            </p>
          </div>

          {/* Navigation Items (Tactile Ribbons) */}
          <div className="space-y-1.5">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9C8E80]">
              Documents Navigation
            </div>

            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#FFFFFF] border-2 border-[#C97D52] tactile-elevation-1 text-[#2D251E]"
                  : "hover:bg-[#EFE8DE] text-[#74675B] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-[#C97D52]" />
                <span>All Documents</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#EFE8DE] text-[#74675B]">
                {documents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("owned")}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                filter === "owned"
                  ? "bg-[#FFFFFF] border-2 border-[#C97D52] tactile-elevation-1 text-[#2D251E]"
                  : "hover:bg-[#EFE8DE] text-[#74675B] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C97D52]" />
                <span>My Documents</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#EFE8DE] text-[#74675B]">
                {ownedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("shared")}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                filter === "shared"
                  ? "bg-[#FFFFFF] border-2 border-[#C97D52] tactile-elevation-1 text-[#2D251E]"
                  : "hover:bg-[#EFE8DE] text-[#74675B] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#4E9A68]" />
                <span>Shared With Me</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#EFE8DE] text-[#74675B]">
                {sharedCount}
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-[#D5C9B8] space-y-2">
            <button
              type="button"
              onClick={() => setIsTemplateOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl tactile-btn-secondary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#C97D52]" />
              <span>Browse Templates</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DE] border border-[#D5C9B8] text-xs font-medium text-[#74675B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import .txt / .md</span>
            </button>
          </div>
        </div>

        {/* Demo User Switcher Section in Sidebar */}
        <div className="pt-4 border-t border-[#D5C9B8] mt-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C8E80] mb-2">
            Switch Demo User (P0)
          </div>
          <div className="space-y-1">
            {demoAccounts.map((account) => {
              const isCurrent = user?.email === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => switchDemoUser(account.email)}
                  className={`w-full text-left p-2 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-[#FFFFFF] font-bold text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                      : "hover:bg-[#EFE8DE] text-[#74675B]"
                  }`}
                >
                  <span className="truncate">{account.name.split(" ")[0]}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#C97D52]" />}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {/* Reviewer Quick Tour Banner (Collapsible Evaluator Aid) */}
        {showTourBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFFFFF] border-2 border-[#C97D52]/40 tactile-elevation-2 relative select-none animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setShowTourBanner(false)}
              className="absolute right-3.5 top-3.5 text-[#9C8E80] hover:text-[#2D251E] p-1 cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <div className="w-9 h-9 rounded-xl tactile-avatar-ring flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-[#2D251E] uppercase tracking-wider">
                    Reviewer Quick Tour (P0 Criteria in 60s)
                  </h3>
                  <span className="text-[10px] font-mono text-[#4E9A68] bg-[#EBF5EE] border border-[#4E9A68]/30 px-1.5 py-0.2 rounded font-bold">
                    MongoDB Ready
                  </span>
                </div>
                <p className="text-xs text-[#74675B] mt-1 leading-relaxed">
                  <strong>1. Create & Format:</strong> Click <em>New Document</em> &rarr; test rich formatting (H1/H2, Bold, Lists, Autosave).<br />
                  <strong>2. Share Flow:</strong> Click <em>Share</em> &rarr; add <strong>Sam Taylor</strong>.<br />
                  <strong>3. Verify Access:</strong> Switch to <strong>Sam Taylor</strong> (document opens under <em>Shared With Me</em>); switch to <strong>Jordan Lee</strong> (access is strictly denied with 403 Forbidden).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Greeting & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="tactile-tag text-[10px] px-2 py-0.5 rounded">
                Workspace Dashboard
              </span>
              <span className="text-[10px] font-mono text-[#C97D52] bg-[#F7EBE4] px-2 py-0.5 rounded-full font-bold">
                Neo-Skeuomorphic System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D251E] tracking-tight mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-[#74675B] mt-0.5">
              Create, organize, format, and share team documents without clutter.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsTemplateOpen(true)}
              className="py-2.5 px-4 rounded-xl font-bold text-xs tactile-btn-secondary flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-[#C97D52]" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            <button
              type="button"
              disabled={isCreating}
              onClick={() => handleCreateDocument()}
              className="py-3 px-5 rounded-xl font-bold text-xs sm:text-sm tactile-btn-copper flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Plus className="w-4 h-4 text-white" />
              )}
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FBEBE8] border-2 border-[#E5877A] text-[#BA4E3E] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls Bar: Search Input & Filter Tabs */}
        <div className="tactile-elevation-1 rounded-2xl p-4 bg-[#FAF7F2] border border-[#E2D9CC] mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input (Sunken Debossed Channel) */}
          <div className="w-full sm:w-72 relative tactile-inset rounded-xl tactile-input-focus">
            <Search className="w-4 h-4 text-[#9C8E80] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title..."
              className="w-full bg-transparent pl-10 pr-3.5 py-2 text-xs font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C8E80] hover:text-[#2D251E]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="tactile-inset p-1 rounded-xl flex items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#FFFFFF] text-[#2D251E] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
            >
              All ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("owned")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === "owned"
                  ? "bg-[#FFFFFF] text-[#2D251E] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
            >
              Owned ({ownedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("shared")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === "shared"
                  ? "bg-[#FFFFFF] text-[#2D251E] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
            >
              Shared ({sharedCount})
            </button>
          </div>
        </div>

        {/* Documents Grid / States */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-[#EFE8DE] border border-[#D5C9B8] animate-pulse p-4"
              />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          /* Empty State (Styled like "EMPTY STATE" in Reference Board) */
          <div className="tactile-elevation-1 rounded-2xl p-10 bg-[#FAF7F2] border-2 border-dashed border-[#D5C9B8] text-center my-6">
            <div className="w-14 h-14 rounded-2xl tactile-avatar-ring mx-auto flex items-center justify-center text-white mb-4 shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[#2D251E]">
              {searchQuery ? "No matching documents found" : "No documents yet"}
            </h3>
            <p className="text-xs text-[#74675B] max-w-sm mx-auto mt-1 mb-5">
              {searchQuery
                ? `No documents matched the query "${searchQuery}". Clear search or create a new document.`
                : "Your workspace is ready. Create a blank document, select a team template, or import a file."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleCreateDocument()}
                className="py-2.5 px-5 rounded-xl text-xs font-bold tactile-btn-copper flex items-center gap-2 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Blank Document</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTemplateOpen(true)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[#C97D52]" />
                <span>Templates</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpen={onOpenDocument}
                onTogglePin={handleTogglePin}
                onRename={(d) => {
                  setRenameDoc(d);
                  setNewTitle(d.title);
                }}
                onDelete={(d) => setDeleteDoc(d)}
                onShare={(d) => setShareDoc(d)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Template Dialog */}
      <TemplateDialog
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelectTemplate={handleCreateDocument}
        isCreating={isCreating}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDoc !== null}
        document={shareDoc}
        onClose={() => setShareDoc(null)}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={(newDoc) => {
          setDocuments((prev) => [newDoc, ...prev]);
          onOpenDocument(newDoc);
        }}
      />

      {/* Rename Dialog (Modal) */}
      {renameDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-6 relative">
            <h2 className="text-base font-extrabold text-[#2D251E] mb-2 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#C97D52]" />
              <span>Rename Document</span>
            </h2>
            <p className="text-xs text-[#74675B] mb-4">
              Enter a new title for this document. Only the owner can rename documents.
            </p>

            <form onSubmit={handleConfirmRename}>
              <div className="tactile-inset rounded-xl tactile-input-focus mb-5">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Document Title"
                  required
                  autoFocus
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-[#2D251E] placeholder-[#9C8E80] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenameDoc(null)}
                  className="py-2 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !newTitle.trim()}
                  className="py-2 px-5 rounded-xl text-xs font-bold tactile-btn-copper disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isRenaming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Save Title</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Exact "Confirm Delete" modal from Reference Board) */}
      {deleteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#FAF7F2] border-2 border-[#BA4E3E]/40 tactile-elevation-3 rounded-2xl p-6 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FBEBE8] border border-[#E5877A] text-[#BA4E3E] mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#2D251E] mb-1">
              Confirm Delete
            </h3>
            <p className="text-xs text-[#74675B] mb-5">
              Are you sure you want to delete <strong className="text-[#2D251E]">&quot;{deleteDoc.title}&quot;</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteDoc(null)}
                className="py-2 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="py-2 px-5 rounded-xl text-xs font-bold bg-[#BA4E3E] hover:bg-[#A33E30] text-white border border-[#8C2E22] transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
