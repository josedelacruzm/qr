# QR Cementerio

## Descripción

La aplicación web **QR Cementerio** permite crear perfiles conmemorativos digitales de personas fallecidas, centralizando su biografía, fotos, videos y audios. Los usuarios pueden generar un código QR único asociado a cada perfil, el cual puede ser colocado en la tumba, permitiendo a los visitantes acceder al perfil desde cualquier dispositivo.

## Requisitos Previos

### Hardware

* **Procesador**: Intel i5 (6ª gen+) / AMD Ryzen 3 o equivalente
* **Memoria RAM**:
  * Mínimo: 8 GB
  * Recomendado: 16 GB
* **Almacenamiento**:
  * Mínimo: 10 GB libres (solo desarrollo)
  * Recomendado: 20 GB o más (si incluye bases de datos locales o contenido multimedia)
* **Sistema Operativo**:
  * Windows 10/11 (64 bits)
  * macOS 12+
  * Linux (Ubuntu, Fedora, etc.) compatible con Docker

### Software

Para Desarrollo Local (localhost):
* **Frameworks y Herramientas**:
  * .NET SDK 8.0
  * Node.js (versión 16 o superior), npm
* **IDE recomendado**:
  * Visual Studio 2022 con las cargas de trabajo:
    * ASP.NET y desarrollo web
    * Node.js (opcional para React)
* **Base de Datos**: MongoDB (versión 4.4 o superior)

Para Docker:
* **Herramientas**:
  * Docker Desktop (última versión estable)
  * Docker Compose (incluido con Docker Desktop)
* **Imágenes Base**:
  * ASP.NET Core Runtime 8.0

Para Despliegue Web:
* **Opciones de Hosting**:
  * Con Docker: Azure App Service, AWS ECS, Heroku
  * Sin Docker: Hosting compatible con .NET Core y React (Azure App Service, AWS Elastic Beanstalk)
* **Base de Datos**: MongoDB en la nube (Atlas, o similar)
* **Configuración adicional**:
  * Dominio y certificado SSL para la aplicación (opcional)


## Resumen de Tecnologías

- **Lenguajes**: C#, JavaScript (JSX)
- **Frameworks**: ASP.NET Core, React
- **Herramientas de Desarrollo**: Vite, npm
- **Gestión de Paquetes**: NuGet, npm
- **Librerías**: axios, react-router-dom, QRCoder
- **Servidor Web**: Nginx
- **Contenedores**: Docker


## Instalación

### En Local:

1. Clona el repositorio:
```bash
git clone https://github.com/usuario/QR-Cementerio.git
```

2. Instala las dependencias del frontend:
```bash
cd qr-capp.client
npm install
```

3. Ejecuta el backend desde Visual Studio (opción de Debug)

### Despliegue con Docker (Local):

1. Abre una terminal en la carpeta donde está tu archivo `Dockerfile`

2. Construye la imagen Docker:
```bash
docker build -t qr-cementerio .
```

3. Ejecuta el contenedor:
```bash
docker run -d -p 8080:80 qr-cementerio
```

4. Accede a la aplicación en tu navegador en la siguiente URL:
```
http://localhost:8080
```

### Despliegue en la Web:

1. Abre una terminal en la carpeta donde está tu archivo `Dockerfile` y crea la imagen:
```bash
docker build -t qr-cementerio .
```

2. Sube la imagen a un registro Docker (Docker Hub, Azure Container Registry, Google Cloud, Railway, Heroku):
```bash
docker push qr-cementerio
```

3. Configura un servicio en la nube (por ejemplo, con Azure):
   * Crea una **App Service** con soporte para contenedores
   * Vincula el contenedor con tu imagen desde el registro

## Estructura de la Aplicación

1. **Página de Inicio**: Información general y acceso al buscador de perfiles
2. **Buscador de Perfiles**: Permite buscar y acceder a los perfiles de los fallecidos
3. **Dashboard de Usuario**: Los usuarios pueden gestionar su información y los perfiles de los fallecidos que han agregado
4. **Dashboard de Administrador**: Los administradores tienen acceso a todos los usuarios y perfiles de fallecidos
5. **Perfil de Fallecido**: Todos los usuarios, incluyendo invitados, tienen acceso a ver los perfiles de los Fallecidos y su data adjunta.
