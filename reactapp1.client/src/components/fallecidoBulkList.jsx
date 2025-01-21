import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FallecidoBulkList = ({ canEdit = false }) => {
    const [fallecidos, setFallecidos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchFallecidos();

        // Get search term from URL if it exists
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location]);

    const fetchFallecidos = async () => {
        try {
            const response = await fetch(`/api/fallecidos/getAllFallecidos`, {

            });
            if (response.ok) {
                const data = await response.json();
                setFallecidos(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (fallecidoId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.')) {
            try {
                const response = await fetch(`
                /api/fallecidos/${fallecidoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    setFallecidos(fallecidos.filter(f => f.Id !== fallecidoId));
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

    const normalizeString = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredFallecidos = fallecidos.filter(fallecido =>
        normalizeString(fallecido.Nombre).includes(normalizeString(searchTerm))
    );

    return (
        <>
        <div className="container-fluid card-section">
            <h5 className="section-title mb-4">Todos los Seres Queridos</h5>

            <div className="input-group mb-4">
                <span className="input-group-text">
                    <i className="material-symbols-outlined">search</i>
                </span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {filteredFallecidos.length === 0 ? (
                <div className="text-center text-muted py-4">
                    No encontramos Seres Queridos con ese Nombre
                </div>
            ) : (
                <div className="row g-4">

                    {filteredFallecidos.map(fallecido => (
                        <div key={fallecido.Id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 position-relative">
                                {canEdit && (
                                    <button
                                        className="btn btn-link position-absolute top-0 end-0 text-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(fallecido.Id);
                                        } }
                                        style={{ zIndex: 1 }}
                                    >
                                        <i className="material-symbols-outlined">delete</i>
                                    </button>
                                )}

                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <img
                                            src={fallecido.ImageUrl}
                                            alt={fallecido.Nombre}
                                            className="rounded-circle me-3"
                                            style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                                        <div>
                                            <h5 className="card-title mb-1">{fallecido.Nombre}</h5>
                                            <p className="card-text text-muted mb-0">
                                                {formatDate(fallecido.FechaFallecimiento)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-outline-primary mt-auto w-100"
                                        onClick={() => navigate(`/ser-querido/${fallecido.Id}`)}
                                    >
                                        Ver Perfil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </>
    );
};

export default FallecidoBulkList;