import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { DocumentShareModel } from "@/models/DocumentShare";
import "@/models/User"; // Ensure User model is registered for populate

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch owned documents sorted by isPinned (desc) then updatedAt (desc)
    const ownedDocs = await DocumentModel.find({ owner: user._id })
      .sort({ isPinned: -1, updatedAt: -1 })
      .populate("owner", "name email avatar");

    // 2. Fetch shared documents via DocumentShare
    const shares = await DocumentShareModel.find({ userId: user._id });
    const sharedDocIds = shares.map((s) => s.documentId);

    const sharedDocs = await DocumentModel.find({
      _id: { $in: sharedDocIds },
    })
      .sort({ updatedAt: -1 })
      .populate("owner", "name email avatar");

    const formatDoc = (doc: any, isOwner: boolean, permission: string = "EDIT") => ({
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      isOwner,
      isPinned: !!doc.isPinned,
      permission,
      owner: doc.owner
        ? {
            id: doc.owner._id ? doc.owner._id.toString() : doc.owner.toString(),
            name: doc.owner.name || "Unknown",
            email: doc.owner.email || "",
            avatar: doc.owner.avatar || "",
          }
        : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    const owned = ownedDocs.map((doc) => formatDoc(doc, true, "EDIT"));
    const shared = sharedDocs.map((doc) => {
      const shareRecord = shares.find(
        (s) => s.documentId.toString() === doc._id.toString()
      );
      return formatDoc(doc, false, shareRecord?.permission || "EDIT");
    });

    return NextResponse.json({
      owned,
      shared,
      all: [...owned, ...shared].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    });
  } catch (error: unknown) {
    console.error("List documents error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const title = typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "Untitled document";

    const content = body.content || {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    };

    await connectToDatabase();

    const newDoc = await DocumentModel.create({
      title,
      content,
      owner: user._id,
      isPinned: false,
    });

    return NextResponse.json(
      {
        document: {
          id: newDoc._id.toString(),
          title: newDoc.title,
          content: newDoc.content,
          isOwner: true,
          isPinned: false,
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
        message: "Document created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create document error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
