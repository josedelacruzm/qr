# DATABASE.md

## Esquema Actual

La base de datos está implementada en MongoDB y consiste en las siguientes colecciones:

## applicationUsers
Colección que implementa ASP.NET Identity para la gestión de usuarios. Esta colección extiende el modelo base de Identity (IdentityUser) con campos personalizados.

### Estructura heredada de Identity:
```javascript
{
  // Campos base de IdentityUser
  _id: String,                    // UUID
  UserName: String,               // Nombre de usuario
  NormalizedUserName: String,     // Nombre de usuario normalizado
  Email: String,                  // Correo electrónico
  NormalizedEmail: String,        // Correo electrónico normalizado
  EmailConfirmed: Boolean,        // Confirmación de email
  PasswordHash: String,           // Hash de la contraseña
  SecurityStamp: String,          // Sello de seguridad
  ConcurrencyStamp: String,       // Sello de concurrencia
  PhoneNumber: String,            // Número telefónico
  PhoneNumberConfirmed: Boolean,  // Confirmación de teléfono
  TwoFactorEnabled: Boolean,      // Autenticación de dos factores
  LockoutEnd: Date,               // Fecha fin de bloqueo
  LockoutEnabled: Boolean,        // Bloqueo habilitado
  AccessFailedCount: Number,      // Contador de intentos fallidos
  
  // Campos personalizados agregados al modelo de Identity
  Version: Number,                // Versión del registro
  CreatedOn: Date,                // Fecha de creación
  Claims: Array,                  // Reclamaciones del usuario
  Roles: Array,                   // Roles asignados
  Logins: Array,                  // Historial de inicios de sesión
  Tokens: Array,                  // Tokens de acceso
  Nombre: String,                 // Nombre completo
  FallecidosIds: Array           // IDs de fallecidos relacionados
}
```

## Roles
Colección que implementa los roles de ASP.NET Identity (IdentityRole). Se utiliza para la gestión de roles y permisos en la aplicación.

### Estructura heredada de Identity:
```javascript
{
  _id: String,                    // UUID
  Name: String,                   // Nombre del rol
  NormalizedName: String,         // Nombre normalizado
  ConcurrencyStamp: String,       // Sello de concurrencia
  Version: Number,                // Versión del registro
  Claims: Array                   // Reclamaciones del rol
}
```

## Fallecido
Colección personalizada que almacena la información de personas fallecidas.

### Estructura:
```javascript
{
  _id: ObjectId,
  nombre: String,                 // Nombre completo
  genero: String,                 // Género
  fechanacimiento: Date,          // Fecha de nacimiento
  lugarnacimiento: String,        // Lugar de nacimiento
  fechafallecimiento: Date,       // Fecha de fallecimiento
  lugarfallecimiento: String,     // Lugar de fallecimiento
  biografia: String,              // Biografía
  cementerio: String,             // Ubicación del cementerio
  relaciones: Array              // Array de relaciones con otros fallecidos
}
```

## Relacion
Colección personalizada que almacena las relaciones entre fallecidos.

### Estructura:
```javascript
{
  _id: ObjectId,
  Fallecido1Id: String,          // ID del primer fallecido
  Fallecido2Id: String,          // ID del segundo fallecido
  TipoRelacion1: String,         // Tipo de relación del primero hacia el segundo
  TipoRelacion2: String          // Tipo de relación del segundo hacia el primero
}
```

## ASP.NET Identity Integration

El sistema utiliza ASP.NET Identity para la gestión de autenticación y autorización, adaptado para trabajar con MongoDB en lugar de SQL Server. Esto proporciona:

### 1. Gestión de Usuarios:
- Registro y autenticación de usuarios
- Confirmación de email
- Recuperación de contraseña
- Autenticación de dos factores

### 2. Gestión de Roles:
- Roles predefinidos (ej: "admin")
- Asignación de roles a usuarios
- Control de acceso basado en roles

### 3. Seguridad:
- Hashing de contraseñas
- Gestión de tokens
- Protección contra ataques de fuerza bruta

## Relaciones Clave

### 1. Usuario - Fallecidos:
- Un usuario puede estar relacionado con múltiples fallecidos a través del array `FallecidosIds`
- Relación uno a muchos (1:N)

### 2. Usuario - Roles:
- Un usuario puede tener múltiples roles a través del array `Roles`
- Relación muchos a muchos (N:M)

### 3. Fallecido - Fallecido:
- Los fallecidos pueden estar relacionados entre sí a través de la colección `Relacion`
- Relación muchos a muchos (N:M) con información adicional sobre el tipo de relación

## Consultas Comunes

### 1. Obtener usuario con sus roles
```javascript
db.applicationUsers.aggregate([
  {
    $lookup: {
      from: "roles",
      localField: "Roles",
      foreignField: "_id",
      as: "userRoles"
    }
  }
])
```

### 2. Obtener fallecidos relacionados a un usuario
```javascript
db.applicationUsers.aggregate([
  {
    $match: { _id: "userId" }
  },
  {
    $lookup: {
      from: "fallecido",
      localField: "FallecidosIds",
      foreignField: "_id",
      as: "fallecidos"
    }
  }
])
```

### 3. Obtener relaciones de un fallecido
```javascript
db.relacion.find({
  $or: [
    { Fallecido1Id: "fallecidoId" },
    { Fallecido2Id: "fallecidoId" }
  ]
})
```

# Migración a Otra Base de Datos

Para migrar a otra base de datos, como SQL Server o PostgreSQL, sigue estos pasos:

## 1. Actualizar el Modelo de Datos

* Asegúrate de que tus modelos de datos sean compatibles con la nueva base de datos.

## 2. Actualizar el Contexto de Datos

* Si estás migrando a SQL Server, utiliza DbContext de Entity Framework Core.
* Ejemplo de configuración para SQL Server:

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    public DbSet<Fallecido> Fallecidos { get; set; }
    public DbSet<ApplicationUser> Users { get; set; }
}
```

## 3. Actualizar el Servicio

* Reemplaza las operaciones de MongoDB con operaciones de Entity Framework Core.
* Ejemplo de FallecidoService para SQL Server:

```csharp
public class FallecidoService : IFallecidoService
{
    private readonly ApplicationDbContext _context;
    public FallecidoService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<List<Fallecido>> GetFallecidosAsync()
    {
        return await _context.Fallecidos.ToListAsync();
    }
    public async Task CreateFallecidoAsync(Fallecido fallecido)
    {
        _context.Fallecidos.Add(fallecido);
        await _context.SaveChangesAsync();
    }
    // Otros métodos como UpdateFallecidoAsync, DeleteFallecidoAsync, etc.
}
```

## 4. Actualizar la Configuración

* Actualiza appsettings.json con la cadena de conexión de la nueva base de datos.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"
  }
}
```

## 5. Actualizar la Inyección de Dependencias

* Configura la inyección de dependencias en Startup.cs o Program.cs.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
    services.AddScoped<IFallecidoService, FallecidoService>();
    // Otros servicios
}
```

## Resumen

* **Controladores**: Manejan las solicitudes HTTP y llaman a los servicios para realizar operaciones de negocio.
* **Servicio de MongoDB**: Contiene la lógica de negocio y se comunica con MongoDB para realizar operaciones CRUD.
* **Migración a Otra Base de Datos**: Actualiza el modelo de datos, el contexto de datos, el servicio, la configuración y la inyección de dependencias para utilizar la nueva base de datos.