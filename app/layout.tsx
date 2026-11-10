import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Draftly — Team Document Workspace",
  description: "Your team's documents, without the clutter. Powered by Next.js and MongoDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0B0D12] text-[#F3F5F8]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
