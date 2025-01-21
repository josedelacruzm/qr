import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from '../components/loginModal';
import StatusModal from '../components/StatusModal';
import portada from '../assets/imagen-portada-ej.jpg';

const Home = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState({show: false,
        type: null,
        token: null,
        email: null
    });
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        if (queryParams.get('emailVerified') === 'true') {
            setShowStatusModal({ show: true, type: 'email-verified', token: null, email: null });
            navigate('/', { replace: true });
        }

        if (queryParams.get('token') && queryParams.get('email')) {
            setShowStatusModal({
                show: true,
                type: 'reset-password',
                token: queryParams.get('token'),
                email: queryParams.get('email')
            });
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim().length >= 3) {
            navigate(`/ser-querido?search=${encodeURIComponent(searchTerm)}`);
        } else {
            // Opcional: Puedes agregar un mensaje de error o una alerta
            alert('Por favor, introduce al menos 3 letras para buscar');
        }
    };


    const handleCloseStatusModal = () => {
        setShowStatusModal({
            show: false,
            type: null,
            token: null,
            email: null
        });
    };

    return (
        <>
            <div className="hero-section position-relative overflow-hidden bg-dark" style={{ height: "90vh" }}>
                {/* Overlay con gradiente */}
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        background: 'linear-gradient(45deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%)',
                        zIndex: 1
                    }}
                />

                {/* Imagen de fondo */}
                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <img
                        src={portada}
                        alt="Portada"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                </div>

                {/* Contenido */}
                <div className="container position-relative h-100 d-flex flex-column" style={{ zIndex: 2 }}>
                    {/* Search Bar - Pegado arriba */}
                    <div className="row justify-content-center pt-4">
                        <div className="col-12 col-md-8 col-lg-6">
                            <form onSubmit={handleSearch}>
                                <div className="input-group input-group-lg">
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{
                                            borderRadius: '30px 0 0 30px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderColor: 'rgba(255, 255, 255, 0.8)',
                                            color: 'white',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        placeholder="Buscar ser querido por nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn secundario px-4"
                                        style={{
                                            borderRadius: '0 30px 30px 0',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                            border: '2px solid rgba(255, 255, 255, 0.8)',
                                            borderLeft: 'none'
                                        }}
                                    >
                                        <i className="material-symbols-outlined text-white">search</i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Contenido principal - Centrado vertical */}
                    <div className="row flex-grow-1 align-items-center">
                        <div className="col-12 text-center">
                            <h1
                                className="display-2 fw-bold mb-4 text-white"  
                                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                            >
                                QR Cementerio
                            </h1>
                            <p className="lead fs-3 mb-5 text-white-50">
                                Un lugar para recordar a tus seres queridos, accesible desde cualquier dispositivo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiénes Somos */}
            <div id="quienes-somos" className="container my-5">
                <h2 className="text-center mb-4">¿Quiénes Somos?</h2>
                <p className="text-center">
                    Somos un equipo dedicado a crear un espacio digital para preservar y compartir la memoria de nuestros seres queridos. A través de nuestra plataforma, ofrecemos una forma moderna y accesible para honrar a aquellos que ya no están con nosotros, facilitando el acceso a sus historias y recuerdos desde cualquier lugar.
                </p>
            </div>

            {/* Características */}
            <div id="caracteristicas" className="features-section container">
                <h2 className="text-center my-4">Características</h2> {/* Título de Características */}
                <hr /> {/* Divider */}
                <div className="row">
                    {/* Característica 1 */}
                    <div className="col-12 col-md-3 feature text-center mb-4">
                        <span className="material-symbols-outlined">check_circle</span>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>

                    {/* Característica 2 */}
                    <div className="col-12 col-md-3 feature text-center mb-4">
                        <span className="material-symbols-outlined">check_circle</span>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>

                    {/* Característica 3 */}
                    <div className="col-12 col-md-3 feature text-center mb-4">
                        <span className="material-symbols-outlined">check_circle</span>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>

                    {/* Característica 4 */}
                    <div className="col-12 col-md-3 feature text-center mb-4">
                        <span className="material-symbols-outlined">check_circle</span>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
            </div>



            <div id="planes" className="plans-section container">
                <div className="row">
                    {/* Plan Básico */}
                    <div className="col-12 col-md-4 mb-4">
                        <div className="plan card h-100">
                            <div className="card-body">
                                <h3 className="card-title">Plan Básico</h3>
                                <p className="card-text">$10/mes</p>
                                <ul>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                </ul>
                                <button className="btn btn-primary">Contacta con un administrador</button>
                            </div>
                        </div>
                    </div>

                    {/* Plan Estándar */}
                    <div className="col-12 col-md-4 mb-4">
                        <div className="plan card h-100">
                            <div className="card-body">
                                <h3 className="card-title">Plan Estándar</h3>
                                <p className="card-text">$20/mes</p>
                                <ul>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                </ul>
                                <button className="btn btn-primary">Contacta con un administrador</button>
                            </div>
                        </div>
                    </div>

                    {/* Plan Premium */}
                    <div className="col-12 col-md-4 mb-4">
                        <div className="plan card h-100">
                            <div className="card-body">
                                <h3 className="card-title">Plan Premium</h3>
                                <p className="card-text">$30/mes</p>
                                <ul>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                    <li>Lorem ipsum dolor sit amet.</li>
                                </ul>
                                <button className="btn btn-primary">Contacta con un administrador</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            
            {/* Preguntas Frecuentes */}
            <div id="preguntas" className="faq-section container">
                <h2>Preguntas Frecuentes</h2>
                <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="headingOne">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                ¿Pregunta 1?
                            </button>
                        </h2>
                        <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                Respuesta a la pregunta 1.
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="headingTwo">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                ¿Pregunta 2?
                            </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                Respuesta a la pregunta 2.
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <LoginModal
                show={showLoginModal}
                handleClose={() => setShowLoginModal(false)}
            />

            <StatusModal
                show={showStatusModal.show}
                handleClose={handleCloseStatusModal}
                modalType={showStatusModal.type}
                token={showStatusModal.token}
                email={showStatusModal.email}
            />
        </>
    );
};

export default Home;
