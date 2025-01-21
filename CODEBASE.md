# Proposito:
Documentar la estructura del código.

# Estructura del Proyecto

## reactapp1.client
- `index.html`  
  Archivo principal del cliente, entrada de la aplicación.
- `nginx.conf`  
  Configuración para Nginx.
- `nuget.config`  
  Configuración para dependencias de NuGet.
- `package-lock.json`  
  Detalles de versiones exactas de dependencias instaladas.
- `package.json`  
  Configuración de proyecto y dependencias para Node.js.
- `reactapp1.client.esproj`  
  Archivo de proyecto para .NET.
- `vite.config.js`  
  Configuración de Vite (herramienta de desarrollo).
- **modules/**
  - `.package-lock.json`  
    Archivo de bloqueo relacionado con dependencias.

### public
- `arbolgenealogico.css`, `index.css`, `menu.css`  
  Archivos de estilos CSS.
- `vite.svg`  
  Icono o logo utilizado.

### src
- `App.jsx`  
  Componente principal de la aplicación.
- `main.jsx`  
  Punto de entrada de React.

#### assets
- `imagen-portada-ej.jpg`, `react.svg`  
  Recursos estáticos como imágenes.

#### components
Componentes reutilizables de la aplicación:
- `AlertComponent.jsx`, `arbolGenealogico.jsx`, `fallecidoBulkList.jsx`, etc.  
  Componentes específicos para funcionalidades.

#### hooks
Hooks personalizados:
- `passwordValidator.jsx`, `useAuth.jsx`  
  Lógica reutilizable para validación y autenticación.

#### pages
Páginas principales:
- `adminDashboard.jsx`, `fallecidoPage.jsx`, `home.jsx`, `userDashboard.jsx`  
  Componentes que representan páginas de la aplicación.

---

## ReactApp1.Server
- `appsettings.Development.json`, `appsettings.json`  
  Configuración para diferentes entornos.
- `Program.cs`  
  Punto de entrada de la aplicación en .NET.
- `ReactApp1.Server.csproj`  
  Archivo de proyecto para el servidor.

### Controllers
Controladores para manejar las solicitudes:
- `FallecidoController.cs`, `UsuarioController.cs`  

### Models
Modelos de datos:
- `AplicationRole.cs`, `AplicationUser.cs`, `Fallecido.cs`, etc.  

### obj
- **Debug/**  
  Archivos temporales generados en modo depuración.

### Properties
- `launchSettings.json`  
  Configuración para el entorno de desarrollo.

### Services
Servicios que manejan la lógica del negocio:
- `EmailSender.cs`, `FallecidoServices.cs`  

### uploads
Subidas de archivos:
- **fallecidos/**  
  - `6700a2b10958a5eeec045dc6/`  
    Directorios específicos para subidas.

### wwwroot
Directorio raíz público para archivos estáticos.

# Interacción

# Interacción entre el Controlador y React

## Backend: ASP.NET
El controlador maneja solicitudes HTTP y devuelve respuestas. Ejemplo:

### **Controlador: `FallecidoController.cs`**
```csharp
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FallecidoController : ControllerBase
    {
        private readonly FallecidoServices _fallecidoServices;

        public FallecidoController(FallecidoServices fallecidoServices)
        {
            _fallecidoServices = fallecidoServices;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Fallecido>>> GetFallecidos()
        {
            var fallecidos = await _fallecidoServices.GetFallecidosAsync();
            return Ok(fallecidos);
        }
    }
}
```
**Explicación:**  
El método `GetFallecidos` maneja solicitudes `GET` a `/api/Fallecido`. Llama a un servicio (`FallecidoServices`) para obtener una lista de datos y los devuelve como respuesta en formato JSON.

---

### **Componente: `fallecidoPage.jsx`**
```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FallecidoPage = () => {
    const [fallecidos, setFallecidos] = useState([]);

    useEffect(() => {
        const fetchFallecidos = async () => {
            try {
                const response = await axios.get('/api/Fallecido');
                setFallecidos(response.data);
            } catch (error) {
                console.error('Error fetching fallecidos:', error);
            }
        };

        fetchFallecidos();
    }, []);

    return (
        <div>
            <h1>Lista de Fallecidos</h1>
            <ul>
                {fallecidos.map(fallecido => (
                    <li key={fallecido.id}>{fallecido.nombre}</li>
                ))}
            </ul>
        </div>
    );
};

export default FallecidoPage;
```
**Explicación:**  
El componente `FallecidoPage` en React usa el hook `useEffect` para realizar una solicitud HTTP `GET` a la ruta `/api/Fallecido` cuando el componente se monta. La respuesta de la solicitud se guarda en el estado `fallecidos` mediante el hook `useState`. Luego, esta lista se mapea y se renderiza en la interfaz como una lista de elementos `<li>`.

---

## Flujo de Interacción
1. **Solicitud desde React:** El componente hace un `GET` a `/api/Fallecido` usando `axios`.
2. **Controlador ASP.NET:** `FallecidoController` maneja la solicitud, obtiene los datos y los devuelve.
3. **Respuesta en React:** React actualiza el estado `fallecidos` y muestra la lista en la UI.


# Resumen del Backend
## Archivos de Configuración
- appsettings.Development.json y appsettings.json: Archivos de configuración para diferentes entornos (desarrollo y producción). Contienen configuraciones como cadenas de conexión a bases de datos, configuraciones de logging, etc.
- Program.cs: Punto de entrada de la aplicación. Configura y arranca el servidor web ASP.NET.
- ReactApp1.Server.csproj: Archivo de proyecto que define las dependencias y configuraciones del proyecto .NET.
## Controladores
Los controladores manejan las solicitudes HTTP y devuelven respuestas. Aquí están los controladores que tienes:
### FallecidoController.cs:
- Métodos:
- GetFallecidos(): Devuelve una lista de fallecidos.
- Otros métodos podrían incluir crear, actualizar y eliminar fallecidos.
### UsuarioController.cs:
- Métodos:
- Métodos para manejar la autenticación y gestión de usuarios, como login, registro, obtener detalles de usuario, etc.
## Modelos
Los modelos representan las entidades de datos en tu aplicación. Aquí están algunos de los modelos que tienes:
- AplicationRole.cs: Representa los roles de usuario en la aplicación.
- AplicationUser.cs: Representa a los usuarios de la aplicación.
- Fallecido.cs: Representa la entidad de fallecido, con propiedades como Id, Nombre, FechaDeFallecimiento, etc.
## Servicios
Los servicios contienen la lógica de negocio y se utilizan para interactuar con los controladores. Aquí están algunos de los servicios que tienes:
- EmailSender.cs: Servicio para enviar correos electrónicos.
- FallecidoServices.cs:
- Métodos:
- GetFallecidosAsync(): Obtiene una lista de fallecidos desde la base de datos.
- Otros métodos podrían incluir crear, actualizar y eliminar fallecidos.
## Otros Directorios
- obj/Debug/: Contiene archivos temporales generados en modo depuración.
- Properties/launchSettings.json: Configuración para el entorno de desarrollo, como perfiles de lanzamiento y configuraciones de depuración.
- uploads/fallecidos/: Directorios específicos para subidas de archivos relacionados con fallecidos.
- wwwroot/: Directorio raíz público para archivos estáticos como imágenes, CSS, JavaScript, etc.
## Interacción entre Componentes
\1. Controladores y Servicios:
- Los controladores reciben las solicitudes HTTP y llaman a los servicios para realizar operaciones de negocio.
- Por ejemplo, FallecidoController llama a FallecidoServices para obtener, crear, actualizar o eliminar datos de fallecidos.
\2. Modelos y Servicios:
- Los servicios interactúan con los modelos para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos.
- Por ejemplo, FallecidoServices utiliza el modelo Fallecido para representar y manipular los datos de fallecidos.


# Resumen Frontend - React

## Páginas

### adminDashboard.jsx
- Descripción: Página principal del administrador. Probablemente muestra estadísticas, gráficos y opciones de administración.
- Componentes Relacionados: Podría incluir componentes como gráficos, tablas de datos, formularios de administración, etc.

### fallecidoPage.jsx
- Descripción: Página que muestra una lista de fallecidos. Puede incluir funcionalidades para ver detalles, agregar, editar o eliminar fallecidos.
- Componentes Relacionados: fallecidoBulkList.jsx, arbolGenealogico.jsx, etc.

### home.jsx
- Descripción: Página de inicio de la aplicación. Podría mostrar una introducción, enlaces a otras secciones y contenido destacado.
- Componentes Relacionados: Podría incluir componentes como un carrusel de imágenes, secciones de contenido, etc.

### userDashboard.jsx
- Descripción: Página principal del usuario. Muestra información relevante para el usuario, como su perfil, actividades recientes, etc.
- Componentes Relacionados: Podría incluir componentes como formularios de perfil, listas de actividades, etc.

## Componentes

### AlertComponent.jsx
- Descripción: Componente para mostrar alertas o notificaciones al usuario.
- Uso: Se puede utilizar en cualquier página o componente que necesite mostrar mensajes de alerta.

### arbolGenealogico.jsx
- Descripción: Componente que muestra un árbol genealógico.
- Uso: Probablemente utilizado en fallecidoPage.jsx para mostrar relaciones familiares.

### fallecidoBulkList.jsx
- Descripción: Componente que muestra una lista de fallecidos en formato de lista masiva.
- Uso: Utilizado en fallecidoPage.jsx para mostrar una lista detallada de fallecidos.

## Hooks Personalizados

### passwordValidator.jsx
- Descripción: Hook personalizado para validar contraseñas.
- Uso: Utilizado en formularios de registro o cambio de contraseña para asegurar que las contraseñas cumplan con ciertos criterios.

### useAuth.jsx
- Descripción: Hook personalizado para manejar la autenticación del usuario.
- Uso: Utilizado en componentes y páginas que requieren autenticación para acceder a ciertas funcionalidades.

## Otros Archivos

### App.jsx
- Descripción: Componente principal de la aplicación. Define la estructura general y las rutas de la aplicación.
- Uso: Incluye el enrutamiento y la disposición general de los componentes y páginas.

### main.jsx
- Descripción: Punto de entrada de React. Renderiza el componente App en el DOM.
- Uso: Inicializa la aplicación React y monta el componente principal.

## Recursos Estáticos

### assets
- Descripción: Contiene recursos estáticos como imágenes.
- Archivos: imagen-portada-ej.jpg, react.svg

## Archivos de Estilos

### public
- Descripción: Contiene archivos de estilos CSS.
- Archivos: arbolgenealogico.css, index.css, menu.css


# Variables Principales
- ASPNETCORE_ENVIRONMENT: Define el entorno de ejecución (Development, Staging, Production).
- ConnectionStrings__DefaultConnection: Cadena de conexión a la base de datos.
- EmailSettings__SmtpServer: Servidor SMTP para el envío de correos electrónicos.
- EmailSettings__SmtpPort: Puerto del servidor SMTP.
- EmailSettings__SenderEmail: Dirección de correo electrónico del remitente.
- EmailSettings__SenderPassword: Contraseña del remitente.
## Cómo Configurar las Variables de Entorno
### 1. En archivos de configuración:
- Edita los archivos appsettings.json y appsettings.Development.json para incluir las variables de entorno necesarias.
### 2. En Docker:
- Utiliza el archivo docker-compose.yml o el comando docker run para pasar las variables de entorno al contenedor.