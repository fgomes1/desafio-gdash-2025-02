import { Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute check:', { isAuthenticated, loading, path: location.pathname });

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">Carregando autenticação...</div>;
    }

    if (!isAuthenticated) {
        console.log('Não autenticado, redirecionando para login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
