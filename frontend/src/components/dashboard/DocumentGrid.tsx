import React from "react";
import {Document} from "../../types";
import DocumentCard from "./DocumentCard";

interface DocumentGridProps {
    documents: Document[];
    onView: (id: string) => void;
    onDelete: (id: string) => void;
    loading: boolean;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
    documents,
    onView,
    onDelete,
    loading,
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 rounded-lg h-24 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No documents
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by uploading a document.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
                <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={onView}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default DocumentGrid;
