import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { isLoading, isAuthenticated, tokenExpired } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        // Redirigir al home y abrir el LoginModal
        return <Navigate to="/" state={{ from: location, openLoginModal: true }} replace />;
    }

    if (tokenExpired) {
        // Redirigir al home y abrir el LoginModal
        return <Navigate to="/" state={{ from: location, openLoginModal: true }} replace />;
    }

    return children;
};

export default PrivateRoute;