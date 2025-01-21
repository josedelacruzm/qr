import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCreate from './userCreate';

const UserList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await fetch(`/api/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
            try {
                const response = await fetch(`/api/usuarios/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    setUsuarios(usuarios.filter(u => u.Id !== userId));
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const normalizeString = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredUsuarios = usuarios.filter(usuario =>
        normalizeString(usuario.Nombre).includes(normalizeString(searchTerm)) &&
        (!roleFilter || (usuario?.Roles?.includes(roleFilter)))
    );

    return (
        <div className="container-fluid card-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="section-title">Usuarios del Sistema</h5>
                <button className="btn secundario" onClick={() => setShowCreateModal(true)} >
                    Agregar <i className="material-symbols-outlined">add</i>
                </button>
            </div>
            <div className="mb-4">
                <label className="form-label">Tipo usuario:</label>
                <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Seleccionar</option>
                    <option value="comun">Usuario común</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
            <div className="input-group mb-4">
                <span className="input-group-text">
                    <i className="material-symbols-outlined">search</i>
                </span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar usuarios por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="row g-4">
                {filteredUsuarios.map(usuario => (
                    <div key={usuario.Id} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 position-relative">
                            <button
                                className="btn btn-link position-absolute top-0 end-0 text-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(usuario.Id);
                                }}
                                style={{ zIndex: 1 }}
                            >
                                <i className="material-symbols-outlined">delete</i>
                            </button>

                            <div className="card-body d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <i className="material-symbols-outlined fa-3x me-3">account_circle</i>
                                    <div>
                                        <h5 className="card-title mb-1">{usuario.Nombre}</h5>
                                        <p className="card-text text-muted mb-0">{usuario.Email}</p>
                                    </div>
                                </div>

                                <div className="text-center mb-3">
                                    <span className="d-block fw-bold">
                                        {usuario.FallecidosIds ? usuario.FallecidosIds.length : 0}
                                    </span>
                                    <small className="text-muted">Seres Queridos Registrados</small>
                                </div>

                                <button
                                    className="btn secundario mt-auto w-100"
                                    onClick={() => navigate(`/dashboard/${usuario.Id}`)}>
                                    Ver Perfil
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Bootstrap Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="createUserModalLabel">Crear Usuario</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false) } ></button>
                            </div>
                            <div className="modal-body">
                                <UserCreate
                                    isAdminContext={true}
                                    onCreateSuccess={() => {
                                        setShowCreateModal(false);
                                        fetchUsuarios();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="backdrop fade show"></div>
                </div>
            )}
        </div>
    );
};

export default UserList;