import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginModal from './loginModal';

const Menu = () => {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((prevState) => !prevState);
    }, []);

    const handleUserClick = useCallback(() => {
        if (user) {
            navigate(`/dashboard/${user.Id}`);
        }
    }, [user, navigate]);

    if (isLoading) {
        return <div>Cargando...</div>;
    }


    return (
        <>
            <nav className="navbar navbar-light">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    {/* Logo */}
                    <Link className="navbar-brand abril-fatface" to="/">QR Cementerio</Link>

                    {/* Menú en pantallas grandes */}
                    <div className="d-none d-lg-flex align-items-center">
                        <ul className="navbar-nav d-flex flex-row">
                            <li className="nav-item mx-2">
                                <a className="nav-link" href="/#quienes-somos">Quienes Somos</a>
                            </li>
                            <li className="nav-item mx-2">
                                <a className="nav-link" href="/#caracteristicas">Características</a>
                            </li>
                            <li className="nav-item mx-2">
                                <a className="nav-link" href="/#planes">Planes</a>
                            </li>
                            <li className="nav-item mx-2">
                                <a className="nav-link" href="/#preguntas">Preguntas</a>
                            </li>
                        </ul>

                        {/* Botón de inicio de sesión */}
                        {user ? (
                            <button className="btn secundario d-flex align-items-center ms-3">
                                <span className="me-2" onClick={handleUserClick} style={{ cursor: 'pointer' }}>
                                    {user.Nombre}
                                </span>
                                <i onClick={logout} className="material-symbols-outlined">logout</i>
                            </button>
                        ) : (
                            <button className="btn secundario ms-3" onClick={handleOpenModal}>
                                Iniciar Sesión
                            </button>
                        )}
                    </div>

                    {/* Menú hamburguesa en pantallas pequeñas */}
                    <div className="d-lg-none d-flex align-items-center">
                        <button
                            className="btn me-2"
                            type="button"
                            onClick={toggleMenu}
                            style={{ position: 'relative', left: '0' }}
                        >
                            <i className="material-symbols-outlined">menu</i>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Menú hamburguesa desplegable para pantallas pequeñas */}
            {isMenuOpen && (
                <div
                    className="position-absolute p-3 shadow"
                    style={{ width: '100%', zIndex: '10', backgroundColor: 'white', top: '60px' }}
                >
                    {/* Botón de inicio de sesión dentro del menú primero */}
                    <div className="mb-3">
                        {user ? (
                            <button className="btn secundario d-flex align-items-center w-100">
                                <span className="me-2" onClick={handleUserClick} style={{ cursor: 'pointer' }}>
                                    {user.Nombre}
                                </span>
                                <i onClick={logout} className="material-symbols-outlined">logout</i>
                            </button>
                        ) : (
                            <button className="btn secundario w-100" onClick={handleOpenModal}>
                                Iniciar Sesión
                            </button>
                        )}
                    </div>

                    {/* Opciones del menú */}
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" href="/#quienes-somos">Quienes Somos</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/#caracteristicas">Características</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/#planes">Planes</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/#preguntas">Preguntas</a>
                        </li>
                    </ul>
                </div>
            )}

            {/* Modal de inicio de sesión */}
            <LoginModal show={isModalOpen} handleClose={handleCloseModal} />
        </>
    );

};
export default Menu;
