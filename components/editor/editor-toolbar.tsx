"use client";

import React, { useState, useRef, useEffect } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Unlink,
  RemoveFormatting,
  Check,
  X,
  Undo2,
  Redo2,
  Table as TableIcon,
  Image as ImageIcon,
  Palette,
  HelpCircle,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Modal } from "../ui/modal";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

const TEXT_COLORS = [
  { label: "Ink Primary", value: "#2D251E" },
  { label: "Burnished Copper", value: "#C97D52" },
  { label: "Forest Green", value: "#4E9A68" },
  { label: "Crimson Red", value: "#BA4E3E" },
  { label: "Golden Amber", value: "#D48B38" },
  { label: "Slate Blue", value: "#3B6E8C" },
  { label: "Royal Violet", value: "#7C3AED" },
];

const HIGHLIGHT_COLORS = [
  { label: "Copper Glow", value: "#F8DFCE" },
  { label: "Mint Glow", value: "#E2F4E8" },
  { label: "Sunshine Glow", value: "#FEF3D6" },
  { label: "Rose Glow", value: "#FCE8E6" },
  { label: "Sky Glow", value: "#E0F2FE" },
];

export function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  // Re-render trigger when editor selection or state changes
  const [, setSelectionVersion] = useState(0);

  // Popover & Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [hoverGrid, setHoverGrid] = useState<{ r: number; c: number }>({ r: 3, c: 3 });

  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const colorMenuRef = useRef<HTMLDivElement | null>(null);
  const highlightMenuRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to editor transactions so toolbar states update reactively
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      setSelectionVersion((v) => v + 1);
    };
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) {
        setIsColorMenuOpen(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(target)) {
        setIsHighlightMenuOpen(false);
      }
    };
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!editor || readOnly) return null;

  const isInTable = editor.isActive("table");

  // Hyperlink Handler
  const handleSetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  const handleOpenLinkModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  };

  // Image Embed Handler
  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      editor
        .chain()
        .focus()
        .setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || "Embedded image" })
        .run();
    }
    setIsImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
  };

  // Insert Table with Custom Rows & Columns
  const handleConfirmInsertTable = () => {
    const rows = Math.min(Math.max(1, tableRows), 20);
    const cols = Math.min(Math.max(1, tableCols), 10);

    const headerCells = Array.from({ length: cols }, (_, i) => ({
      type: "tableHeader",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: `Column ${i + 1}` }],
        },
      ],
    }));

    const dataRows = Array.from({ length: withHeaderRow ? rows - 1 : rows }, (_, r) => ({
      type: "tableRow",
      content: Array.from({ length: cols }, (_, c) => ({
        type: "tableCell",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: `Row ${r + 1}, Col ${c + 1}` }],
          },
        ],
      })),
    }));

    const allRows = withHeaderRow
      ? [{ type: "tableRow", content: headerCells }, ...dataRows]
      : dataRows;

    let inserted = false;
    try {
      inserted = editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow })
        .run();
    } catch {
      inserted = false;
    }

    if (!inserted) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "table",
          content: allRows,
        })
        .run();
    }

    setIsTableModalOpen(false);
  };

  // Smart List Togglers
  const handleToggleBulletList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editor.isActive("taskList")) {
      editor.chain().focus().toggleTaskList().toggleBulletList().run();
    } else {
      editor.chain().focus().toggleBulletList().run();
    }
  };

  const handleToggleOrderedList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editor.isActive("taskList")) {
      editor.chain().focus().toggleTaskList().toggleOrderedList().run();
    } else {
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  const handleToggleTaskList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editor.isActive("bulletList")) {
      editor.chain().focus().toggleBulletList().toggleTaskList().run();
    } else if (editor.isActive("orderedList")) {
      editor.chain().focus().toggleOrderedList().toggleTaskList().run();
    } else {
      editor.chain().focus().toggleTaskList().run();
    }
  };

  const handleToggleBlockquote = (e: React.MouseEvent) => {
    e.preventDefault();
    editor.chain().focus().toggleBlockquote().run();
  };

  return (
    <div className="editor-toolbar-container border-b border-[#D5C9B8] bg-[#FAF7F2] px-3 py-1.5 flex flex-wrap items-center gap-1 select-none font-['Poppins',sans-serif] relative z-40">
      {/* 1. History Controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] disabled:opacity-30 cursor-pointer transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] disabled:opacity-30 cursor-pointer transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 2. Text Hierarchy (Paragraph, H1, H2, H3) */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("paragraph")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Normal Paragraph"
        >
          <Pilcrow className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("heading", { level: 1 })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Heading 1 (Ctrl+Alt+1)"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Heading 2 (Ctrl+Alt+2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Heading 3 (Ctrl+Alt+3)"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 3. Core Character Formatting */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("bold")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("italic")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("underline")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("strike")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("subscript")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Subscript (x₂)"
        >
          <SubscriptIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("superscript")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Superscript (x²)"
        >
          <SuperscriptIcon className="w-3.5 h-3.5" />
        </button>

        {/* Text Color Picker */}
        <div className="relative" ref={colorMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsColorMenuOpen(!isColorMenuOpen);
              setIsHighlightMenuOpen(false);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isColorMenuOpen
                ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                : "text-[#74675B] hover:bg-[#EFE8DE]"
            }`}
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {isColorMenuOpen && (
            <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-xl p-2.5 shadow-2xl w-52 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-bold text-[#74675B] uppercase mb-1.5 px-1">
                Text Color
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {TEXT_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus().setColor(col.value).run();
                      setIsColorMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-[#FFFFFF] border border-transparent hover:border-[#D5C9B8] cursor-pointer"
                    title={col.label}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/15 shadow-xs"
                      style={{ backgroundColor: col.value }}
                    />
                    <span className="text-[9px] text-[#74675B] truncate max-w-[42px]">
                      {col.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setIsColorMenuOpen(false);
                }}
                className="w-full mt-2 text-[10px] font-bold text-[#74675B] hover:text-[#BA4E3E] hover:bg-[#FBEBE8] p-1.5 rounded-lg text-center cursor-pointer transition-colors"
              >
                Reset to Default Color
              </button>
            </div>
          )}
        </div>

        {/* Highlight Color Picker (Brush) */}
        <div className="relative" ref={highlightMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsHighlightMenuOpen(!isHighlightMenuOpen);
              setIsColorMenuOpen(false);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              editor.isActive("highlight")
                ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                : "text-[#74675B] hover:bg-[#EFE8DE]"
            }`}
            title="Highlight Brush"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          {isHighlightMenuOpen && (
            <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-xl p-2.5 shadow-2xl w-48 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-bold text-[#74675B] uppercase mb-1.5 px-1">
                Highlight Brush
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {HIGHLIGHT_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: col.value }).run();
                      setIsHighlightMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#FFFFFF] border border-transparent hover:border-[#D5C9B8] cursor-pointer"
                  >
                    <span
                      className="w-4 h-4 rounded-md border border-black/15"
                      style={{ backgroundColor: col.value }}
                    />
                    <span className="text-[11px] font-medium text-[#2D251E]">
                      {col.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setIsHighlightMenuOpen(false);
                }}
                className="w-full mt-2 text-[10px] font-bold text-[#BA4E3E] hover:bg-[#FBEBE8] p-1.5 rounded-lg text-center cursor-pointer"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("code")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 4. Lists & Interactive Checklists */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleBulletList}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleOrderedList}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("orderedList")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleTaskList}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("taskList")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Task Checklist"
        >
          <ListTodo className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 5. Interactive Table Suite (Modal Creator & Context Operations) */}
      <div className="flex items-center gap-1 shrink-0">
        {!isInTable ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsTableModalOpen(true)}
            className="px-2.5 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center gap-1.5 text-xs font-semibold text-[#74675B] hover:text-[#C97D52] cursor-pointer transition-colors"
            title="Insert Custom Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        ) : (
          /* When inside table: Context controls right in the toolbar */
          <div className="flex items-center gap-1 bg-[#EFE8DE] px-2 py-0.5 rounded-xl border border-[#D5C9B8]">
            <span className="text-[10px] font-bold text-[#C97D52] uppercase mr-1 flex items-center gap-1">
              <TableIcon className="w-3 h-3" /> Table
            </span>

            {/* Column actions */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] text-[10px] font-semibold shadow-xs cursor-pointer"
              title="Add Column Before"
            >
              + Col Left
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] text-[10px] font-semibold shadow-xs cursor-pointer"
              title="Add Column After"
            >
              + Col Right
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-1.5 py-0.5 rounded bg-[#FBEBE8] text-[#BA4E3E] text-[10px] font-semibold shadow-xs cursor-pointer"
              title="Delete Column"
            >
              Del Col
            </button>

            <span className="text-[#D5C9B8]">|</span>

            {/* Row actions */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] text-[10px] font-semibold shadow-xs cursor-pointer"
              title="Add Row Above"
            >
              + Row Up
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] text-[10px] font-semibold shadow-xs cursor-pointer"
              title="Add Row Below"
            >
              + Row Down
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-1.5 py-0.5 rounded bg-[#FBEBE8] text-[#BA4E3E] text-[10px] font-semibold shadow-xs cursor-pointer"
              title="Delete Row"
            >
              Del Row
            </button>

            <span className="text-[#D5C9B8]">|</span>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-1.5 py-0.5 rounded bg-[#BA4E3E] text-white hover:bg-[#A33E30] text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
              title="Delete Entire Table"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 6. Block Quotes, Code Blocks & Dividers */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleBlockquote}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Quote Block (Ctrl+Shift+B)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("codeBlock")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Code Block"
        >
          <Code2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] cursor-pointer transition-colors"
          title="Divider Line (---)"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Image Insert Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsImageModalOpen(true)}
          className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] hover:text-[#C97D52] cursor-pointer transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 7. Alignment (Left, Center, Right, Justify) */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive({ textAlign: "left" })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive({ textAlign: "center" })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive({ textAlign: "right" })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Justify Text"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 8. Hyperlinks */}
      <div className="flex items-center gap-0.5 relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleOpenLinkModal}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            editor.isActive("link")
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Add / Edit Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#BA4E3E] cursor-pointer transition-colors"
            title="Remove Link"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Inline Link Modal Popover */}
        {isLinkModalOpen && (
          <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-xl p-2.5 flex items-center gap-1.5 shadow-xl w-64 animate-in fade-in zoom-in-95">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="flex-1 bg-[#FFFFFF] border border-[#D5C9B8] px-2 py-1 text-xs rounded-lg text-[#2D251E] placeholder-[#9C8E80] focus:outline-none focus:border-[#C97D52]"
            />
            <button
              type="button"
              onClick={handleSetLink}
              className="p-1 rounded-lg tactile-btn-copper text-white cursor-pointer"
              title="Apply link"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="p-1 rounded-lg text-[#74675B] hover:bg-[#EFE8DE] cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

      {/* 9. Utility: Clear Formatting */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] cursor-pointer transition-colors shrink-0"
        title="Clear Formatting"
      >
        <RemoveFormatting className="w-3.5 h-3.5" />
      </button>

      {/* 10. Keyboard Shortcuts Modal Trigger */}
      <div className="ml-auto shrink-0 pl-1">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsShortcutsOpen(true)}
          className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#9C8E80] hover:text-[#C97D52] cursor-pointer transition-colors"
          title="Keyboard Shortcuts & Syntax Reference"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal 1: Custom Table Creator (Never clipped by screen) */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="Insert Custom Table"
        subtitle="Choose grid dimensions and formatting options"
        icon={
          <div className="w-9 h-9 rounded-xl tactile-avatar-ring flex items-center justify-center text-white">
            <TableIcon className="w-4 h-4" />
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {/* Interactive Visual Grid Selector */}
          <div>
            <label className="block text-xs font-bold text-[#74675B] uppercase mb-1.5">
              Select Grid: {hoverGrid.r} × {hoverGrid.c}
            </label>
            <div className="p-3 rounded-xl bg-white border border-[#D5C9B8] tactile-inset inline-block">
              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: 6 }).map((_, r) =>
                  Array.from({ length: 6 }).map((_, c) => {
                    const isHighlighted = r < hoverGrid.r && c < hoverGrid.c;
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() => {
                          setHoverGrid({ r: r + 1, c: c + 1 });
                          setTableRows(r + 1);
                          setTableCols(c + 1);
                        }}
                        className={`w-6 h-6 rounded-md border transition-colors cursor-pointer ${
                          isHighlighted
                            ? "bg-[#F7EBE4] border-[#C97D52]"
                            : "bg-[#FAF7F2] border-[#E2D9CC]"
                        }`}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Number Inputs for Exact Rows & Columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#74675B] mb-1">
                Number of Rows
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-[#D5C9B8] rounded-xl px-3 py-2 text-xs font-bold text-[#2D251E] focus:outline-none focus:border-[#C97D52]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#74675B] mb-1">
                Number of Columns
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-[#D5C9B8] rounded-xl px-3 py-2 text-xs font-bold text-[#2D251E] focus:outline-none focus:border-[#C97D52]"
              />
            </div>
          </div>

          {/* Header Row Option */}
          <label className="flex items-center gap-2 text-xs font-semibold text-[#2D251E] cursor-pointer">
            <input
              type="checkbox"
              checked={withHeaderRow}
              onChange={(e) => setWithHeaderRow(e.target.checked)}
              className="accent-[#C97D52] w-4 h-4 rounded"
            />
            <span>Include Styled Sand Header Row</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D5C9B8]">
            <button
              type="button"
              onClick={() => setIsTableModalOpen(false)}
              className="py-2 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmInsertTable}
              className="py-2 px-5 rounded-xl text-xs font-bold tactile-btn-copper cursor-pointer"
            >
              Insert Table
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Image URL Embed */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Insert Image"
        subtitle="Paste an image URL to embed it with tactile framing"
        icon={
          <div className="w-9 h-9 rounded-xl tactile-avatar-ring flex items-center justify-center text-white">
            <ImageIcon className="w-4 h-4" />
          </div>
        }
      >
        <form onSubmit={handleInsertImage} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#74675B] mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              autoFocus
              className="w-full bg-white border border-[#D5C9B8] rounded-xl px-3 py-2 text-xs text-[#2D251E] placeholder-[#9C8E80] focus:outline-none focus:border-[#C97D52]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#74675B] mb-1">
              Alt Caption Text (Optional)
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Descriptive caption"
              className="w-full bg-white border border-[#D5C9B8] rounded-xl px-3 py-2 text-xs text-[#2D251E] placeholder-[#9C8E80] focus:outline-none focus:border-[#C97D52]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D5C9B8]">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="py-2 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl text-xs font-bold tactile-btn-copper cursor-pointer"
            >
              Embed Image
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Keyboard Shortcuts Dialog */}
      <Modal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        title="Editor Shortcuts & Syntax"
        subtitle="Quick reference for fast tactile editing"
        icon={
          <div className="w-9 h-9 rounded-xl tactile-avatar-ring flex items-center justify-center text-white">
            <HelpCircle className="w-4 h-4" />
          </div>
        }
      >
        <div className="space-y-2 text-xs text-[#2D251E] max-h-80 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Bold</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                Ctrl + B
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Italic</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                Ctrl + I
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Underline</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                Ctrl + U
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Strikethrough</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                Ctrl + Shift + S
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Heading 1</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                # + Space
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Heading 2</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                ## + Space
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Bullet List</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                - + Space
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Numbered List</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                1. + Space
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Task Checklist</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                [] + Space
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Quote Block</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                &gt; + Space
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Divider Line</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                --- + Enter
              </kbd>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex justify-between items-center">
              <span className="font-medium">Inline Code</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DE] font-mono text-[10px] text-[#74675B]">
                `code`
              </kbd>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D5C9B8] flex justify-end">
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(false)}
            className="py-1.5 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
          >
            Got It
          </button>
        </div>
      </Modal>
    </div>
  );
}
