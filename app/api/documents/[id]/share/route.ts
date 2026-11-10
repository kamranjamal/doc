import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { DocumentShareModel } from "@/models/DocumentShare";
import { User } from "@/models/User";

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

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the document owner can view the share list." },
        { status: 403 }
      );
    }

    const shares = await DocumentShareModel.find({ documentId: doc._id }).populate(
      "userId",
      "name email avatar"
    );

    return NextResponse.json({
      documentTitle: doc.title,
      owner: {
        id: ownerObj._id ? ownerObj._id.toString() : ownerObj.toString(),
        name: ownerObj.name || "Unknown",
        email: ownerObj.email || "",
        avatar: ownerObj.avatar || "",
      },
      shares: shares.map((s: any) => ({
        id: s._id.toString(),
        userId: s.userId._id.toString(),
        name: s.userId.name,
        email: s.userId.email,
        avatar: s.userId.avatar,
        permission: s.permission,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: unknown) {
    console.error("Get shares error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document shares" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, permission = "EDIT" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid recipient email is required" },
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
        { error: "Only the document owner can share this document." },
        { status: 403 }
      );
    }

    const recipient = await User.findOne({ email: email.toLowerCase().trim() });
    if (!recipient) {
      return NextResponse.json(
        { error: "User with this email not found." },
        { status: 404 }
      );
    }

    if (recipient._id.toString() === user._id.toString()) {
      return NextResponse.json(
        { error: "You cannot share a document with yourself." },
        { status: 400 }
      );
    }

    const existingShare = await DocumentShareModel.findOne({
      documentId: doc._id,
      userId: recipient._id,
    });

    if (existingShare) {
      return NextResponse.json(
        { error: "Document is already shared with this user." },
        { status: 409 }
      );
    }

    const newShare = await DocumentShareModel.create({
      documentId: doc._id,
      userId: recipient._id,
      permission,
    });

    return NextResponse.json(
      {
        share: {
          id: newShare._id.toString(),
          userId: recipient._id.toString(),
          name: recipient.name,
          email: recipient.email,
          avatar: recipient.avatar,
          permission: newShare.permission,
          createdAt: newShare.createdAt,
        },
        message: `Successfully shared with ${recipient.name}`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Grant share error:", error);
    return NextResponse.json(
      { error: "Failed to grant share access" },
      { status: 500 }
    );
  }
}
