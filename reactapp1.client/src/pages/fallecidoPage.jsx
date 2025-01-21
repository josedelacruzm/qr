import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import FallecidoInfo from '../components/fallecidoInfo'; // Este sería el nuevo componente de información del fallecido
import useAuth from '../hooks/useAuth';

const FallecidoPage = () => {
    const { fallecidoid } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // Si no hay fallecidoId y el usuario es administrador, redirigir a la página de administración
        if (!fallecidoid && user?.Roles.includes('admin')) {
            navigate('/admindashboard');
        }
    }, [fallecidoid, user, navigate]);

    if (isLoading) return <div>Cargando...</div>;

    if (!fallecidoid) {
        return <Navigate to="/" />;
    }

    // Determinar si el usuario tiene permisos para editar
    const isAdmin = user?.Roles.includes('admin');
    const isOwner = user && fallecidoid && user.FallecidosIds.includes(fallecidoid); // Asumiendo que el usuario tiene una lista de fallecidos asociados
    const canEdit = isOwner || isAdmin;

    return (
        <div>
            <FallecidoInfo fallecidoId={fallecidoid} canEdit={canEdit} />
        </div>
    );
};

export default FallecidoPage;
