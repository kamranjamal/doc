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
  Plus,
  Trash2,
  Columns3,
  Rows3,
  ChevronDown,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

const TEXT_COLORS = [
  { label: "Default Ink", value: "#2D251E" },
  { label: "Burnished Copper", value: "#C97D52" },
  { label: "Forest Green", value: "#4E9A68" },
  { label: "Crimson Red", value: "#BA4E3E" },
  { label: "Golden Amber", value: "#D48B38" },
  { label: "Slate Blue", value: "#3B6E8C" },
];

const HIGHLIGHT_COLORS = [
  { label: "Copper Glow", value: "#F8DFCE" },
  { label: "Mint Glow", value: "#E2F4E8" },
  { label: "Sunshine Glow", value: "#FEF3D6" },
  { label: "Rose Glow", value: "#FCE8E6" },
];

export function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  // Popover States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const tableMenuRef = useRef<HTMLDivElement | null>(null);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);
  const highlightMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (tableMenuRef.current && !tableMenuRef.current.contains(target)) {
        setIsTableMenuOpen(false);
      }
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
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
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
    <div className="editor-toolbar-container border-b border-[#D5C9B8] bg-[#FAF7F2] px-3 py-1.5 flex items-center gap-1 overflow-x-auto select-none font-['Poppins',sans-serif] scrollbar-thin relative z-30">
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

        {/* Subscript & Superscript */}
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
            onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
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
            <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-xl p-2 shadow-xl w-44 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-bold text-[#74675B] uppercase mb-1.5 px-1">
                Text Color
              </p>
              <div className="grid grid-cols-3 gap-1.5">
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
                      className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: col.value }}
                    />
                    <span className="text-[9px] text-[#74675B] truncate max-w-[42px]">
                      {col.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative" ref={highlightMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsHighlightMenuOpen(!isHighlightMenuOpen)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              editor.isActive("highlight")
                ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                : "text-[#74675B] hover:bg-[#EFE8DE]"
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          {isHighlightMenuOpen && (
            <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-xl p-2 shadow-xl w-44 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-bold text-[#74675B] uppercase mb-1.5 px-1">
                Highlight
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
                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#FFFFFF] border border-transparent hover:border-[#D5C9B8] cursor-pointer"
                  >
                    <span
                      className="w-4 h-4 rounded-md border border-black/10"
                      style={{ backgroundColor: col.value }}
                    />
                    <span className="text-[10px] font-medium text-[#2D251E]">
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
                className="w-full mt-2 text-[10px] font-bold text-[#BA4E3E] hover:bg-[#FBEBE8] p-1 rounded-lg text-center cursor-pointer"
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

      {/* 5. Interactive Neo-Skeuomorphic Table Suite */}
      <div className="relative shrink-0" ref={tableMenuRef}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
          className={`px-2 h-7 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            isInTable
              ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1 font-bold"
              : "text-[#74675B] hover:bg-[#EFE8DE]"
          }`}
          title="Tables & Grid System"
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold hidden md:inline">Table</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isTableMenuOpen && (
          <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-2.5 shadow-2xl w-60 animate-in fade-in zoom-in-95 font-['Poppins',sans-serif]">
            <p className="text-[11px] font-bold text-[#74675B] uppercase tracking-wider px-1 mb-2">
              Tactile Table Tools
            </p>

            {!isInTable ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run();
                    setIsTableMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#FFFFFF] border border-transparent hover:border-[#D5C9B8] flex items-center justify-between text-xs font-semibold text-[#2D251E] cursor-pointer"
                >
                  <span>Insert 3 × 3 Table</span>
                  <span className="text-[10px] text-[#9C8E80]">Compact</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 4, cols: 4, withHeaderRow: true })
                      .run();
                    setIsTableMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#FFFFFF] border border-transparent hover:border-[#D5C9B8] flex items-center justify-between text-xs font-semibold text-[#2D251E] cursor-pointer"
                >
                  <span>Insert 4 × 4 Table</span>
                  <span className="text-[10px] text-[#9C8E80]">Standard</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                {/* Column controls */}
                <div className="p-1 rounded-xl bg-[#EFE8DE] flex items-center justify-between text-[11px] font-bold text-[#74675B]">
                  <span>Columns</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().addColumnBefore().run()}
                      className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] shadow-xs cursor-pointer"
                      title="Add Column Left"
                    >
                      + Left
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] shadow-xs cursor-pointer"
                      title="Add Column Right"
                    >
                      + Right
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      className="px-1.5 py-0.5 rounded bg-[#FBEBE8] text-[#BA4E3E] hover:bg-red-100 shadow-xs cursor-pointer"
                      title="Delete Column"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Row controls */}
                <div className="p-1 rounded-xl bg-[#EFE8DE] flex items-center justify-between text-[11px] font-bold text-[#74675B]">
                  <span>Rows</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().addRowBefore().run()}
                      className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] shadow-xs cursor-pointer"
                      title="Add Row Above"
                    >
                      + Above
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      className="px-1.5 py-0.5 rounded bg-white hover:text-[#C97D52] shadow-xs cursor-pointer"
                      title="Add Row Below"
                    >
                      + Below
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      className="px-1.5 py-0.5 rounded bg-[#FBEBE8] text-[#BA4E3E] hover:bg-red-100 shadow-xs cursor-pointer"
                      title="Delete Row"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Header Toggle */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white text-[11px] font-medium text-[#2D251E] cursor-pointer"
                >
                  Toggle Header Row
                </button>

                {/* Delete Entire Table */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setIsTableMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg bg-[#FBEBE8] text-[#BA4E3E] hover:bg-red-100 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Table</span>
                </button>
              </div>
            )}
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
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsImageModalOpen(!isImageModalOpen)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isImageModalOpen
                ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                : "text-[#74675B] hover:bg-[#EFE8DE]"
            }`}
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {isImageModalOpen && (
            <div className="absolute top-9 left-0 z-50 bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-xl p-3 shadow-xl w-72 animate-in fade-in zoom-in-95">
              <p className="text-[11px] font-bold text-[#74675B] uppercase mb-2">
                Insert Image URL
              </p>
              <form onSubmit={handleInsertImage} className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  autoFocus
                  className="w-full bg-[#FFFFFF] border border-[#D5C9B8] px-2.5 py-1.5 text-xs rounded-lg text-[#2D251E] placeholder-[#9C8E80] focus:outline-none focus:border-[#C97D52]"
                />
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Alt caption text"
                  className="w-full bg-[#FFFFFF] border border-[#D5C9B8] px-2.5 py-1.5 text-xs rounded-lg text-[#2D251E] placeholder-[#9C8E80] focus:outline-none focus:border-[#C97D52]"
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#74675B] hover:bg-[#EFE8DE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg text-xs font-bold tactile-btn-copper cursor-pointer"
                  >
                    Insert Image
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
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

      {/* Keyboard Shortcuts Dialog */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5C9B8]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#C97D52]" />
                <h3 className="text-sm font-extrabold text-[#2D251E]">
                  Editor Shortcuts & Markdown Syntax
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#EFE8DE] text-[#74675B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#2D251E] max-h-80 overflow-y-auto pr-1">
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

            <div className="mt-5 pt-3 border-t border-[#D5C9B8] flex justify-end">
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="py-1.5 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
