import React, { useState } from 'react';

const StatusModal = ({ show, handleClose, modalType, token, email }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!show) return null;

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const response = await fetch(`/api/usuarios/reset-password?token=${token}&email=${email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPassword)
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setError('');
                // Cerrar el modal después de unos segundos
                setTimeout(handleClose, 3000);
            } else {
                setError(data.errors ? data.errors.join(', ') : 'Error al restablecer la contraseña');
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        }
    };

    const renderContent = () => {
        switch (modalType) {
            case 'email-verified':
                return (
                    <div className="text-center">
                        <div className="mb-4">
                            <i className="fas fa-check-circle text-success" style={{ fontSize: '48px' }}></i>
                        </div>
                        <h4>¡Correo verificado exitosamente!</h4>
                        <p>Ya puedes iniciar sesión en tu cuenta.</p>
                        <button className="btn btn-primary mt-3" onClick={handleClose}>
                            Entendido
                        </button>
                    </div>
                );

            case 'reset-password':
                return (
                    <form onSubmit={handleResetPassword}>
                        <h4 className="text-center mb-4">Restablecer contraseña</h4>
                        <div className="form-group">
                            <label>Nueva contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label>Confirmar contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                        {message && <div className="alert alert-success mt-3">{message}</div>}
                        <div className="text-center mt-4">
                            <button type="submit" className="btn btn-primary">
                                Cambiar contraseña
                            </button>
                        </div>
                    </form>
                );

            default:
                return null;
        }
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {modalType === 'email-verified' ? 'Verificación de correo' : 'Restablecer contraseña'}
                        </h5>
                        <button type="button" className="close" onClick={handleClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusModal;