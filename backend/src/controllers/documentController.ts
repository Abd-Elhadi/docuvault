import {Response} from "express";
import {AuthRequest} from "../middleware/auth.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import {
    uploadToS3,
    getPresignedUrl,
    deleteFromS3,
} from "../services/s3service.js";
import {triggerTextExtraction} from "../services/lambdaService.js";

export const uploadDocument = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({message: "No file provided"});
            return;
        }

        const userId = req.userId as string;

        const {key, bucket} = await uploadToS3(req.file, userId);

        const document = await Document.create({
            userId,
            filename: req.file.originalname,
            originalName: req.file.originalname,
            s3Key: key,
            s3Bucket: bucket,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
        });

        await User.findByIdAndUpdate(userId, {
            $inc: {storageUsed: req.file.size},
        });

        res.status(200).json({
            message: "Document uploaded successfully",
            document: {
                id: document._id,
                filename: document.filename,
                filesize: document.fileSize,
                mimetype: document.mimeType,
                uploadedAt: document.uploadedAt,
            },
        });
    } catch (err) {
        console.error("Uplad error: ", err);
        res.status(500).json({message: "Failed to upload document"});
    }
};

export const getDocuments = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const userId = req.userId as string;
        const {page = 1, limit = 20, search} = req.query;

        const query: any = {userId};
        if (search) {
            query.$or = [
                {filename: {$regex: search, $options: "i"}},
                {originalName: {$regex: search, $options: "i"}},
            ];
        }

        const documents = await Document.find(query)
            .sort({uploadedAt: -1})
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .select("-extractedText");

        const total = await Document.countDocuments(query);

        res.status(200).json({
            documents,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        console.error("Get documents error: ", err);
        res.status(500).json({message: "Failed to get documents"});
    }
};

export const getDocument = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const {id} = req.params;
        const userId = req.userId as string;

        const document = await Document.findOne({_id: id, userId});

        if (!document) {
            res.status(404).json({message: "Document not found"});
            return;
        }

        res.status(200).json({document});
    } catch (err) {
        console.error("Get document error: ", err);
        res.status(500).json({message: "Failed to get document"});
    }
};

export const getDocumentUrl = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const {id} = req.params;
        const userId = req.userId as string;

        const document = await Document.findOne({_id: id, userId});

        if (!document) {
            res.status(404).json({message: "Document not found"});
            return;
        }

        // Generate presigned URL (valid for 1 hour)
        const url = await getPresignedUrl(document.s3Key, 3600);

        res.status(200).json({url});
    } catch (error) {
        console.error("Get document URL error:", error);
        res.status(500).json({message: "Failed to get document URL"});
    }
};

export const deleteDocument = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const {id} = req.params;
        const userId = req.userId as string;

        const document = await Document.findOne({_id: id, userId});

        if (!document) {
            res.status(404).json({message: "Document not found"});
            return;
        }

        await deleteFromS3(document.s3Key);

        await Document.findByIdAndDelete(id);

        await User.findByIdAndUpdate(userId, {
            $inc: {storageUsed: -document.fileSize},
        });

        res.status(200).json({message: "Document deleted successfully"});
    } catch (err) {
        console.error("Delete document error: ", err);
        res.status(500).json({message: "Failed to delete document"});
    }
};

export const getExtractedText = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    const {id} = req.params;
    const document = await Document.findOne({
        _id: id,
        userId: req.userId,
    }).select("extractedText");

    if (!document) {
        res.status(404).json({message: "Document not found"});
        return;
    }

    res.status(200).json({
        extractedText: document.extractedText || null,
        hasExtractedText: !!document.extractedText,
    });
};
