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
} from "lucide-react";

interface DocumentEditorProps {
  documentId: string;
  onBack: () => void;
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

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);

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
          showToast("Failed to save changes", "error");
        }
      } catch {
        setSaveStatus("error");
        showToast("Network error saving document", "error");
      }
    },
    [documentId, showToast]
  );

  // Initialize Tiptap with full suite of extensions
  const editor = useEditor({
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

  // Manual Instant Save trigger
  const handleForceSave = () => {
    if (!editor) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    saveContent(editor.getJSON());
    showToast("Changes synced to MongoDB", "success");
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

  // Convert JSON to Markdown
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
      showToast("Switched to Markdown Source View", "info");
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
      if (editor) {
        editor.commands.setContent(newJson);
        saveContent(newJson);
      }
      setEditorMode("rich");
      showToast("Switched to Visual Rich-Text Canvas", "info");
    }
  };

  // Live Analytics (Word count, character count, reading time)
  const analytics = useMemo(() => {
    if (!editor) return { words: 0, characters: 0, readingMinutes: 1 };
    const text = editor.getText();
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingMinutes };
  }, [editor?.getText()]);

  // Copy document URL to clipboard (P1 Feature)
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/?doc=${documentId}`;
      navigator.clipboard.writeText(url);
      showToast("Document link copied to clipboard!", "success");
    }
  };

    // 1. Export as PDF (.pdf) via native browser print
    const exportToPdf = () => {
      setIsExportOpen(false);
      showToast("Opening Print / Save as PDF...", "info");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }, 200);
    };

    // 2. Export as Word Document (.doc) with full styles
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
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #2D251E;
      margin: 1in;
    }
    h1.title {
      font-size: 24pt;
      font-weight: bold;
      color: #2D251E;
      border-bottom: 2pt solid #C97D52;
      padding-bottom: 8pt;
      margin-bottom: 16pt;
    }
    h1 { font-size: 18pt; font-weight: bold; color: #2D251E; margin-top: 16pt; margin-bottom: 6pt; }
    h2 { font-size: 14pt; font-weight: bold; color: #2D251E; margin-top: 12pt; margin-bottom: 4pt; }
    h3 { font-size: 12pt; font-weight: bold; color: #2D251E; margin-top: 10pt; margin-bottom: 3pt; }
    p { margin: 6pt 0; line-height: 1.6; }
    ul { margin: 6pt 0 6pt 20pt; list-style-type: disc; }
    ol { margin: 6pt 0 6pt 20pt; list-style-type: decimal; }
    li { margin: 3pt 0; }
    blockquote {
      border-left: 3pt solid #C97D52;
      background: #FAF7F2;
      padding: 8pt 14pt;
      margin: 10pt 0;
      font-style: italic;
      color: #74675B;
    }
    code {
      font-family: Consolas, 'Courier New', monospace;
      background: #EFE8DE;
      padding: 2pt 4pt;
      font-size: 9.5pt;
      color: #8C4F2A;
    }
    pre {
      font-family: Consolas, 'Courier New', monospace;
      background: #FAF7F2;
      border: 1pt solid #D5C9B8;
      padding: 8pt 12pt;
      margin: 10pt 0;
      color: #2D251E;
    }
    hr { border: none; border-top: 1pt dashed #D5C9B8; margin: 16pt 0; }
    mark { background-color: #F8DFCE; color: #8C4F2A; }
  </style>
</head>
<body>
  <h1 class="title">${docTitle}</h1>
  ${contentHtml}
</body>
</html>`;

      const blob = new Blob(["\ufeff" + wordHtml], {
        type: "application/msword;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported as Word Document (.doc)", "success");
    };

    // 3. Export as Markdown (.md)
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

    // 4. Export as Plain Text (.txt)
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

    // 5. Export as Offline HTML (.html)
    const exportToHtml = () => {
      setIsExportOpen(false);
      if (!editor) return;
      const contentHtml = editor.getHTML();
      const docTitle = title.trim() || "Untitled document";

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      background-color: #F4EFEA;
      color: #2D251E;
      line-height: 1.7;
      padding: 40px 20px;
      margin: 0;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 48px;
      border-radius: 16px;
      border: 1px solid #E2D9CC;
      box-shadow: 0 4px 12px rgba(70, 50, 35, 0.08);
    }
    h1.title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #2D251E;
      margin-bottom: 1.5rem;
      border-bottom: 3px solid #C97D52;
      padding-bottom: 0.75rem;
    }
    h1 { font-size: 1.85rem; font-weight: 700; margin-top: 1.5rem; }
    h2 { font-size: 1.45rem; font-weight: 600; margin-top: 1.25rem; }
    h3 { font-size: 1.2rem; font-weight: 600; margin-top: 1rem; }
    p { margin: 0.75rem 0; }
    ul { list-style-type: disc; padding-left: 2rem; margin: 0.75rem 0; }
    ol { list-style-type: decimal; padding-left: 2rem; margin: 0.75rem 0; }
    li { margin: 0.35rem 0; }
    li::marker { color: #C97D52; }
    blockquote {
      border-left: 4px solid #C97D52;
      background-color: #FAF7F2;
      padding: 0.85rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin: 1.25rem 0;
      font-style: italic;
      color: #74675B;
    }
    code {
      background: #EFE8DE;
      color: #8C4F2A;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }
    pre {
      background: #FAF7F2;
      border: 1px solid #D5C9B8;
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
    }
    mark { background: #F8DFCE; color: #8C4F2A; padding: 0.1rem 0.3rem; border-radius: 4px; }
    hr { border: none; border-top: 2px dashed #D5C9B8; margin: 2rem 0; }
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
      showToast("Exported as HTML Document (.html)", "success");
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
            Restoring document canvas & formatting...
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
      <div className="min-h-screen bg-[#F4EFEA] text-[#2D251E] flex flex-col select-none font-['Poppins',sans-serif]">
        {/* Top Bar (Section 4.2 Layout) */}
        <header className="h-16 border-b border-[#D5C9B8] bg-[#FAF7F2] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
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
                  className="bg-transparent font-extrabold text-sm sm:text-base text-[#2D251E] focus:outline-none focus:bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-transparent focus:border-[#C97D52] transition-colors truncate max-w-[180px] sm:max-w-md"
                />
              ) : (
                <div className="flex items-center gap-2 px-2 py-0.5">
                  <span className="font-extrabold text-sm sm:text-base text-[#2D251E] truncate max-w-[180px] sm:max-w-md">
                    {title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold text-[#4E9A68] bg-[#EBF5EE] border border-[#4E9A68]/30">
                    Shared
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Controls, Save Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save Status & Instant Manual Save Button */}
            <div className="flex items-center gap-1.5 text-xs font-semibold mr-1">
              <button
                type="button"
                onClick={handleForceSave}
                className="p-1.5 rounded-lg hover:bg-[#EFE8DE] text-[#74675B] hover:text-[#C97D52] transition-colors cursor-pointer flex items-center gap-1"
                title="Click to sync instantly to MongoDB"
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
                  <span className="hidden sm:inline">Couldn&apos;t save</span>
                </span>
              )}
            </div>

            {/* Tactile Width Slider Control (Matching "SLIDER" from Reference Board) */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-[#EFE8DE] rounded-xl border border-[#D5C9B8]">
              <button
                type="button"
                onClick={() => setCanvasWidth("compact")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${canvasWidth === "compact"
                    ? "bg-[#FFFFFF] text-[#C97D52] tactile-elevation-1 border border-[#C97D52]/40"
                    : "text-[#74675B] hover:text-[#2D251E]"
                  }`}
                title="Compact writing width (680px)"
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => setCanvasWidth("standard")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${canvasWidth === "standard"
                    ? "bg-[#FFFFFF] text-[#C97D52] tactile-elevation-1 border border-[#C97D52]/40"
                    : "text-[#74675B] hover:text-[#2D251E]"
                  }`}
                title="Standard writing width (820px)"
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setCanvasWidth("wide")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${canvasWidth === "wide"
                    ? "bg-[#FFFFFF] text-[#C97D52] tactile-elevation-1 border border-[#C97D52]/40"
                    : "text-[#74675B] hover:text-[#2D251E]"
                  }`}
                title="Wide reading width (1040px)"
              >
                Wide
              </button>
            </div>

            {/* Mode Switch (Rich vs Markdown) */}
            <button
              type="button"
              onClick={handleToggleMode}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${editorMode === "markdown"
                  ? "bg-[#F7EBE4] border-[#C87B50] text-[#C97D52]"
                  : "hover:bg-[#EFE8DE] border-transparent hover:border-[#D5C9B8] text-[#74675B]"
                }`}
              title={editorMode === "rich" ? "Switch to Markdown view" : "Switch to Visual Editor"}
            >
              {editorMode === "rich" ? <Code2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Copy Link Button (P1) */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl hover:bg-[#EFE8DE] border border-transparent hover:border-[#D5C9B8] text-[#74675B] hover:text-[#2D251E] transition-all cursor-pointer"
              title="Copy document link"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Multi-Format Export Dropdown (PDF, Word .doc, Markdown, Text, HTML) */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`py-1.5 px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${isExportOpen
                    ? "bg-[#FFFFFF] border-[#C97D52] text-[#C97D52] tactile-elevation-1"
                    : "hover:bg-[#EFE8DE] border-[#D5C9B8] bg-[#FAF7F2] text-[#74675B] hover:text-[#2D251E]"
                  }`}
                title="Export or Save As (PDF, Word .doc, Markdown, Text, HTML)"
              >
                <Download className="w-3.5 h-3.5 text-[#C97D52]" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 top-11 w-64 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 font-['Poppins',sans-serif]">
                  <div className="px-3 py-2 border-b border-[#E2D9CC] mb-1">
                    <p className="text-[11px] font-bold text-[#74675B] uppercase tracking-wider">
                      Export / Save Document
                    </p>
                    <p className="text-[10px] text-[#9C8E80]">
                      Download or print in multiple formats
                    </p>
                  </div>

                  {/* PDF */}
                  <button
                    type="button"
                    onClick={exportToPdf}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FBEBE8] border border-[#E5877A]/50 flex items-center justify-center text-[#BA4E3E] group-hover:scale-105 transition-transform">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D251E] group-hover:text-[#BA4E3E]">
                        PDF Document (.pdf)
                      </div>
                      <div className="text-[10px] text-[#9C8E80]">
                        Print or save clean PDF layout
                      </div>
                    </div>
                  </button>

                  {/* Word */}
                  <button
                    type="button"
                    onClick={exportToWord}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EBF2FC] border border-[#95B7ED]/50 flex items-center justify-center text-[#285DB5] group-hover:scale-105 transition-transform">
                      <FileEdit className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D251E] group-hover:text-[#285DB5]">
                        Word Document (.doc)
                      </div>
                      <div className="text-[10px] text-[#9C8E80]">
                        MS Word & Google Docs format
                      </div>
                    </div>
                  </button>

                  {/* Markdown */}
                  <button
                    type="button"
                    onClick={exportToMarkdown}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F7EBE4] border border-[#C87B50]/40 flex items-center justify-center text-[#C97D52] group-hover:scale-105 transition-transform">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D251E] group-hover:text-[#C97D52]">
                        Markdown (.md)
                      </div>
                      <div className="text-[10px] text-[#9C8E80]">
                        Standard formatted markdown file
                      </div>
                    </div>
                  </button>

                  {/* Plain Text */}
                  <button
                    type="button"
                    onClick={exportToTxt}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EFE8DE] border border-[#D5C9B8] flex items-center justify-center text-[#74675B] group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D251E]">
                        Plain Text (.txt)
                      </div>
                      <div className="text-[10px] text-[#9C8E80]">
                        Unformatted plain text file
                      </div>
                    </div>
                  </button>

                  {/* HTML */}
                  <button
                    type="button"
                    onClick={exportToHtml}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFFFF] flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] border border-[#4E9A68]/40 flex items-center justify-center text-[#4E9A68] group-hover:scale-105 transition-transform">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D251E] group-hover:text-[#4E9A68]">
                        HTML Web Page (.html)
                      </div>
                      <div className="text-[10px] text-[#9C8E80]">
                        Self-contained offline document
                      </div>
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

        {/* Formatting Toolbar (Only in Rich Text Mode) */}
        {editorMode === "rich" && <EditorToolbar editor={editor} readOnly={false} />}

        {/* Writing Canvas */}
        <main className={`flex-1 py-8 px-4 sm:px-8 mx-auto w-full transition-all duration-200 ${canvasWidthClass}`}>
          <div className="tactile-elevation-2 rounded-2xl p-8 sm:p-14 bg-[#FFFFFF] border border-[#E2D9CC] min-h-[620px] shadow-sm relative">
            {/* Print Only Header (renders when saving to PDF) */}
            <h1 className="hidden print-only-title">{title || "Untitled document"}</h1>

            {editorMode === "rich" ? (
              <EditorContent editor={editor} />
            ) : (
              <textarea
                value={markdownSource}
                onChange={(e) => setMarkdownSource(e.target.value)}
                placeholder="# Write markdown here..."
                className="w-full h-full min-h-[500px] font-mono text-sm bg-transparent border-none focus:outline-none text-[#2D251E] leading-relaxed resize-none"
              />
            )}
          </div>

          {/* Footer Info & Live Document Analytics */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#9C8E80] px-2 font-mono print-hide">
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
                  <span>MongoDB Synced</span>
                </span>
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
