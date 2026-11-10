"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { DocumentItem } from "../documents/document-card";
import { EditorToolbar } from "./editor-toolbar";
import { ShareDialog } from "../sharing/share-dialog";
import {
  ArrowLeft,
  Share2,
  Check,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";

interface DocumentEditorProps {
  documentId: string;
  onBack: () => void;
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document
  const fetchDoc = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      const data = await res.json();
      if (res.ok && data.document) {
        setDoc(data.document);
        setTitle(data.document.title);
        setLastSavedTime(new Date(data.document.updatedAt));
      }
    } catch (err) {
      console.error("Failed to fetch document:", err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // Persist content to server
  const saveContent = useCallback(
    async (jsonContent: any) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: jsonContent }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setLastSavedTime(new Date());
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    },
    [documentId]
  );

  // Initialize Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
    ],
    content: doc?.content || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none focus:outline-none min-h-[500px] text-[#2D251E] font-['Poppins',sans-serif] leading-relaxed text-base",
      },
    },
    onUpdate: ({ editor: ed }) => {
      setSaveStatus("saving");
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveContent(ed.getJSON());
      }, 800);
    },
  });

  // Load content once fetched
  useEffect(() => {
    if (editor && doc?.content && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(doc.content)) {
        editor.commands.setContent(doc.content);
      }
    }
  }, [editor, doc?.content]);

  // Handle title rename
  const handleTitleChange = (newTitleVal: string) => {
    setTitle(newTitleVal);
    if (!doc?.isOwner) return;

    if (titleTimerRef.current) {
      clearTimeout(titleTimerRef.current);
    }
    titleTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitleVal.trim() || "Untitled document" }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setLastSavedTime(new Date());
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl tactile-avatar-ring flex items-center justify-center animate-pulse mb-4 shadow-md">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-xs font-bold text-[#74675B] animate-pulse">
          Restoring document canvas & formatting...
        </p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FBEBE8] border border-[#E5877A] text-[#BA4E3E] mx-auto flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-[#2D251E]">
          Document Unavailable
        </h2>
        <p className="text-xs text-[#74675B] mt-1 mb-5">
          This document could not be found or you do not have permission to view it.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="py-2.5 px-5 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#2D251E] flex flex-col select-none">
      {/* Top Bar (Section 4.2 Layout) */}
      <header className="h-14 border-b border-[#D5C9B8] bg-[#FAF7F2] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[#EFE8DE] border border-transparent hover:border-[#D5C9B8] text-[#74675B] hover:text-[#2D251E] transition-all cursor-pointer"
            title="Back to documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Editable Document Title */}
          <div className="min-w-0">
            {doc.isOwner ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled document"
                className="bg-transparent font-extrabold text-sm sm:text-base text-[#2D251E] focus:outline-none focus:bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-transparent focus:border-[#C97D52] transition-colors truncate max-w-[200px] sm:max-w-md"
              />
            ) : (
              <div className="flex items-center gap-2 px-2 py-0.5">
                <span className="font-extrabold text-sm sm:text-base text-[#2D251E] truncate max-w-[200px] sm:max-w-md">
                  {title}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold text-[#4E9A68] bg-[#EBF5EE] border border-[#4E9A68]/30">
                  Shared
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Save Status & Share Button */}
        <div className="flex items-center gap-3">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {saveStatus === "saving" ? (
              <span className="text-[#C97D52] flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            ) : saveStatus === "saved" ? (
              <span className="text-[#4E9A68] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : (
              <span className="text-[#BA4E3E] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Couldn&apos;t save</span>
              </span>
            )}
          </div>

          {/* Share Button (Owner Only) */}
          {doc.isOwner && (
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="py-1.5 px-3.5 rounded-xl font-bold text-xs tactile-btn-copper flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>
      </header>

      {/* Formatting Toolbar */}
      <EditorToolbar editor={editor} readOnly={false} />

      {/* Writing Canvas */}
      <main className="flex-1 py-8 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="tactile-elevation-2 rounded-2xl p-8 sm:p-14 bg-[#FFFFFF] border border-[#E2D9CC] min-h-[600px] shadow-sm relative">
          <EditorContent editor={editor} />
        </div>

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#9C8E80] px-2 font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>
              Last updated:{" "}
              {lastSavedTime ? lastSavedTime.toLocaleTimeString() : "Just now"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C97D52]" />
            <span>Tiptap Structured JSON (MongoDB)</span>
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareOpen}
        document={doc}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}

