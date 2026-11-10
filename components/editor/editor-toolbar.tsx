"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor || readOnly) return null;

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

    // Smart togglers that seamlessly switch between list types
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
        <div className="editor-toolbar-container border-b border-[#D5C9B8] bg-[#FAF7F2] px-3 py-1.5 flex items-center gap-1 overflow-x-auto select-none font-['Poppins',sans-serif] scrollbar-thin">
          {/* 1. History Controls */}
          <div className="flex items-center gap-0.5">
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
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("paragraph")
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("heading", { level: 1 })
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("heading", { level: 2 })
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("heading", { level: 3 })
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

          {/* 3. Core Character Formatting */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("bold")
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("italic")
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("underline")
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("strike")
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
              onClick={() => editor.chain().focus().toggleHighlight({ color: "#F8DFCE" }).run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("highlight")
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Highlight Text"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("code")
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
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleToggleBulletList}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("bulletList")
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("orderedList")
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("taskList")
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Task Checklist"
            >
              <ListTodo className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

          {/* 5. Block Quotes, Code Blocks & Dividers */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleToggleBlockquote}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("blockquote")
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Quote Block (Press Enter twice to exit)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("codeBlock")
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
          </div>

          <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

          {/* 6. Alignment (Left, Center, Right, Justify) */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive({ textAlign: "left" })
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive({ textAlign: "center" })
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive({ textAlign: "right" })
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive({ textAlign: "justify" })
                  ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
                  : "text-[#74675B] hover:bg-[#EFE8DE]"
                }`}
              title="Justify Text"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1 shrink-0" />

          {/* 7. Hyperlinks */}
          <div className="flex items-center gap-0.5 relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleOpenLinkModal}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${editor.isActive("link")
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

          {/* 8. Utility: Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="w-7 h-7 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] cursor-pointer transition-colors"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
        );
}
