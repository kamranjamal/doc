import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DocumentModel } from "@/models/Document";
import { DocumentShareModel } from "@/models/DocumentShare";
import { DocumentCommentModel } from "@/models/DocumentComment";

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

    const comments = await DocumentCommentModel.find({ documentId: doc._id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
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

    // Verify access (Viewers cannot comment, but Owner, Editor, Commenter can)
    const userIdStr = user._id.toString();
    const isOwner = doc.owner.toString() === userIdStr;
    if (!isOwner) {
      const share = await DocumentShareModel.findOne({
        documentId: doc._id,
        userId: user._id,
      });
      if (!share || share.permission === "VIEW") {
        return NextResponse.json(
          { error: "Read-only viewers cannot post comments" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const comment = await DocumentCommentModel.create({
      documentId: doc._id,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      text,
      isResolved: false,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await req.json();
    const { commentId, isResolved } = body;
    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    const comment = await DocumentCommentModel.findOne({
      _id: commentId,
      documentId: doc._id,
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    comment.isResolved = Boolean(isResolved);
    await comment.save();

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
