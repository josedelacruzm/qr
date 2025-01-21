import React, { useState } from 'react';

const PasswordValidator = ({ password, onPasswordChange }) => {
    const [validation, setValidation] = useState({
        length: false,
        hasUppercase: false,
        hasSymbol: false, // Cambiamos para verificar un símbolo en lugar de solo alfanuméricos
    });

    const validatePassword = (value) => {
        const length = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasSymbol = /[^a-zA-Z0-9]/.test(value); // Verifica si tiene al menos un símbolo

        setValidation({
            length,
            hasUppercase,
            hasSymbol,
        });

        onPasswordChange(value, length && hasUppercase && hasSymbol);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        validatePassword(value);
    };

    return (
        <div className="mb-3">
            <label htmlFor="password">Contraseña</label>
            <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
            />
            <ul>
                <li style={{ color: validation.length ? 'green' : 'red' }}>
                    Al menos 8 caracteres
                </li>
                <li style={{ color: validation.hasUppercase ? 'green' : 'red' }}>
                    Al menos una letra mayúscula
                </li>
                <li style={{ color: validation.hasSymbol ? 'green' : 'red' }}>
                    Al menos un símbolo (por ejemplo, @, #, $, etc.)
                </li>
            </ul>
        </div>
    );
};

export default PasswordValidator;
