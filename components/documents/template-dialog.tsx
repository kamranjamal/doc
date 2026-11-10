"use client";

import React from "react";
import { WORKSPACE_TEMPLATES, DocumentTemplate } from "@/lib/templates";
import {
  FileText,
  Sparkles,
  Users,
  ShieldCheck,
  X,
  ArrowRight,
  Layers,
} from "lucide-react";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
  isCreating: boolean;
}

export function TemplateDialog({
  isOpen,
  onClose,
  onSelectTemplate,
  isCreating,
}: TemplateDialogProps) {
  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-[#C97D52]" />;
      case "Users":
        return <Users className="w-5 h-5 text-[#4E9A68]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-[#8C4F2A]" />;
      default:
        return <FileText className="w-5 h-5 text-[#C97D52]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 font-['Poppins',sans-serif]">
      <div className="w-full max-w-2xl bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-6 sm:p-8 relative select-none">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#D5C9B8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl tactile-avatar-ring flex items-center justify-center text-white shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#2D251E]">
                Choose a Workspace Template
              </h2>
              <p className="text-xs text-[#74675B] mt-0.5">
                Kickstart your team documentation with pre-structured Tiptap formats.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EFE8DE] flex items-center justify-center text-[#74675B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 max-h-[460px] overflow-y-auto pr-1">
          {WORKSPACE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              disabled={isCreating}
              onClick={() => onSelectTemplate(tmpl)}
              className="p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#E2D9CC] hover:border-[#C97D52] tactile-elevation-1 hover:tactile-elevation-2 transition-all text-left flex flex-col justify-between group cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#D5C9B8] flex items-center justify-center group-hover:border-[#C97D52] transition-colors">
                    {getIcon(tmpl.iconName)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C8E80] font-mono">
                    Template
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-[#2D251E] group-hover:text-[#C97D52] transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-[11px] text-[#74675B] mt-1 leading-snug">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFE8DE] mt-3 flex items-center justify-between text-[11px] text-[#C97D52] font-bold">
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#D5C9B8] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

