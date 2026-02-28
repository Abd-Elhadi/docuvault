import express from "express";
import {
    uploadDocument,
    getDocuments,
    getDocument,
    getDocumentUrl,
    deleteDocument,
    getExtractedText,
} from "../controllers/documentController.js";
import {authenticate} from "../middleware/auth.js";
import {upload} from "../middleware/upload.js";

const router = express.Router();

router.use(authenticate);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.get("/:id/url", getDocumentUrl);
router.delete("/:id", deleteDocument);
router.get("/:id/text", getExtractedText);

export default router;
