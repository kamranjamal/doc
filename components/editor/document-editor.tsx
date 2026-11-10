"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Image } from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { DocumentItem } from "../documents/document-card";
import { EditorToolbar } from "./editor-toolbar";
import { ShareDialog } from "../sharing/share-dialog";
import { useToast } from "../ui/toast";
import {
  ArrowLeft,
  Share2,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  Download,
  Clock,
  Sparkles,
  Code2,
  Eye,
  BookOpen,
  Printer,
  FileText,
  FileEdit,
  Globe,
  ChevronDown,
  Save,
  MessageSquare,
  History,
  Send,
  Users,
  RotateCcw,
} from "lucide-react";

interface DocumentEditorProps {
  documentId: string;
  onBack: () => void;
}

interface VersionItem {
  id: string;
  versionNumber: number;
  title: string;
  content: any;
  authorName: string;
  authorEmail: string;
  changeSummary: string;
  wordCount: number;
  createdAt: string;
}

interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  isResolved: boolean;
  createdAt: string;
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const { showToast } = useToast();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Advanced Canvas & Analytics Features
  const [canvasWidth, setCanvasWidth] = useState<"compact" | "standard" | "wide">("standard");
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const [markdownSource, setMarkdownSource] = useState("");

  // Version History State
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Comments State
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);

  // Check role-based edit permission
  const canEdit = useMemo(() => {
    if (!doc) return false;
    return doc.isOwner || doc.permission === "EDIT";
  }, [doc]);

  const canComment = useMemo(() => {
    if (!doc) return false;
    return doc.isOwner || doc.permission === "EDIT" || doc.permission === "COMMENT";
  }, [doc]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      window.document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExportOpen]);

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

  // Fetch Version History
  const fetchVersions = useCallback(async () => {
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`);
      const data = await res.json();
      if (res.ok) {
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error("Failed to fetch versions:", err);
    } finally {
      setIsLoadingVersions(false);
    }
  }, [documentId]);

  // Fetch Comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [documentId]);

  useEffect(() => {
    if (isVersionsOpen) fetchVersions();
  }, [isVersionsOpen, fetchVersions]);

  useEffect(() => {
    if (isCommentsOpen) fetchComments();
  }, [isCommentsOpen, fetchComments]);

  // Persist content to server
  const saveContent = useCallback(
    async (jsonContent: any) => {
      if (!canEdit) return;
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
          showToast("Failed to save changes", "error");
        }
      } catch {
        setSaveStatus("error");
        showToast("Network error saving document", "error");
      }
    },
    [documentId, showToast, canEdit]
  );

  // Initialize Tiptap with full suite of extensions
  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#C97D52] underline underline-offset-4 cursor-pointer",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextStyle,
      Color,
    ],
    content: doc?.content || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[500px] text-[#2D251E] font-['Poppins',sans-serif] leading-relaxed text-base",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!canEdit) return;
      setSaveStatus("saving");
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveContent(ed.getJSON());
      }, 800);
    },
  });

  // Keep editor editable state in sync with permission
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  // Load content once fetched
  useEffect(() => {
    if (editor && doc?.content && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(doc.content)) {
        editor.commands.setContent(doc.content);
      }
    }
  }, [editor, doc?.content]);

  // Manual Instant Save trigger
  const handleForceSave = () => {
    if (!editor || !canEdit) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    saveContent(editor.getJSON());
    showToast("Changes synced to database", "success");
  };

  // Create Snapshot Version
  const handleCreateSnapshot = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeSummary: "Manual version snapshot" }),
      });
      if (res.ok) {
        showToast("Created version snapshot", "success");
        fetchVersions();
      }
    } catch {
      showToast("Failed to create snapshot", "error");
    }
  };

  // Restore Previous Version
  const handleRestoreVersion = (v: VersionItem) => {
    if (!editor || !canEdit) return;
    editor.commands.setContent(v.content);
    saveContent(v.content);
    showToast(`Restored version #${v.versionNumber}`, "success");
    setIsVersionsOpen(false);
  };

  // Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !canComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newCommentText.trim() }),
      });
      if (res.ok) {
        setNewCommentText("");
        fetchComments();
        showToast("Comment posted", "success");
      }
    } catch {
      showToast("Failed to post comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Toggle Comment Resolved
  const handleToggleResolveComment = async (commentId: string, currentResolved: boolean) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, isResolved: !currentResolved }),
      });
      if (res.ok) {
        fetchComments();
      }
    } catch {
      showToast("Failed to update comment", "error");
    }
  };

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
          showToast("Failed to update title", "error");
        }
      } catch {
        setSaveStatus("error");
        showToast("Network error updating title", "error");
      }
    }, 600);
  };

  // Convert JSON to Markdown (supports tables & images)
  const jsonToMarkdown = useCallback((json: any): string => {
    if (!json?.content || !Array.isArray(json.content)) return "";
    let md = "";
    for (const node of json.content) {
      const text = node.content?.map((c: any) => c.text).join("") || "";
      if (node.type === "heading") {
        const hashes = "#".repeat(node.attrs?.level || 1);
        md += `${hashes} ${text}\n\n`;
      } else if (node.type === "bulletList") {
        if (node.content) {
          for (const item of node.content) {
            const itemText =
              item.content?.[0]?.content?.map((c: any) => c.text).join("") || "";
            md += `- ${itemText}\n`;
          }
          md += "\n";
        }
      } else if (node.type === "orderedList") {
        if (node.content) {
          let i = 1;
          for (const item of node.content) {
            const itemText =
              item.content?.[0]?.content?.map((c: any) => c.text).join("") || "";
            md += `${i}. ${itemText}\n`;
            i++;
          }
          md += "\n";
        }
      } else if (node.type === "taskList") {
        if (node.content) {
          for (const item of node.content) {
            const checked = item.attrs?.checked ? "[x]" : "[ ]";
            const itemText =
              item.content?.[0]?.content?.map((c: any) => c.text).join("") || "";
            md += `- ${checked} ${itemText}\n`;
          }
          md += "\n";
        }
      } else if (node.type === "blockquote") {
        md += `> ${text}\n\n`;
      } else if (node.type === "codeBlock") {
        md += `\`\`\`\n${text}\n\`\`\`\n\n`;
      } else if (node.type === "image") {
        md += `![${node.attrs?.alt || "Image"}](${node.attrs?.src})\n\n`;
      } else if (node.type === "table") {
        if (node.content && Array.isArray(node.content)) {
          let isFirst = true;
          for (const row of node.content) {
            if (row.content && Array.isArray(row.content)) {
              const cells = row.content.map((c: any) => {
                return c.content?.[0]?.content?.map((t: any) => t.text).join("") || "";
              });
              md += `| ${cells.join(" | ")} |\n`;
              if (isFirst) {
                md += `| ${cells.map(() => "---").join(" | ")} |\n`;
                isFirst = false;
              }
            }
          }
          md += "\n";
        }
      } else {
        md += `${text}\n\n`;
      }
    }
    return md;
  }, []);

  // Sync Markdown source when toggling mode
  const handleToggleMode = () => {
    if (editorMode === "rich") {
      if (editor) {
        setMarkdownSource(jsonToMarkdown(editor.getJSON()));
      }
      setEditorMode("markdown");
      showToast("Switched to Markdown View", "info");
    } else {
      const lines = markdownSource.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const contentNodes = lines.map((line) => {
        if (line.startsWith("# ")) {
          return {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: line.replace(/^#\s+/, "") }],
          };
        } else if (line.startsWith("## ")) {
          return {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: line.replace(/^##\s+/, "") }],
          };
        } else if (line.startsWith("### ")) {
          return {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: line.replace(/^###\s+/, "") }],
          };
        }
        return {
          type: "paragraph",
          content: [{ type: "text", text: line }],
        };
      });
      const newJson = {
        type: "doc",
        content: contentNodes.length > 0 ? contentNodes : [{ type: "paragraph" }],
      };
      if (editor && canEdit) {
        editor.commands.setContent(newJson);
        saveContent(newJson);
      }
      setEditorMode("rich");
      showToast("Switched to Visual Canvas", "info");
    }
  };

  // Live Analytics
  const analytics = useMemo(() => {
    if (!editor) return { words: 0, characters: 0, readingMinutes: 1 };
    const text = editor.getText();
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingMinutes };
  }, [editor?.getText()]);

  // Copy document URL
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/?doc=${documentId}`;
      navigator.clipboard.writeText(url);
      showToast("Document link copied", "success");
    }
  };

  // 1. Export as PDF
  const exportToPdf = () => {
    setIsExportOpen(false);
    showToast("Opening Print to PDF...", "info");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
    }, 200);
  };

  // 2. Export as Word Document (.doc)
  const exportToWord = () => {
    setIsExportOpen(false);
    if (!editor) return;
    const contentHtml = editor.getHTML();
    const docTitle = title.trim() || "Untitled document";

    const wordHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${docTitle}</title>
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #2D251E; margin: 1in; }
    h1.title { font-size: 24pt; font-weight: bold; color: #2D251E; border-bottom: 2pt solid #C97D52; padding-bottom: 8pt; margin-bottom: 16pt; }
    h1 { font-size: 18pt; font-weight: bold; color: #2D251E; margin-top: 16pt; margin-bottom: 6pt; }
    h2 { font-size: 14pt; font-weight: bold; color: #2D251E; margin-top: 12pt; margin-bottom: 4pt; }
    h3 { font-size: 12pt; font-weight: bold; color: #2D251E; margin-top: 10pt; margin-bottom: 3pt; }
    p { margin: 6pt 0; line-height: 1.6; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th { background-color: #EFE8DE; border: 1pt solid #D5C9B8; padding: 6pt 10pt; font-weight: bold; text-align: left; }
    td { border: 1pt solid #D5C9B8; padding: 6pt 10pt; }
    blockquote { border-left: 3pt solid #C97D52; background: #FAF7F2; padding: 8pt 14pt; margin: 10pt 0; font-style: italic; color: #74675B; }
    code { font-family: Consolas, monospace; background: #EFE8DE; padding: 2pt 4pt; font-size: 9.5pt; color: #8C4F2A; }
    pre { font-family: Consolas, monospace; background: #FAF7F2; border: 1pt solid #D5C9B8; padding: 8pt 12pt; margin: 10pt 0; }
  </style>
</head>
<body>
  <h1 class="title">${docTitle}</h1>
  ${contentHtml}
</body>
</html>`;

    const blob = new Blob(["\ufeff" + wordHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Word Document (.doc)", "success");
  };

  // 3. Export as Markdown
  const exportToMarkdown = () => {
    setIsExportOpen(false);
    if (!editor) return;
    const docTitle = title.trim() || "Untitled document";
    const mdText = `# ${docTitle}\n\n` + jsonToMarkdown(editor.getJSON());
    const blob = new Blob([mdText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Markdown (.md)", "success");
  };

  // 4. Export as Plain Text
  const exportToTxt = () => {
    setIsExportOpen(false);
    if (!editor) return;
    const docTitle = title.trim() || "Untitled document";
    const textContent = `${docTitle}\n${"=".repeat(docTitle.length)}\n\n${editor.getText()}`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Plain Text (.txt)", "success");
  };

  // 5. Export as HTML
  const exportToHtml = () => {
    setIsExportOpen(false);
    if (!editor) return;
    const contentHtml = editor.getHTML();
    const docTitle = title.trim() || "Untitled document";

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    body { font-family: system-ui, sans-serif; background-color: #F4EFEA; color: #2D251E; line-height: 1.7; padding: 40px 20px; }
    .container { max-width: 820px; margin: 0 auto; background: #FFFFFF; padding: 48px; border-radius: 16px; border: 1px solid #E2D9CC; }
    h1.title { font-size: 2.25rem; font-weight: 800; color: #2D251E; border-bottom: 3px solid #C97D52; padding-bottom: 0.75rem; }
    table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; border: 2px solid #C87B50; }
    th { background: #EFE8DE; border: 1px solid #D5C9B8; padding: 0.75rem 1rem; text-align: left; }
    td { border: 1px solid #D5C9B8; padding: 0.75rem 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">${docTitle}</h1>
    ${contentHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as HTML (.html)", "success");
  };

  const canvasWidthClass =
    canvasWidth === "compact"
      ? "max-w-2xl"
      : canvasWidth === "wide"
      ? "max-w-5xl"
      : "max-w-3xl";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center font-['Poppins',sans-serif]">
        <div className="w-12 h-12 rounded-2xl tactile-avatar-ring flex items-center justify-center animate-pulse mb-4 shadow-md">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-xs font-bold text-[#74675B] animate-pulse">
          Opening document workspace...
        </p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center p-6 text-center font-['Poppins',sans-serif]">
        <div className="w-12 h-12 rounded-2xl bg-[#FBEBE8] border border-[#E5877A] text-[#BA4E3E] mx-auto flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-[#2D251E]">Document Unavailable</h2>
        <p className="text-xs text-[#74675B] mt-1 mb-5">
          This document could not be found or access is restricted.
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
    <div className="min-h-screen bg-[#F4EFEA] text-[#2D251E] flex flex-col select-none font-['Poppins',sans-serif]">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#D5C9B8] bg-[#FAF7F2] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
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
          <div className="min-w-0 flex items-center gap-2">
            {doc.isOwner ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled document"
                className="bg-transparent font-extrabold text-sm sm:text-base text-[#2D251E] focus:outline-none focus:bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-transparent focus:border-[#C97D52] transition-colors truncate max-w-[180px] sm:max-w-md"
              />
            ) : (
              <div className="flex items-center gap-2 px-2 py-0.5">
                <span className="font-extrabold text-sm sm:text-base text-[#2D251E] truncate max-w-[180px] sm:max-w-md">
                  {title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    doc.permission === "VIEW"
                      ? "text-[#74675B] bg-[#EFE8DE]"
                      : doc.permission === "COMMENT"
                      ? "text-[#D48B38] bg-[#FEF7EC] border border-[#D48B38]/30"
                      : "text-[#4E9A68] bg-[#EBF5EE] border border-[#4E9A68]/30"
                  }`}
                >
                  {doc.permission === "VIEW"
                    ? "View Only"
                    : doc.permission === "COMMENT"
                    ? "Comment Only"
                    : "Can Edit"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Real-Time Presence, Save Status, Tools & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulated Real-Time Active Collaborators */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#D5C9B8] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#4E9A68] animate-pulse" />
            <div className="flex -space-x-1.5 overflow-hidden">
              <div
                className="inline-block h-5 w-5 rounded-full ring-2 ring-white tactile-avatar-ring text-[9px] font-extrabold flex items-center justify-center text-white"
                title={`${doc.owner?.name || "Owner"} (Active now)`}
              >
                {doc.owner?.name?.[0] || "A"}
              </div>
              <div
                className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#4E9A68] text-[9px] font-extrabold flex items-center justify-center text-white"
                title="Active Workspace Presence"
              >
                ST
              </div>
            </div>
            <span className="text-[10px] font-medium text-[#74675B] ml-1">
              2 online
            </span>
          </div>

          {/* Save Status & Instant Save Button */}
          {canEdit && (
            <div className="flex items-center gap-1.5 text-xs font-semibold mr-1">
              <button
                type="button"
                onClick={handleForceSave}
                className="p-1.5 rounded-lg hover:bg-[#EFE8DE] text-[#74675B] hover:text-[#C97D52] transition-colors cursor-pointer"
                title="Sync changes"
              >
                <Save className="w-3.5 h-3.5" />
              </button>

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
                  <span className="hidden sm:inline">Unsaved</span>
                </span>
              )}
            </div>
          )}

          {/* Width Slider Control */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-[#EFE8DE] rounded-xl border border-[#D5C9B8]">
            <button
              type="button"
              onClick={() => setCanvasWidth("compact")}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                canvasWidth === "compact"
                  ? "bg-[#FFFFFF] text-[#C97D52] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
              title="Compact width (680px)"
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setCanvasWidth("standard")}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                canvasWidth === "standard"
                  ? "bg-[#FFFFFF] text-[#C97D52] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
              title="Standard width (820px)"
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setCanvasWidth("wide")}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                canvasWidth === "wide"
                  ? "bg-[#FFFFFF] text-[#C97D52] tactile-elevation-1 border border-[#C97D52]/40"
                  : "text-[#74675B] hover:text-[#2D251E]"
              }`}
              title="Wide width (1040px)"
            >
              Wide
            </button>
          </div>

          {/* Comments Panel Button */}
          <button
            type="button"
            onClick={() => {
              setIsCommentsOpen(!isCommentsOpen);
              setIsVersionsOpen(false);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isCommentsOpen
                ? "bg-[#FFFFFF] border-[#C97D52] text-[#C97D52] tactile-elevation-1"
                : "hover:bg-[#EFE8DE] border-transparent hover:border-[#D5C9B8] text-[#74675B]"
            }`}
            title="Comments & Feedback"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.filter((c) => !c.isResolved).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C97D52] text-white text-[9px] font-bold flex items-center justify-center">
                {comments.filter((c) => !c.isResolved).length}
              </span>
            )}
          </button>

          {/* Version History Button */}
          <button
            type="button"
            onClick={() => {
              setIsVersionsOpen(!isVersionsOpen);
              setIsCommentsOpen(false);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isVersionsOpen
                ? "bg-[#FFFFFF] border-[#C97D52] text-[#C97D52] tactile-elevation-1"
                : "hover:bg-[#EFE8DE] border-transparent hover:border-[#D5C9B8] text-[#74675B]"
            }`}
            title="Version History Snapshots"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Mode Switch (Rich vs Markdown) */}
          <button
            type="button"
            onClick={handleToggleMode}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              editorMode === "markdown"
                ? "bg-[#F7EBE4] border-[#C87B50] text-[#C97D52]"
                : "hover:bg-[#EFE8DE] border-transparent hover:border-[#D5C9B8] text-[#74675B]"
            }`}
            title={editorMode === "rich" ? "Switch to Markdown" : "Switch to Visual Canvas"}
          >
            {editorMode === "rich" ? <Code2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl hover:bg-[#EFE8DE] border border-transparent hover:border-[#D5C9B8] text-[#74675B] hover:text-[#2D251E] transition-all cursor-pointer"
            title="Copy link"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Multi-Format Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className={`py-1.5 px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                isExportOpen
                  ? "bg-[#FFFFFF] border-[#C97D52] text-[#C97D52] tactile-elevation-1"
                  : "hover:bg-[#EFE8DE] border-[#D5C9B8] bg-[#FAF7F2] text-[#74675B] hover:text-[#2D251E]"
              }`}
              title="Export As..."
            >
              <Download className="w-3.5 h-3.5 text-[#C97D52]" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-11 w-64 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 font-['Poppins',sans-serif]">
                <div className="px-3 py-2 border-b border-[#E2D9CC] mb-1">
                  <p className="text-[11px] font-bold text-[#74675B] uppercase tracking-wider">
                    Export Document
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportToPdf}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FBEBE8] border border-[#E5877A]/50 flex items-center justify-center text-[#BA4E3E]">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D251E]">PDF Document (.pdf)</div>
                    <div className="text-[10px] text-[#9C8E80]">Print or clean PDF save</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportToWord}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EBF2FC] border border-[#95B7ED]/50 flex items-center justify-center text-[#285DB5]">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D251E]">Word Document (.doc)</div>
                    <div className="text-[10px] text-[#9C8E80]">MS Word & Google Docs format</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportToMarkdown}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#F7EBE4] border border-[#C87B50]/40 flex items-center justify-center text-[#C97D52]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D251E]">Markdown (.md)</div>
                    <div className="text-[10px] text-[#9C8E80]">Standard markdown file</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportToTxt}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EFE8DE] border border-[#D5C9B8] flex items-center justify-center text-[#74675B]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D251E]">Plain Text (.txt)</div>
                    <div className="text-[10px] text-[#9C8E80]">Unformatted plain text</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportToHtml}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] border border-[#4E9A68]/40 flex items-center justify-center text-[#4E9A68]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D251E]">HTML Web Page (.html)</div>
                    <div className="text-[10px] text-[#9C8E80]">Offline standalone document</div>
                  </div>
                </button>
              </div>
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

      {/* Formatting Toolbar (Only in Rich Text Mode & when user can edit) */}
      {editorMode === "rich" && canEdit && (
        <EditorToolbar editor={editor} readOnly={!canEdit} />
      )}

      {/* Read-Only Notice when viewing or commenting */}
      {!canEdit && (
        <div className="bg-[#FAF6F1] border-b border-[#D5C9B8] px-4 py-2 flex items-center justify-between text-xs text-[#74675B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C97D52]" />
            <span>
              You have <strong>{doc.permission === "COMMENT" ? "Commenter" : "View-Only"}</strong> access to this document. Content editing is disabled.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="text-xs font-bold text-[#C97D52] hover:underline cursor-pointer"
          >
            Open Comments
          </button>
        </div>
      )}

      {/* Main Container with Optional Sliding Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Writing Canvas */}
        <main
          className={`flex-1 py-8 px-4 sm:px-8 mx-auto w-full transition-all duration-200 overflow-y-auto ${canvasWidthClass}`}
        >
          <div className="tactile-elevation-2 rounded-2xl p-8 sm:p-14 bg-[#FFFFFF] border border-[#E2D9CC] min-h-[620px] shadow-sm relative z-10">
            {/* Print Only Header */}
            <h1 className="hidden print-only-title">{title || "Untitled document"}</h1>

            {editorMode === "rich" ? (
              <EditorContent editor={editor} />
            ) : (
              <textarea
                value={markdownSource}
                onChange={(e) => setMarkdownSource(e.target.value)}
                readOnly={!canEdit}
                placeholder="# Write markdown here..."
                className="w-full h-full min-h-[500px] font-mono text-sm bg-transparent border-none focus:outline-none text-[#2D251E] leading-relaxed resize-none"
              />
            )}
          </div>

          {/* Footer Info & Live Document Analytics */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#9C8E80] px-2 font-mono print-hide mb-8">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C97D52]" />
                <span>
                  {lastSavedTime ? `Saved at ${lastSavedTime.toLocaleTimeString()}` : "Saved"}
                </span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#4E9A68]" />
                <span>{analytics.readingMinutes} min read</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span>{analytics.words} words</span>
              <span>•</span>
              <span>{analytics.characters} chars</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#C97D52]">
                <Sparkles className="w-3 h-3" />
                <span>Live Synced</span>
              </span>
            </div>
          </div>
        </main>

        {/* Panel 1: Version History Drawer */}
        {isVersionsOpen && (
          <aside className="w-80 border-l border-[#D5C9B8] bg-[#FAF7F2] p-4 flex flex-col shadow-xl animate-in slide-in-from-right duration-200 z-30 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5C9B8] mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#C97D52]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D251E]">
                  Version History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#EFE8DE] text-[#74675B]"
              >
                ✕
              </button>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={handleCreateSnapshot}
                className="w-full mb-3 py-2 px-3 rounded-xl text-xs font-bold tactile-btn-secondary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C97D52]" />
                <span>Create Named Snapshot</span>
              </button>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingVersions ? (
                <div className="py-8 text-center text-xs text-[#74675B]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-[#C97D52]" />
                  Loading history...
                </div>
              ) : versions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#74675B]">
                  No past snapshots saved yet. Click &quot;Create Named Snapshot&quot; above to preserve current state.
                </div>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-white border border-[#E2D9CC] tactile-elevation-1 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2D251E]">
                        Version #{v.versionNumber}
                      </span>
                      <span className="text-[10px] text-[#9C8E80]">
                        {new Date(v.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74675B] line-clamp-1">
                      {v.changeSummary}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#EFE8DE] text-[10px] text-[#9C8E80]">
                      <span>{v.authorName}</span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleRestoreVersion(v)}
                          className="font-bold text-[#C97D52] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Panel 2: Comments & Suggestions Drawer */}
        {isCommentsOpen && (
          <aside className="w-80 border-l border-[#D5C9B8] bg-[#FAF7F2] p-4 flex flex-col shadow-xl animate-in slide-in-from-right duration-200 z-30 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5C9B8] mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C97D52]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D251E]">
                  Document Comments
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#EFE8DE] text-[#74675B]"
              >
                ✕
              </button>
            </div>

            {/* New Comment Input */}
            {canComment && (
              <form onSubmit={handlePostComment} className="mb-4">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Leave a comment or suggestion..."
                  rows={2}
                  className="w-full bg-white border border-[#D5C9B8] rounded-xl p-2.5 text-xs text-[#2D251E] placeholder-[#9C8E80] focus:outline-none focus:border-[#C97D52] resize-none"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newCommentText.trim()}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold tactile-btn-copper flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Comment</span>
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {comments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#74675B]">
                  No comments yet. Start the conversation with your team!
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border transition-all ${
                      c.isResolved
                        ? "bg-[#FAF7F2] border-[#D5C9B8] opacity-60"
                        : "bg-white border-[#E2D9CC] tactile-elevation-1"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#2D251E] truncate max-w-[130px]">
                        {c.userName}
                      </span>
                      <span className="text-[10px] text-[#9C8E80]">
                        {new Date(c.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#2D251E] leading-relaxed mb-2">
                      {c.text}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#EFE8DE]">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          c.isResolved ? "text-[#4E9A68]" : "text-[#9C8E80]"
                        }`}
                      >
                        {c.isResolved ? "Resolved" : "Open"}
                      </span>
                      {canComment && (
                        <button
                          type="button"
                          onClick={() => handleToggleResolveComment(c.id, c.isResolved)}
                          className="text-[10px] font-semibold text-[#74675B] hover:text-[#C97D52] cursor-pointer"
                        >
                          {c.isResolved ? "Reopen" : "Mark Resolved"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareOpen}
        document={doc}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
