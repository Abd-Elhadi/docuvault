import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {AuthProvider, useAuth} from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Navbar from "./components/shared/Navbar";

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
    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome to DocuVault! Document upload coming soon.
                </p>
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
