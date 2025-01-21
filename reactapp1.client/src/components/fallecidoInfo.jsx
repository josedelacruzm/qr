import React, { useEffect, useState } from 'react';
import LoadingOverlay from './loadingOverlay';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import ArbolGenealogico from './arbolGenealogico';

// Definición de estilos para el modal
const modalStyles = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1030
    },
    modal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1050,
        width: '90%',
        maxWidth: '1200px'
    },
    dialog: {
        position: 'relative',
        width: '100%',
        margin: '0 auto'
    },
    content: {
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '0.3rem',
        padding: '1rem'
    }
};


const FallecidoInfo = ({ fallecidoId, canEdit }) => {
    const [fallecido, setFallecido] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editedFallecido, setEditedFallecido] = useState({});
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [activeTab, setActiveTab] = useState('biografia');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // Puede ser "media" o "fallecido"
    const [mediaToDelete, setMediaToDelete] = useState(null);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchFallecido = async () => {
            try {
                setIsLoading(true);  // Activa el overlay de carga
                const response = await fetch(`/api/fallecidos/${fallecidoId}`);
                if (response.ok) {
                    const data = await response.json();
                    setFallecido(data);
                    setEditedFallecido(data);
                } else {
                    console.error('Error al obtener el fallecido');
                }
            } catch (error) {
                console.error('Error en la petición GET:', error);
            } finally {
                setIsLoading(false);  // Esto se ejecutará SIEMPRE al final, sin importar si hubo éxito o error
            }
        };

        fetchFallecido();
    }, [fallecidoId]);

    // Función para actualizar datos básicos del fallecido
    const updateFallecido = async (updatedFallecidoData) => {
        setIsLoading(true);  // Activa el overlay de carga

        try {

            if (!hasChanges(updatedFallecidoData)) {
                setEditingField(null);
                return;
            }
            // Manejar la actualización de la imagen de perfil primero
            if (updatedFallecidoData.newProfileImage) {
                const formData = new FormData();
                formData.append('file', updatedFallecidoData.newProfileImage);  // El archivo va en 'file'


                // Ahora envías el FormData al backend con la URL que incluye el ID
                const response = await fetch(`/api/fallecidos/update-file/${fallecidoId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData,
                });

                if (response.ok) {
                    const { message, imageUrl } = await response.json();
                    console.log(message); // "Imagen actualizada correctamente"

                    // Actualizar el estado del fallecido con la nueva URL de imagen
                    setFallecido((prevFallecido) => ({
                        ...prevFallecido,
                        ImageUrl: imageUrl
                    }));
                } else {
                    console.error('Error al actualizar la imagen de perfil');
                }
            } else {

                let [fieldName, newValue] = Object.entries(updatedFallecidoData)[0];

                // Actualizar datos básico
                const response = await fetch(`/api/fallecidos/update/${fallecidoId}?fieldName=${encodeURIComponent(fieldName)}&newValue=${encodeURIComponent(newValue)}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    setFallecido((prevFallecido) => ({
                        ...prevFallecido,
                        [fieldName]: newValue // Sobrescribe solo el campo actualizado
                    }));
                    setEditingField(null);

                } else {
                    const errorData = await response.text();
                    console.error('Error al actualizar el fallecido:', errorData);
                    throw new Error(errorData);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Aquí podrías manejar el error, por ejemplo mostrando una notificación
        } finally {
            setIsLoading(false);  // Esto se ejecutará SIEMPRE al final, sin importar si hubo éxito o error
        }
    };

    const hasChanges = (updatedData) => {
        if ('newProfileImage' in updatedData) return true;
        const [key, value] = Object.entries(updatedData)[0];
        if (fallecido[key] instanceof Date || value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const fechaFallecido = fallecido[key].split('T')[0];
            return fechaFallecido !== value;
        }
        return fallecido[key] !== value;
    };




    const handleEditClick = (field) => {
        if (canEdit) {
            if (editingField === field) {
                // Crear un objeto que solo contiene el campo editado
                const updatedField = {
                    [field]: editedFallecido[field]
                };
                updateFallecido(updatedField);
            } else {
                setEditingField(field);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedFallecido((prevFallecido) => ({ ...prevFallecido, [name]: value }));
    };




    // Función para manejar la subida de archivos multimedia
    const handleFileUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        const formData = new FormData();

        // Agregar cada archivo al FormData
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            // Usar el endpoint correcto según el tipo
            const tipo = type === 'gallery' ? 'galeria' : 'voces';
            setIsLoading(true);  // Activa el overlay de carga
            const response = await fetch(`/api/fallecidos/add-multimedia/${fallecidoId}?tipo=${tipo}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                // Recargar los datos del fallecido para obtener los archivos actualizados
                const getFallecidoResponse = await fetch(`/api/fallecidos/${fallecidoId}`);
                if (getFallecidoResponse.ok) {
                    const updatedData = await getFallecidoResponse.json();
                    setFallecido(updatedData);
                }
            } else {
                console.error('Error al subir archivos');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);  // Esto se ejecutará SIEMPRE al final, sin importar si hubo éxito o error
        }
    };

    const handleDeleteMultimedia = async (direccionFile) => {
        try {

            const basePath = "/uploads";
            const uploadPath = direccionFile.split(basePath)[1];

            const resultPath = basePath + uploadPath;

            setIsLoading(true);  // Activa el overlay de carga
            const response = await fetch(`/api/fallecidos/delete-multimedia/${fallecidoId}?fileUrl=${encodeURIComponent(resultPath)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setFallecido((prevFallecido) => {
                    const mediaType = direccionFile.includes('/multimedia/galeria/') ? 'galeria' :
                        direccionFile.includes('/multimedia/audio/') ? 'audio' : null;

                    switch (mediaType) {
                        case 'galeria':
                            return {
                                ...prevFallecido,
                                GalleryFiles: prevFallecido.GalleryFiles.filter(fileUrl => fileUrl !== direccionFile)
                            };
                        case 'audio':
                            return {
                                ...prevFallecido,
                                AudioFiles: prevFallecido.AudioFiles.filter(fileUrl => fileUrl !== direccionFile)
                            };
                        default:
                            console.error('Tipo de archivo no reconocido:', direccionFile);
                            return prevFallecido;
                    }
                });
                setShowDeleteModal(false);
                setMediaToDelete(null);
            } else {
                console.error('Error al eliminar multimedia');
            }
        }
        catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);  // Esto se ejecutará SIEMPRE al final, sin importar si hubo éxito o error
        }
    };


    const handleDeleteFallecido = async () => {
        try {
            setIsLoading(true);  // Activa el overlay de carga
            const response = await fetch(`/api/fallecidos/delete/${fallecidoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                navigate('/');
            } else {
                console.error('Error al eliminar el fallecido');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);  // Esto se ejecutará SIEMPRE al final, sin importar si hubo éxito o error
        }
    };

    const handleDeleteFallecidoClick = () => {
        setDeleteTarget('fallecido'); // Establece el target como "fallecido"
        setShowDeleteModal(true);     // Abre el modal de confirmación
    };

    const handleDeleteMediaClick = (mediaUrl) => {
        setMediaToDelete(mediaUrl);
        setDeleteTarget('media');
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteTarget === 'media' && mediaToDelete) {
            handleDeleteMultimedia(mediaToDelete);
        } else if (deleteTarget === 'fallecido') {
            handleDeleteFallecido();
        }
        setShowDeleteModal(false); // Cerrar el modal después de confirmar
        setDeleteTarget(null);     // Restablecer el target
    };


    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };


    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg)$/i);
    };

    const handleShowMedia = (mediaUrl) => {
        setSelectedMedia(mediaUrl);
        setShowMediaModal(true);
    }

    const handleRegenerateQR = async () => {
        try {
            setIsLoading(true);  // Activa el overlay de carga
            const response = await fetch(`/api/fallecidos/generate-qr/${fallecidoId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                // Recargar los datos del fallecido para obtener el nuevo QR
                const getFallecidoResponse = await fetch(`/api/fallecidos/${fallecidoId}`);
                if (getFallecidoResponse.ok) {
                    const updatedData = await getFallecidoResponse.json();
                    setFallecido(updatedData);
                }
            }
        } catch (error) {
            console.error('Error al regenerar QR:', error);
        } finally {
            setIsLoading(false);  // Esto se ejecutará SIEMPRE al final, sin importar si hubo éxito o error
        }
    };

    function formatDateForInput(dateString) {
        // Extraer la fecha en formato 'YYYY-MM-DD' (primeros 10 caracteres)
        const dateParts = dateString.split("T")[0].split("-");

        // Volver a formar la fecha en formato 'YYYY-MM-DD' para el input
        const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;

        // Convertirla a objeto Date para asegurarnos de que se pueda usar correctamente en el input
        return new Date(formattedDate).toISOString().split('T')[0]; // Esto asegura el formato 'YYYY-MM-DD'
    }


    if (!fallecido) {
        return <div className="p-4">Cargando...</div>;
    }

    return (
        <LoadingOverlay isLoading={isLoading}>
            <div className="container-fluid">
                {/* Sección de cabecera */}
                <div className="row seccion-1 position-relative first-section">
                    <div className="col-12 col-md-8">
                        <p className="section-title">QRCementerio / Ser Querido</p>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="row justify-content-center position-relative">
                    <div className="position-relative card-wrapper">
                        <div className="card-section bg-white p-4">
                            {/* Información de perfil */}
                            <div className="d-flex align-items-start justify-content-between flex-column flex-md-row">
                                {/* Contenedor solo para foto y QR en móvil */}
                                <div className="mobile-wrapper">
                                    {/* Foto de perfil */}
                                    <div className="profile-pic-container position-relative me-4">
                                        <img
                                            src={fallecido.ImageUrl || 'https://via.placeholder.com/100'}
                                            className="rounded-circle"
                                            alt="Foto de perfil"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                        {canEdit && (
                                            <label
                                                htmlFor="profile-pic-upload"
                                                className="position-absolute  start-50 translate-middle-x bg-white  p-1 cursor-pointer"
                                                style={{ cursor: 'pointer', borderRadius: '50px', bottom: '-10px' }}
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                                <input
                                                    id="profile-pic-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="d-none"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            // Llamar a la función para actualizar el fallecido con el nuevo archivo
                                                            const updatedField = { newProfileImage: file };
                                                            updateFallecido(updatedField);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {/* Solo en móvil estará aquí el QR */}
                                    <div className="d-block d-md-none qr-container position-relative" style={{ width: '60px', height: '60px' }}>
                                        {fallecido.QRUrl ? (
                                            <img
                                                src={fallecido.QRUrl}
                                                onClick={() => handleShowMedia(fallecido.QRUrl)}
                                                alt="QR Code"
                                                className="img-fluid rounded"
                                                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div
                                                className="d-flex justify-content-center align-items-center border rounded"
                                                style={{ width: '100px', height: '100px' }}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ccc' }}>
                                                    question_mark
                                                </span>
                                            </div>
                                        )}
                                        {canEdit && (
                                            <button
                                                onClick={handleRegenerateQR}
                                                className="position-absolute start-50 translate-middle-x bg-white p-1"
                                                style={{ cursor: 'pointer', borderRadius: '50px', bottom: '-10px', border: '1px solid #dee2e6' }}
                                            >
                                                <span className="material-symbols-outlined">refresh</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Información personal */}
                                <div className="flex-grow-1 mx-4">
                                    {/* Nombre */}
                                    <div className="mb-3">
                                        {editingField === 'Nombre' ? (
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    name="Nombre"
                                                    value={editedFallecido.Nombre || fallecido.Nombre}
                                                    onChange={handleChange}
                                                    autoFocus
                                                />
                                                <button
                                                    className="btn c-secundario p-0 ms-2"
                                                    onClick={() => handleEditClick('Nombre')}
                                                >
                                                    <span className="material-symbols-outlined">check</span>
                                                </button>
                                                <button
                                                    className="btn c-secundario p-0 ms-2"
                                                    onClick={() => {
                                                        setEditedFallecido({ ...fallecido });
                                                        setEditingField(null);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <h1 className="h3 mb-0 d-flex align-items-center">
                                                {fallecido.Nombre}
                                                {canEdit && (
                                                    <button
                                                        className="btn c-secundario p-0 ms-2"
                                                        onClick={() => handleEditClick('Nombre')}
                                                    >
                                                        <span className="material-symbols-outlined">edit_note</span>
                                                    </button>
                                                )}
                                            </h1>
                                        )}
                                    </div>

                                    {/* Fechas */}
                                    <div className="mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            {editingField === 'FechaNacimiento' ? (
                                                <div className="d-flex align-items-center">
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        name="FechaNacimiento"
                                                        value={formatDateForInput(editedFallecido.FechaNacimiento) || formatDateForInput(fallecido.FechaNacimiento)}
                                                        onChange={handleChange}

                                                    />
                                                    <button
                                                        className="btn c-secundario p-0 ms-2"
                                                        onClick={() => handleEditClick('FechaNacimiento')}
                                                    >
                                                        <span className="material-symbols-outlined">check</span>
                                                    </button>
                                                    <button
                                                        className="btn c-secundario p-0 ms-2"
                                                        onClick={() => {
                                                            setEditedFallecido({ ...fallecido });
                                                            setEditingField(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {new Date(fallecido.FechaNacimiento).toLocaleDateString('es-CL', { timeZone: 'UTC' }).split('/').reverse().join('-')}
                                                    {canEdit && (
                                                        <button
                                                            className="btn c-secundario p-0"
                                                            onClick={() => handleEditClick('FechaNacimiento')}
                                                        >
                                                            <span className="material-symbols-outlined">edit_note</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <span>-</span>
                                            {editingField === 'FechaFallecimiento' ? (
                                                <div className="d-flex align-items-center">
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        name="FechaFallecimiento"
                                                        value={formatDateForInput(editedFallecido.FechaFallecimiento) || formatDateForInput(fallecido.FechaFallecimiento)}
                                                        onChange={handleChange}

                                                    />
                                                    <button
                                                        className="btn c-secundario p-0 ms-2"
                                                        onClick={() => handleEditClick('FechaFallecimiento')}
                                                    >
                                                        <span className="material-symbols-outlined">check</span>
                                                    </button>
                                                    <button
                                                        className="btn c-secundario p-0 ms-2"
                                                        onClick={() => {
                                                            setEditedFallecido({ ...fallecido });
                                                            setEditingField(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>

                                                </div>
                                            ) : (
                                                <>
                                                    {new Date(fallecido.FechaFallecimiento).toLocaleDateString('es-CL', { timeZone: 'UTC' }).split('/').reverse().join('-')}
                                                    {canEdit && (
                                                        <button
                                                            className="btn c-secundario p-0"
                                                            onClick={() => handleEditClick('FechaFallecimiento')}
                                                        >
                                                            <span className="material-symbols-outlined">edit_note</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lugares */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="material-symbols-outlined">home</span>
                                        {editingField === 'LugarNacimiento' ? (
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    name="LugarNacimiento"
                                                    value={editedFallecido.LugarNacimiento || fallecido.LugarNacimiento}
                                                    onChange={handleChange}

                                                />
                                                <button
                                                    className="btn c-secundario p-0 ms-2"
                                                    onClick={() => handleEditClick('LugarNacimiento')}
                                                >
                                                    <span className="material-symbols-outlined">check</span>
                                                </button>
                                                <button
                                                    className="btn c-secundario p-0 ms-2"
                                                    onClick={() => {
                                                        setEditedFallecido({ ...fallecido });
                                                        setEditingField(null);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {fallecido.LugarNacimiento}
                                                {canEdit && (
                                                    <button
                                                        className="btn c-secundario p-0"
                                                        onClick={() => handleEditClick('LugarNacimiento')}
                                                    >
                                                        <span className="material-symbols-outlined">edit_note</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <span>-</span>
                                        <span className="material-symbols-outlined">deceased</span>
                                        {editingField === 'LugarFallecimiento' ? (
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    name="LugarFallecimiento"
                                                    value={editedFallecido.LugarFallecimiento || fallecido.LugarFallecimiento}
                                                    onChange={handleChange}

                                                />
                                                <button
                                                    className="btn c-secundario p-0 ms-2"
                                                    onClick={() => handleEditClick('LugarFallecimiento')}
                                                >
                                                    <span className="material-symbols-outlined">check</span>
                                                </button>
                                                <button
                                                    className="btn c-secundario p-0 ms-2"
                                                    onClick={() => {
                                                        setEditedFallecido({ ...fallecido });
                                                        setEditingField(null);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {fallecido.LugarFallecimiento}
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleEditClick('LugarFallecimiento')}
                                                        className="btn c-secundario p-0 ms-1">
                                                        <span className="material-symbols-outlined text-sm">edit_note</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* QR para desktop */}
                                <div className="d-none d-md-block qr-container position-relative" style={{ minWidth: '100px' }}>
                                    {fallecido.QRUrl ? (
                                        <img
                                            src={fallecido.QRUrl}
                                            onClick={() => handleShowMedia(fallecido.QRUrl)}
                                            alt="QR Code"
                                            className="img-fluid rounded"
                                            style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div
                                            className="d-flex justify-content-center align-items-center border rounded"
                                            style={{ width: '100px', height: '100px' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ccc' }}>
                                                question_mark
                                            </span>
                                        </div>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={handleRegenerateQR}
                                            className="position-absolute start-50 translate-middle-x bg-white p-1"
                                            style={{ cursor: 'pointer', borderRadius: '50px', bottom: '-10px', border: '1px solid #dee2e6' }}
                                        >
                                            <span className="material-symbols-outlined">refresh</span>
                                        </button>
                                    )}
                                </div>

                                {canEdit && (
                                    <button
                                        className="btn text-danger p-0"
                                        onClick={handleDeleteFallecidoClick}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <ul className="card-section nav-tabs tabs nav">
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'biografia' ? 'active' : ''}`}
                                onClick={() => handleTabChange('biografia')}>
                                Biografía
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'galeria' ? 'active' : ''}`}
                                onClick={() => handleTabChange('galeria')}>
                                Galería
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'voces' ? 'active' : ''}`}
                                onClick={() => handleTabChange('voces')}>
                                Voces
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'arbol' ? 'active' : ''}`}
                                onClick={() => handleTabChange('arbol')}>
                                Árbol Genealógico
                            </a>
                        </li>
                    </ul>

                    <div className="tab-content card-section position-relative">
                        {activeTab === 'biografia' && (
                            <div className="tab-pane active">
                                <div className="primario p-3 rounded-3 position-relative overflow-visible">
                                    {editingField === 'Biografia' ? (
                                        <div className="position-relative">
                                            <textarea
                                                name="Biografia"
                                                value={editedFallecido.Biografia || fallecido.Biografia}
                                                onChange={handleChange}
                                                className="form-control"
                                                rows="6"
                                            />
                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                <button
                                                    className="btn btn-primary btn-sm me-2"
                                                    onClick={() => handleEditClick('Biografia')}
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setEditingField(null)}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="position-relative">
                                            <p style={{ whiteSpace: 'pre-line', fontSize: '15px' }} className="mb-0">{fallecido.Biografia || 'No hay biografía disponible.'}</p>
                                            {canEdit && (
                                                <button
                                                    className="btn secundario position-absolute end-0"
                                                    onClick={() => {
                                                        setEditingField('Biografia');
                                                        setEditedFallecido(prev => ({
                                                            ...prev,
                                                            Biografia: fallecido.Biografia
                                                        }));
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'galeria' && (
                            <div className="gallery-container p-4">
                                <div className="d-flex justify-content-end mb-3">
                                    {canEdit && (
                                        <label className="btn secundario d-flex align-items-center">
                                            Agregar
                                            <span className="material-symbols-outlined me-2">add</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={(e) => handleFileUpload(e, 'gallery')}
                                                className="d-none"
                                            />
                                        </label>
                                    )}
                                </div>
                                <div className="row g-3">
                                    {fallecido.GalleryFiles?.map((fileUrl, index) => (
                                        <div key={fileUrl} className="col-6 col-md-2 position-relative">
                                            <div
                                                className="media-item cursor-pointer"
                                                onClick={() => handleShowMedia(fileUrl)} // Ahora toda la sección abre el modal
                                                style={{ aspectRatio: '1', position: 'relative' }}
                                            >
                                                {isVideo(fileUrl) ? (
                                                    <>
                                                        <video
                                                            src={fileUrl}
                                                            className="w-100 h-100 object-cover rounded"
                                                            style={{ objectFit: 'cover' }}
                                                            // Se quitan los controles del video
                                                            controls={false}
                                                            autoPlay={false} // Opcional: asegurarse de que no se reproduzca automáticamente
                                                        />
                                                        {/* Ícono de play en el centro */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            fontSize: '50px',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}>
                                                            <span className="material-symbols-outlined">play_arrow</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <img
                                                        src={fileUrl}
                                                        alt="Gallery item"
                                                        className="w-100 h-100 object-cover rounded"
                                                    />
                                                )}
                                                {canEdit && (
                                                    <button
                                                        className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle-y"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMediaClick(fileUrl);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}



                                </div>
                            </div>
                        )}
                        {activeTab === 'voces' && (
                            <div className="voices-container p-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <h5>Lista de Audios</h5>
                                    {canEdit && (
                                        <label className="btn secundario d-flex align-items-center">
                                            Agregar Audio
                                            <span className="material-symbols-outlined me-2">add</span>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) => handleFileUpload(e, 'audio')}
                                                className="d-none"
                                            />
                                        </label>
                                    )}
                                </div>
                                <div className="audio-list">
                                    {fallecido.AudioFiles?.map((fileUrl, index) => (
                                        <div key={fileUrl}
                                            className={`audio-item mb-3 position-relative p-3 rounded ${selectedAudio === fileUrl ? 'bg-light' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedAudio(fileUrl)}>
                                            <div className="d-flex align-items-center">
                                                <span className="material-symbols-outlined me-3">
                                                    {selectedAudio === fileUrl ? 'pause_circle' : 'play_circle'}
                                                </span>
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold">Audio {index + 1}</div>
                                                    {selectedAudio === fileUrl && (
                                                        <AudioPlayer
                                                            src={fileUrl}
                                                            autoPlay
                                                            customControlsSection={[
                                                                'MAIN_CONTROLS',
                                                                'VOLUME_CONTROLS',
                                                                'PROGRESS_BAR',
                                                                'CURRENT_TIME',
                                                                'DURATION',
                                                            ]}
                                                            autoPlayAfterSrcChange={false}
                                                            showJumpControls={false}
                                                            onEnded={() => setSelectedAudio(null)}
                                                        />
                                                    )}
                                                </div>
                                                {canEdit && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm ms-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMediaClick(fileUrl);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'arbol' && (
                            <div className="arbol-genealogico">
                                <ArbolGenealogico fallecido={fallecido} canEdit={canEdit} />
                            </div>
                        )}
                    </div>
                </div>


                {/* Modal mejorado */}
                {
                    showMediaModal && (
                        <>
                            <div style={modalStyles.backdrop} onClick={() => setShowMediaModal(false)}></div>
                            <div style={modalStyles.modal}>
                                <div style={modalStyles.dialog}>
                                    <div style={modalStyles.content}>
                                        <div className="modal-header">
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setShowMediaModal(false)}
                                            ></button>
                                        </div>
                                        <div className="modal-body text-center p-4">
                                            {isVideo(selectedMedia) ? (
                                                <video controls className="img-fluid" style={{ maxHeight: '80vh' }}>
                                                    <source src={selectedMedia} type="video/mp4" />
                                                    Tu navegador no soporta el tag de video.
                                                </video>
                                            ) : (
                                                <img
                                                    src={selectedMedia}
                                                    alt="Media view"
                                                    className="img-fluid"
                                                    style={{ maxHeight: '80vh' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }

                {/* Modal para confirmar eliminación general */}
                {
                    showDeleteModal && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Confirmar eliminación</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowDeleteModal(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {deleteTarget === 'fallecido'
                                            ? '¿Está seguro que desea eliminar este fallecido? Esta acción no se puede deshacer.'
                                            : '¿Está seguro que desea eliminar este archivo? Esta acción no se puede deshacer.'}
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowDeleteModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={confirmDelete} // Ejecuta confirmDelete
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="backdrop fade show"></div>
                        </div>
                    )
                }


            </div >
        </LoadingOverlay>

    );
};


export default FallecidoInfo;