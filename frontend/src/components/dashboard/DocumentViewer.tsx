import React, {useEffect, useState} from "react";
import {
    getDocument,
    getDocumentUrl,
    getExtractedText,
} from "../../services/documentService";
import {Document} from "../../types";

interface DocumentViewerProps {
    documentId: string;
    onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    documentId,
    onClose,
}) => {
    const [document, setDocument] = useState<Document | null>(null);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [extractedText, setExtractedText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"preview" | "text">("preview");

    useEffect(() => {
        loadDocument();
    }, [documentId]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            const [docData, urlData, textData] = await Promise.all([
                getDocument(documentId),
                getDocumentUrl(documentId),
                getExtractedText(documentId),
            ]);

            setDocument(docData.document);
            setFileUrl(urlData.url);
            setExtractedText(
                textData.extractedText || "Text extraction in progress...",
            );
        } catch (error) {
            console.error("Failed to load document:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="text-center">Loading document...</div>
                </div>
            </div>
        );
    }

    if (!document) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold truncate">
                        {document.filename}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab("preview")}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === "preview"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab("text")}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === "text"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Extracted Text
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === "preview" && (
                        <div className="h-full">
                            {document.mimeType === "application/pdf" ? (
                                <iframe
                                    src={fileUrl}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                />
                            ) : document.mimeType.startsWith("image/") ? (
                                <div className="h-full flex items-center justify-center bg-gray-100">
                                    <img
                                        src={fileUrl}
                                        alt={document.filename}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-500">
                                        Preview not available for this file type
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "text" && (
                        <div className="h-full overflow-auto p-6 bg-gray-50">
                            {extractedText ? (
                                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                                    {extractedText}
                                </pre>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">
                                        Extracting text from document...
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        This may take a few moments
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
