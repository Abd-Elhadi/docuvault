import React, {useState, useEffect} from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {AuthProvider, useAuth} from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Navbar from "./components/shared/Navbar";
import UploadZone from "./components/dashboard/UploadZone";
import DocumentGrid from "./components/dashboard/DocumentGrid";
import DocumentViewer from "./components/dashboard/DocumentViewer";
import {
    uploadDocument,
    getDocuments,
    deleteDocument,
} from "./services/documentService";
import {Document} from "./types";

const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({children}) => {
    const {user, loading} = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const Dashboard: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await getDocuments();
            setDocuments(data.documents);
        } catch (err: any) {
            setError("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
        try {
            setUploading(true);
            setError("");
            setSuccess("");

            await uploadDocument(file, (progress) => {
                console.log(`Upload progress: ${progress}%`);
            });

            setSuccess(
                "Document uploaded successfully! Text extraction in progress...",
            );
            await fetchDocuments();
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to upload document",
            );
        } finally {
            setUploading(false);
        }
    };

    const handleView = (id: string) => {
        setSelectedDocumentId(id);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDocument(id);
            setSuccess("Document deleted successfully!");
            await fetchDocuments();
        } catch (err: any) {
            setError("Failed to delete document");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Documents
                    </h1>
                    <p className="text-gray-600">
                        Upload and manage your documents with AI text extraction
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="mb-8">
                    <UploadZone onUpload={handleUpload} uploading={uploading} />
                </div>

                <DocumentGrid
                    documents={documents}
                    onView={handleView}
                    onDelete={handleDelete}
                    loading={loading}
                />

                {selectedDocumentId && (
                    <DocumentViewer
                        documentId={selectedDocumentId}
                        onClose={() => setSelectedDocumentId(null)}
                    />
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
