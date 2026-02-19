import React from "react";
import {Document} from "../../types";

interface DocumentCardProps {
    document: Document;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
    document,
    onView,
    onDelete,
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getFileIcon = (mimeType: string): string => {
        if (mimeType.startsWith("image/")) return "🖼️";
        if (mimeType === "application/pdf") return "📄";
        return "📁";
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="text-3xl">
                        {getFileIcon(document.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {document.filename}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(document.fileSize)} •{" "}
                            {formatDate(document.uploadedAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 ml-2">
                    <button
                        onClick={() => onView(document.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View document"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            if (
                                window.confirm(
                                    "Are you sure you want to delete this document?",
                                )
                            ) {
                                onDelete(document.id);
                            }
                        }}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete document"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentCard;
