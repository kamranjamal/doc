"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthView } from "@/components/auth/auth-view";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardView } from "@/components/documents/dashboard-view";
import { DocumentEditor } from "@/components/editor/document-editor";
import { DocumentItem } from "@/components/documents/document-card";
import { FileText, Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center font-['Poppins',sans-serif]">
        <div className="w-12 h-12 rounded-2xl tactile-avatar-ring flex items-center justify-center animate-pulse mb-4 shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-bold text-[#74675B] animate-pulse">
          Connecting to MongoDB & loading workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (activeDocumentId) {
    return (
      <DocumentEditor
        documentId={activeDocumentId}
        onBack={() => setActiveDocumentId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#2D251E] flex flex-col font-['Poppins',sans-serif]">
      <AppHeader />
      <DashboardView
        onOpenDocument={(doc: DocumentItem) => setActiveDocumentId(doc.id)}
      />
    </div>
  );
}
