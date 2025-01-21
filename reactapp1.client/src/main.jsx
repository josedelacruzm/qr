import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Asegúrate de que la ruta esté correcta
import '../public/index.css'; // Asegúrate de que el archivo CSS exista

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
