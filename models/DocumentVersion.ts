import mongoose, { Schema, Document as MongooseDocument, Model, Types } from "mongoose";

export interface IDocumentVersion extends MongooseDocument {
  documentId: Types.ObjectId;
  versionNumber: number;
  title: string;
  content: any;
  authorName: string;
  authorEmail: string;
  changeSummary: string;
  wordCount: number;
  createdAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    authorName: {
      type: String,
      default: "Workspace Collaborator",
    },
    authorEmail: {
      type: String,
      default: "user@draftly.demo",
    },
    changeSummary: {
      type: String,
      default: "Snapshot update",
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        const record = ret as unknown as Record<string, unknown>;
        if (record._id) {
          record.id = record._id.toString();
        }
        delete record._id;
        delete record.__v;
        return record;
      },
    },
  }
);

DocumentVersionSchema.index({ documentId: 1, versionNumber: -1 });

export const DocumentVersionModel: Model<IDocumentVersion> =
  mongoose.models.DocumentVersion ||
  mongoose.model<IDocumentVersion>("DocumentVersion", DocumentVersionSchema);
