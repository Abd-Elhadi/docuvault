export interface User {
    id: string;
    email: string;
    name: string;
    storageUsed?: number;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

export interface Document {
    id: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    tags: string[];
    category?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}
