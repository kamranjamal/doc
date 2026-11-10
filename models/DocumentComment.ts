import mongoose, { Schema, Document as MongooseDocument, Model, Types } from "mongoose";

export interface IDocumentComment extends MongooseDocument {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  text: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentCommentSchema = new Schema<IDocumentComment>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isResolved: {
      type: Boolean,
      default: false,
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

DocumentCommentSchema.index({ documentId: 1, createdAt: -1 });

export const DocumentCommentModel: Model<IDocumentComment> =
  mongoose.models.DocumentComment ||
  mongoose.model<IDocumentComment>("DocumentComment", DocumentCommentSchema);
