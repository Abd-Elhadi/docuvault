import api from "./api";
import {Document} from "../types";

export const uploadDocument = async (
    file: File,
    onProgress?: (progress: number) => void,
): Promise<{document: Document}> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentage = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                );
                onProgress(percentage);
            }
        },
    });

    return response.data;
};

export const getDocuments = async (
    page: number = 1,
    limit: number = 20,
): Promise<{
    documents: Document[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}> => {
    const response = await api.get("/documents", {
        params: {page, limit},
    });
    return response.data;
};

export const getDocument = async (
    id: string,
): Promise<{document: Document}> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
};

export const getDocumentUrl = async (id: string): Promise<{url: string}> => {
    const response = await api.get(`/documents/${id}/url`);
    return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
};

export const getExtractedText = async (
    id: string,
): Promise<{
    extractedText: string | null;
    hasExtractedText: boolean;
}> => {
    const response = await api.get(`/documents/${id}/text`);
    return response.data;
};
