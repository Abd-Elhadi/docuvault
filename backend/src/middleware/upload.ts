import multer from "multer";
import {Request} from "express";

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF and images are allowed."));
    }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: MAX_FILE_SIZE,
    },
    fileFilter,
});
