import mongoose, { Schema, Document as MongooseDocument, Model, Types } from "mongoose";

export interface IDocumentShare extends MongooseDocument {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  permission: "EDIT" | "COMMENT" | "VIEW";
  createdAt: Date;
  updatedAt: Date;
}

const DocumentShareSchema = new Schema<IDocumentShare>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    permission: {
      type: String,
      enum: ["EDIT", "COMMENT", "VIEW"],
      default: "EDIT",
    },
  },
  {
    timestamps: true,
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

// Compound unique index ensuring no duplicate shares
DocumentShareSchema.index({ documentId: 1, userId: 1 }, { unique: true });

// In development, ensure schema updates (e.g. enum additions) are reflected
if (process.env.NODE_ENV === "development" && mongoose.models.DocumentShare) {
  delete (mongoose.models as Record<string, unknown>).DocumentShare;
}

export const DocumentShareModel: Model<IDocumentShare> =
  mongoose.models.DocumentShare ||
  mongoose.model<IDocumentShare>("DocumentShare", DocumentShareSchema);

