import mongoose, {Document as MongoDocument, Schema} from "mongoose";

export interface IDocument extends MongoDocument {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    filename: string;
    originalName: string;
    s3Key: string;
    s3Bucket: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    extractedText?: string;
    tags: string[];
    category?: string;
    folderId?: mongoose.Types.ObjectId;
    versions: Array<{
        versionId: string;
        s3Key: string;
        uploadedAt: Date;
    }>;
    sharedLinks: Array<{
        token: string;
        expiresAt: Date;
        permissions: "view" | "download";
    }>;
}

const documentSchema = new Schema<IDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        filename: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        s3Key: {
            type: String,
            required: true,
            unique: true,
        },
        s3Bucket: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        extractedText: {
            type: String,
        },
        tags: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
        },
        folderId: {
            type: Schema.Types.ObjectId,
            ref: "Folder",
        },
        versions: [
            {
                versionId: String,
                s3Key: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        sharedLinks: [
            {
                token: String,
                expiresAt: Date,
                permissions: {
                    type: String,
                    enum: ["view", "download"],
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

// Index for full-text search
documentSchema.index({
    extractedText: "text",
    filename: "text",
    originalName: "text",
});

documentSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

documentSchema.set("toJSON", {virtuals: true});
documentSchema.set("toObject", {virtuals: true});

export default mongoose.model<IDocument>("Document", documentSchema);
