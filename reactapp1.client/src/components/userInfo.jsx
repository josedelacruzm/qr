import React, { useState } from 'react';

const UserInfo = ({ user, canEdit }) => {
    const [isEditingField, setIsEditingField] = useState(null);
    const [editedUser, setEditedUser] = useState({ ...user });
    const [isSaving, setIsSaving] = useState(false);

    const updateUser = async (updatedUserData) => {
        // Verificar si hay cambios antes de realizar la actualización
        if (updatedUserData.nombre === user.Nombre && updatedUserData.email === user.Email) {
            setIsEditingField(null); // Salir del modo de edición sin guardar
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch(`/api/usuarios/${user.Id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedUserData)
            });

            if (response.ok) {
                setEditedUser(updatedUserData);
                setIsEditingField(null);
            } else {
                console.error('Error al actualizar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (field) => {
        if (canEdit) {
            if (isEditingField === field) {
                // Si ya está en modo de edición, guardar y salir del modo de edición
                updateUser(editedUser);
            } else {
                // Si no está en modo de edición, activar la edición
                setIsEditingField(field);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleBlur = () => {
        if (!isSaving && isEditingField) {
            updateUser(editedUser);
        }
    };


    return (
        <div className="container-fluid">
            <div className="row seccion-1 position-relative first-section">
                <div className="col-12 col-md-8">
                    <p className="section-title">
                        {user?.Roles.includes('admin') ? (
                            <>
                                QRCementerio / <span className="c-secundario">Administrador</span>
                            </>
                        ) : (
                            "QRCementerio / Perfil"
                        )}
                    </p>
                </div>
            </div>
            <div className="row justify-content-center position-relative">
                <div className="position-relative card-wrapper">
                    <div className="card-section bg-white">
                        <div className="d-flex flex-column flex-sm-row align-items-start justify-content-between">
                            <i className="material-symbols-outlined fa-6x">account_circle</i>
                            <div className="flex-grow-1">
                                <h5 className="card-title mb-1">
                                    {isEditingField === 'nombre' ? (
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={editedUser.nombre || user.Nombre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            autoFocus
                                        />
                                    ) : (
                                        <span onClick={() => handleEditClick('nombre')} style={{ cursor: canEdit ? 'pointer' : 'default' }}>
                                            {editedUser.nombre || user.Nombre}
                                        </span>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={() => handleEditClick('nombre')}
                                            className="btn p-0 ms-2"
                                            aria-label="Edit Nombre"
                                        >
                                            <i className="material-symbols-outlined">{isEditingField === 'nombre' ? 'check' : 'edit_note'}</i>
                                        </button>
                                    )}
                                </h5>
                                <p className="pl-1">
                                    {isEditingField === 'email' ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editedUser.email || user.Email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            
                                            autoFocus
                                        />
                                    ) : (
                                        <span onClick={() => handleEditClick('email')} style={{ cursor: canEdit ? 'pointer' : 'default' }}>
                                            {editedUser.email || user.Email}
                                        </span>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={() => handleEditClick('email')}
                                            className="btn p-0 ms-2"
                                            aria-label="Edit Email"
                                        >
                                            <i className="material-symbols-outlined">{isEditingField === 'email' ? 'check' : 'edit_note'}</i>
                                        </button>
                                    )}
                                </p>
                            </div>
                            <span className="user-since">usuario desde {new Date(user.CreatedOn).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default UserInfo;
