import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import UserInfo from '../components/userInfo';
import UserList from '../components/userList';
import FallecidoBulkList from '../components/fallecidoBulkList';
import useAuth from '../hooks/useAuth';

const AdminDashboard = () => {
    const { user, isLoading } = useAuth();
    const [showUsers, setShowUsers] = useState(true);

    if (isLoading) return <div>Cargando...</div>;

    if (!user?.Roles.includes('admin')) {
        return <Navigate to="/" />;
    }

    return (
        <div>
            <UserInfo user={user} canEdit={true} />

            <div className="container-fluid mb-4">
                <div className="btn-group w-100">
                    <button
                        className={`btn ${showUsers ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setShowUsers(true)}
                    >
                        Ver listado de Usuarios
                    </button>
                    <button
                        className={`btn ${!showUsers ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setShowUsers(false)}
                    >
                        Ver listado de Seres Queridos
                    </button>
                </div>
            </div>

            {showUsers ? <UserList /> : <FallecidoBulkList canEdit={true} />}
        </div>
    );
};

export default AdminDashboard;