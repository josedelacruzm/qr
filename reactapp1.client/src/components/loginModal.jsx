import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLogin from './userLogin';
import UserCreate from './userCreate';

const LoginModal = ({ show, handleClose }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    if (!show) return null;

    const handleLoginSuccess = () => {
        handleClose();
        navigate('/dashboard/');
    };

    const handleRegisterSuccess = () => {
        setActiveTab('login');
        alert('Se ha enviado un correo de verificación. Por favor, revisa tu bandeja de entrada.');
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/usuarios/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(email)
            });
            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);
            } 
        } catch (error) {
            setMessage('Error al conectar con el servidor');
        }
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {activeTab === 'login' ? 'Iniciar sesión' :
                                activeTab === 'register' ? 'Crear cuenta' :
                                    'Recuperar contraseña'}
                        </h5>
                        <button type="button" className="close" onClick={handleClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                                    href="#"
                                    onClick={() => setActiveTab('login')}
                                >
                                    Iniciar sesión
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                                    href="#"
                                    onClick={() => setActiveTab('register')}
                                >
                                    Registrarse
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content mt-3">
                            {activeTab === 'login' && (
                                <>
                                    <UserLogin onLoginSuccess={handleLoginSuccess} />
                                    <div className="text-center mt-3">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveTab('forgot-password');
                                            }}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    </div>
                                </>
                            )}

                            {activeTab === 'register' && (
                                <UserCreate onCreateSuccess={handleRegisterSuccess} />
                            )}

                            {activeTab === 'forgot-password' && (
                                <form onSubmit={handleForgotPassword}>
                                    <div className="form-group">
                                        <label>Correo electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="text-center mt-3">
                                        <button type="submit" className="btn btn-primary">
                                            Enviar instrucciones
                                        </button>
                                    </div>
                                    {message && (
                                        <div className="alert alert-info mt-3">
                                            {message}
                                        </div>
                                    )}
                                    <div className="text-center mt-3">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveTab('login');
                                            }}
                                        >
                                            Volver al inicio de sesión
                                        </a>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;