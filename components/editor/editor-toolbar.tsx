"use client";

import React from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
  Pilcrow,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  if (!editor || readOnly) return null;

  return (
    <div className="h-12 border-b border-[#D5C9B8] bg-[#FAF7F2] px-4 flex items-center gap-1 overflow-x-auto select-none">
      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="w-8 h-8 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] disabled:opacity-40 cursor-pointer transition-colors"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="w-8 h-8 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] disabled:opacity-40 cursor-pointer transition-colors"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1.5" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("paragraph")
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Normal text"
      >
        <Pilcrow className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("heading", { level: 1 })
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("heading", { level: 2 })
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1.5" />

      {/* Formatting Marks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("bold")
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("italic")
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("underline")
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-[#D5C9B8] mx-1.5" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("bulletList")
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          editor.isActive("orderedList")
            ? "bg-[#FFFFFF] text-[#C97D52] border border-[#C97D52]/40 tactile-elevation-1"
            : "text-[#74675B] hover:bg-[#EFE8DE]"
        }`}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
}

