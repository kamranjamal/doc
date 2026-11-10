import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();

    if (extension !== "txt" && extension !== "md") {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .txt or .md file." },
        { status: 400 }
      );
    }

    // Max 1MB limit
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 1MB size limit." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const title = filename.replace(/\.(txt|md)$/i, "").trim() || "Imported document";

    // Split text into paragraphs for structured Tiptap JSON
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
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
      }
      return {
        type: "paragraph",
        content: [{ type: "text", text: line }],
      };
    });

    const content = {
      type: "doc",
      content: contentNodes.length > 0 ? contentNodes : [{ type: "paragraph" }],
    };

    await connectToDatabase();

    const newDoc = await DocumentModel.create({
      title,
      content,
      owner: user._id,
    });

    return NextResponse.json(
      {
        document: {
          id: newDoc._id.toString(),
          title: newDoc.title,
          content: newDoc.content,
          isOwner: true,
          permission: "EDIT",
          owner: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
          createdAt: newDoc.createdAt,
          updatedAt: newDoc.updatedAt,
        },
        message: "File imported successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import file" },
      { status: 500 }
    );
  }
}

