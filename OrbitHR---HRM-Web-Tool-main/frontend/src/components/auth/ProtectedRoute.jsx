import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};
