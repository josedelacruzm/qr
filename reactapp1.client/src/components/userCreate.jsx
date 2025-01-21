import React, { useState } from 'react';
import PasswordValidator from '../hooks/passwordValidator';

const UserCreate = ({ onCreateSuccess, isAdminContext = false }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('comun');
    const [error, setError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false); // Nuevo estado para la validez de la contraseña

    const handlePasswordChange = (value, isValid) => {
        setPassword(value);
        setIsPasswordValid(isValid);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!isPasswordValid) {
            setError('La contraseña no cumple con los requisitos.');
            return;
        }

        try {
            const response = await fetch(`/api/usuarios/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    email,
                    password,
                    role: isAdminContext ? role : 'comun',
                    skipEmailVerification: isAdminContext,
                }),
            });
            if (response.ok) {
                onCreateSuccess();
            } else {
                const errorData = await response.text();
                if (errorData) {
                    const parsedData = JSON.parse(errorData);
                    setError(parsedData.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
                } else {
                    setError('Error desconocido. El servidor no envió una respuesta válida.');
                }
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || 'Ocurrió un error. Por favor, intenta de nuevo más tarde.');
            }
        }
    };

    return (
        <form onSubmit={handleCreate}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
                <label htmlFor="nombre">Nombre de usuario</label>
                <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="email">Correo electrónico</label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            {isAdminContext && (
                <div className="mb-3">
                    <label htmlFor="role">Rol</label>
                    <select
                        className="form-control"
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="comun">Común</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            )}

            {/* Componente de validación de contraseña */}
            <PasswordValidator password={password} onPasswordChange={handlePasswordChange} />

            

            <button type="submit" className="btn secundario btn-block">
                {isAdminContext ? 'Crear usuario' : 'Registrarse'}
            </button>
        </form>
    );
};

export default UserCreate;
