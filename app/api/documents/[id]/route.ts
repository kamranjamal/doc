import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { DocumentShareModel } from "@/models/DocumentShare";
import "@/models/User";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(id).populate("owner", "name email avatar");
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const ownerObj = doc.owner as any;
    const isOwner = (ownerObj._id ? ownerObj._id.toString() : ownerObj.toString()) === user._id.toString();

    let shareRecord = null;
    if (!isOwner) {
      shareRecord = await DocumentShareModel.findOne({
        documentId: doc._id,
        userId: user._id,
      });

      if (!shareRecord) {
        return NextResponse.json(
          { error: "Access denied. You do not have permission to view this document." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      document: {
        id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        isOwner,
        permission: isOwner ? "EDIT" : shareRecord?.permission || "EDIT",
        owner: {
          id: ownerObj._id ? ownerObj._id.toString() : ownerObj.toString(),
          name: ownerObj.name || "Unknown",
          email: ownerObj.email || "",
          avatar: ownerObj.avatar || "",
        },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Get document error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    await connectToDatabase();

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isOwner = doc.owner.toString() === user._id.toString();

    let shareRecord = null;
    if (!isOwner) {
      shareRecord = await DocumentShareModel.findOne({
        documentId: doc._id,
        userId: user._id,
      });

      if (!shareRecord || shareRecord.permission !== "EDIT") {
        return NextResponse.json(
          { error: "Access denied. You cannot edit this document." },
          { status: 403 }
        );
      }
    }

    // Only owner can rename the document
    if (typeof title === "string") {
      if (!isOwner) {
        return NextResponse.json(
          { error: "Only the document owner can rename this document." },
          { status: 403 }
        );
      }
      doc.title = title.trim() || "Untitled document";
    }

    // Owner or shared editor can update content
    if (content !== undefined) {
      doc.content = content;
    }

    doc.updatedAt = new Date();
    await doc.save();

    return NextResponse.json({
      document: {
        id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        isOwner,
        permission: isOwner ? "EDIT" : shareRecord?.permission || "EDIT",
        updatedAt: doc.updatedAt,
      },
      message: "Document updated successfully",
    });
  } catch (error: unknown) {
    console.error("Update document error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Only the document owner can delete this document." },
        { status: 403 }
      );
    }

    await DocumentModel.findByIdAndDelete(id);
    await DocumentShareModel.deleteMany({ documentId: id });

    return NextResponse.json({
      message: "Document deleted successfully",
      id,
    });
  } catch (error: unknown) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
