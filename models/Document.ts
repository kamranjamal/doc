import mongoose, { Schema, Document as MongooseDocument, Model, Types } from "mongoose";

export interface IDocument extends MongooseDocument {
  title: string;
  content: Record<string, unknown>;
  owner: Types.ObjectId;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      default: "Untitled document",
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: Schema.Types.Mixed,
      default: defaultContent,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
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

// Index for searching and sorting
DocumentSchema.index({ owner: 1, isPinned: -1, updatedAt: -1 });

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
