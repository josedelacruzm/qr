import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import UserInfo from '../components/userInfo';
import FallecidoList from '../components/fallecidosList';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        if (!userId && user?.Roles.includes('admin')) {
            navigate('/admindashboard');
        }
    }, [userId, user, navigate]);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await fetch(`${ window.location.origin }/api/usuarios/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setUsuario(data);
                } else {
                    console.error('Error al obtener el usuario');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (userId && !user?.Id.toLowerCase().includes(userId.toLowerCase())) {
            fetchUsuario();
        } else {
            setUsuario(user);
        }
    }, [userId, user]);

    if (isLoading) return <div>Cargando...</div>;

    if (!userId && !user) {
        return <Navigate to="/" />;
    }

    const isOwnProfile = user && (!userId || user.Id === userId);
    const isAdmin = user?.Roles.includes('admin');
    const canEdit = isOwnProfile || isAdmin;

    return (
        <div>
            {usuario && <UserInfo user={usuario} canEdit={canEdit} />}
            {usuario && <FallecidoList userId={usuario.Id} canEdit={canEdit} />}
        </div>
    );
};

export default Dashboard;