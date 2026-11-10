import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DocumentModel } from "@/models/Document";
import { DocumentShareModel } from "@/models/DocumentShare";
import { DocumentVersionModel } from "@/models/DocumentVersion";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verify access
    const userIdStr = user._id.toString();
    const isOwner = doc.owner.toString() === userIdStr;
    if (!isOwner) {
      const share = await DocumentShareModel.findOne({
        documentId: doc._id,
        userId: user._id,
      });
      if (!share) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const versions = await DocumentVersionModel.find({ documentId: doc._id })
      .sort({ versionNumber: -1 })
      .limit(20);

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Fetch versions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verify access
    const userIdStr = user._id.toString();
    const isOwner = doc.owner.toString() === userIdStr;
    if (!isOwner) {
      const share = await DocumentShareModel.findOne({
        documentId: doc._id,
        userId: user._id,
      });
      if (!share || share.permission === "VIEW") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json();
    const changeSummary = body.changeSummary || "Manual snapshot";

    const lastVersion = await DocumentVersionModel.findOne({ documentId: doc._id })
      .sort({ versionNumber: -1 });
    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Word count calculation
    const textContent = JSON.stringify(doc.content);
    const wordCount = textContent.split(/\s+/).length;

    const newVersion = await DocumentVersionModel.create({
      documentId: doc._id,
      versionNumber,
      title: doc.title,
      content: doc.content,
      authorName: user.name,
      authorEmail: user.email,
      changeSummary,
      wordCount,
    });

    return NextResponse.json({ version: newVersion }, { status: 201 });
  } catch (error) {
    console.error("Create version error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
