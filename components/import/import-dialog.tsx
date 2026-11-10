"use client";

import React, { useState, useRef } from "react";
import { DocumentItem } from "../documents/document-card";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
}

export function ImportDialog({ isOpen, onClose, onSuccess }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt" && ext !== "md") {
      setError("Unsupported format. Only .txt and .md files are supported.");
      return;
    }
    if (selectedFile.size > 1024 * 1024) {
      setError("File exceeds the 1MB size limit.");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to import document");
      } else {
        onSuccess(data.document);
        onClose();
      }
    } catch {
      setError("Network error occurred during import.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF7F2] border-2 border-[#D5C9B8] tactile-elevation-3 rounded-2xl p-6 sm:p-7 relative select-none">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#D5C9B8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl tactile-avatar-ring flex items-center justify-center text-white shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#2D251E]">
                Import Document
              </h2>
              <p className="text-xs text-[#74675B] mt-0.5">
                Upload Markdown (.md) or Plain Text (.txt)
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

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#FBEBE8] border border-[#E5877A] text-[#BA4E3E] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Drop Zone with Tactile Debossed Channel */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 p-6 rounded-2xl text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? "bg-[#FAF7F2] border-[#C97D52] shadow-lg shadow-[#C97D52]/10"
              : "tactile-inset border-[#D5C9B8] hover:border-[#C97D52]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndSetFile(e.target.files[0]);
              }
            }}
            accept=".txt,.md"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full tactile-avatar-ring mx-auto flex items-center justify-center text-white mb-3 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>

          {file ? (
            <div>
              <div className="text-xs font-bold text-[#2D251E] flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4E9A68]" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
              <p className="text-[11px] text-[#74675B] font-mono mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#2D251E]">
                Click or drag & drop file here
              </p>
              <p className="text-[11px] text-[#74675B] mt-1">
                Supports <strong className="text-[#C97D52]">.txt</strong> and{" "}
                <strong className="text-[#C97D52]">.md</strong> up to 1 MB
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-3 border-t border-[#D5C9B8] flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-bold tactile-btn-secondary cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="py-2.5 px-5 rounded-xl text-xs font-bold tactile-btn-copper flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <span>Import File</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

