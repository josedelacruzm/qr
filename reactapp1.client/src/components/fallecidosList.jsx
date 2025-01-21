import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FallecidoCreateModal from './fallecidoCreateModal';

const FallecidoList = ({ userId, canEdit }) => {
    const [fallecidos, setFallecidos] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    const fetchFallecidos = async () => {
        try {
            const response = await fetch(`${window.location.origin}/api/fallecidos/getFallecidos?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setFallecidos(data);
            } else {
                console.error('Error al obtener la lista de fallecidos');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchFallecidos();
    }, [userId]);

    const handleDelete = async (fallecidoId) => {
            if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                try {
                    const response = await fetch(`/api/fallecidos/delete/${fallecidoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        setFallecidos(fallecidos.filter(f => f.id !== fallecidoId));
                    } else {
                        console.error('Error al eliminar el fallecido');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    // Modificar para redirigir a la página de FallecidoPage
    const handleViewOrEdit = (fallecidoId) => {
        navigate(`/ser-querido/${fallecidoId}`); // Aquí redirige a FallecidoPage
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        fetchFallecidos();
    };

    // Deshabilita el desplazamiento del fondo cuando el modal esté abierto
    useEffect(() => {
        if (showCreateModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Limpia el efecto cuando el componente se desmonta
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showCreateModal]);

    return (
        <div className="container-fluid card-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="section-title">Seres Queridos</h5>
                {canEdit && (
                    <button className="btn secundario btn-sm" onClick={() => setShowCreateModal(true)}>Agregar +</button>
                )}
            </div>
            {fallecidos.length === 0 ? (
                <p>No hay Seres Queridos ingresados.</p>
            ) : (
                <ul className="list-group">
                    {fallecidos.map(fallecido => (
                        <li key={fallecido.Id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">

                                <img src={fallecido.ImageUrl} alt={`Imagen de ${fallecido.Nombre}`} className="rounded-circle me-3" width="80" height="80" />

                                <div className="pl-3">
                                    <h6 onClick={() => handleViewOrEdit(fallecido.Id)} className="mb-0">{fallecido.Nombre}</h6>
                                    <small className="text-muted">Fallecido el: {formatDate(fallecido.FechaFallecimiento)}</small>
                                </div>

                                <img src={fallecido.QRUrl} alt={`QR de ${fallecido.Nombre}`} className=" me-3" width="80" height="80" />
                            </div>
                                <div className="ml-3">
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleViewOrEdit(fallecido.Id)}>Editar</button>
                                    {canEdit && (
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(fallecido.Id)}>Borrar</button>
                                    )}
                                </div>
                        </li>
                    ))}
                </ul>
            )}
            <FallecidoCreateModal
                userId={userId}
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                onCreateSuccess={handleCreateSuccess}
            />
        </div>

    );
};

export default FallecidoList;
