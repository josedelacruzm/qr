import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const getServerConfig = () => {
    // Configuración para Docker
    if (process.env.DOCKER) {
        return {
            port: 5173,
            https: {
                key: fs.readFileSync('/app/localhost.key'),
                cert: fs.readFileSync('/app/localhost.crt'),
            }
        };
    }

    // Configuración para desarrollo local (mantén tu lógica actual)
    const baseFolder = process.env.APPDATA
        ? `${process.env.APPDATA}/ASP.NET/https`
        : `${process.env.HOME}/.aspnet/https`;

    const certificateName = "reactapp1.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    return {
        port: 5173,
        https: fs.existsSync(certFilePath) && fs.existsSync(keyFilePath) ? {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        } : false
    };
};

const target = process.env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}`
    : process.env.ASPNETCORE_URLS
        ? process.env.ASPNETCORE_URLS.split(';')[0]
        : 'https://localhost:7000';

export default defineConfig({
    plugins: [plugin()],
    build: {
        outDir: 'dist' // Cambia esta ruta según la ubicación exacta de tu backend
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        ...getServerConfig(),
        proxy: {
            '/api': {
                target: target,
                secure: false
            }
        }
    }
});