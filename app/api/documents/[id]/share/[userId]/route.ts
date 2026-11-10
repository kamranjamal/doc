import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { DocumentShareModel } from "@/models/DocumentShare";

interface RouteParams {
  params: Promise<{ id: string; userId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, userId } = await params;
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
        { error: "Only the document owner can revoke access." },
        { status: 403 }
      );
    }

    if (userId === user._id.toString()) {
      return NextResponse.json(
        { error: "Owner cannot revoke their own access." },
        { status: 400 }
      );
    }

    const deleted = await DocumentShareModel.findOneAndDelete({
      documentId: doc._id,
      userId,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Share record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Access successfully revoked.",
      userId,
    });
  } catch (error: unknown) {
    console.error("Revoke access error:", error);
    return NextResponse.json(
      { error: "Failed to revoke access" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, userId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { permission } = body;

    if (!permission || !["EDIT", "COMMENT", "VIEW"].includes(permission)) {
      return NextResponse.json(
        { error: "Invalid permission: must be EDIT, COMMENT, or VIEW" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Only the document owner can modify permissions." },
        { status: 403 }
      );
    }

    const updated = await DocumentShareModel.findOneAndUpdate(
      { documentId: doc._id, userId },
      { permission },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Share record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Updated permission to ${permission}`,
      share: {
        id: updated._id.toString(),
        permission: updated.permission,
      },
    });
  } catch (error: unknown) {
    console.error("Update permission error:", error);
    return NextResponse.json(
      { error: "Failed to update permission" },
      { status: 500 }
    );
  }
}


