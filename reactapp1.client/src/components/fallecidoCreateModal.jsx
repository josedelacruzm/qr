import React, { useState, useEffect } from 'react';

const FallecidoCreateModal = ({ userId, show, handleClose, onCreateSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        genero: '',
        fechaNacimiento: '',
        lugarNacimiento: '',
        fechaFallecimiento: '',
        lugarFallecimiento: '',
        imagenFallecido: null,
        biografia: '',
        userid: userId,
    });
    const [multimedias, setMultimedias] = useState([]);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const validateDates = () => {
        const errors = {};

        // Validate birth date is not in the future
        if (formData.fechaNacimiento > today) {
            errors.fechaNacimiento = 'La fecha de nacimiento no puede ser en el futuro.';
        }

        // Validate death date is not before birth date
        if (formData.fechaNacimiento && formData.fechaFallecimiento) {
            if (formData.fechaFallecimiento < formData.fechaNacimiento) {
                errors.fechaFallecimiento = 'La fecha de fallecimiento no puede ser anterior a la fecha de nacimiento.';
            }
        }

        // Validate death date is not in the future
        if (formData.fechaFallecimiento > today) {
            errors.fechaFallecimiento = 'La fecha de fallecimiento no puede ser en el futuro.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear specific validation error when user starts typing/changing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'imagenFallecido') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setMultimedias([...multimedias, ...Array.from(files)]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates before submission
        const isValid = validateDates();

        if (!isValid) {
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Agregar campos básicos
            formDataToSend.append('Nombre', formData.nombre);
            formDataToSend.append('Genero', formData.genero);
            formDataToSend.append('FechaNacimiento', formData.fechaNacimiento);
            formDataToSend.append('LugarNacimiento', formData.lugarNacimiento);
            formDataToSend.append('FechaFallecimiento', formData.fechaFallecimiento);
            formDataToSend.append('LugarFallecimiento', formData.lugarFallecimiento);
            formDataToSend.append('Biografia', formData.biografia);
            formDataToSend.append('UserId', formData.userid);

            // Agregar imagen del fallecido
            if (formData.imagenFallecido) {
                formDataToSend.append('ImagenFallecido', formData.imagenFallecido);
            }

            // Agregar archivos multimedia
            multimedias.forEach((file) => {
                formDataToSend.append('Multimedias', file);
            });

            const response = await fetch(`${window.location.origin}/api/fallecidos/nuevo`, {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
            }

            const createdFallecido = await response.json();
            onCreateSuccess(createdFallecido);
            handleClose();
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Por favor, intenta de nuevo más tarde.');
            console.error(err);
        }
    };

    if (!show) return null;

    return (
        <div>
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                <div className="modal-dialog modal-lg" style={{ maxHeight: '80vh', overflowY: 'auto', marginTop: '5%', marginBottom: '5%' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Agregar Ser Querido</h5>
                            <button type="button" className="close" onClick={handleClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="nombre">Nombre</label>
                                    <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="genero">Género</label>
                                    <select className="form-control" id="genero" name="genero" value={formData.genero} onChange={handleInputChange} required>
                                        <option value="">Seleccione...</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        className={`form-control ${validationErrors.fechaNacimiento ? 'is-invalid' : ''}`}
                                        id="fechaNacimiento"
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleInputChange}
                                        max={today}
                                        required
                                    />
                                    {validationErrors.fechaNacimiento && (
                                        <div className="invalid-feedback">
                                            {validationErrors.fechaNacimiento}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lugarNacimiento">Lugar de Nacimiento</label>
                                    <input type="text" className="form-control" id="lugarNacimiento" name="lugarNacimiento" value={formData.lugarNacimiento} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="fechaFallecimiento">Fecha de Fallecimiento</label>
                                    <input
                                        type="date"
                                        className={`form-control ${validationErrors.fechaFallecimiento ? 'is-invalid' : ''}`}
                                        id="fechaFallecimiento"
                                        name="fechaFallecimiento"
                                        value={formData.fechaFallecimiento}
                                        onChange={handleInputChange}
                                        min={formData.fechaNacimiento || undefined}
                                        max={today}
                                        required
                                    />
                                    {validationErrors.fechaFallecimiento && (
                                        <div className="invalid-feedback">
                                            {validationErrors.fechaFallecimiento}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lugarFallecimiento">Lugar de Fallecimiento</label>
                                    <input type="text" className="form-control" id="lugarFallecimiento" name="lugarFallecimiento" value={formData.lugarFallecimiento} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="imagenFallecido">Imagen del Fallecido</label>
                                    <input type="file" className="form-control-file" id="imagenFallecido" name="imagenFallecido" onChange={handleFileChange} accept="image/*" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="biografia">Biografía</label>
                                    <textarea className="form-control" id="biografia" name="biografia" value={formData.biografia} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="multimedias">Multimedia (Fotos, Videos, Audios)</label>
                                    <input type="file" className="form-control-file" id="multimedias" name="multimedias" onChange={handleFileChange} multiple accept="image/*, video/*, audio/*" />
                                </div>
                                <div className="mb-3">
                                    <label>Agregar relación con otro ser querido</label>
                                    <small>Puedes agregar relaciones en el perfil de tu Ser Querido</small>
                                </div>
                                <button type="submit" className="btn primario">Guardar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FallecidoCreateModal;