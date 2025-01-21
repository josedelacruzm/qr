using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Text;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Configuraci�n de MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient, MongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

// Configurar la base de datos para ser inyectada
builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return client.GetDatabase(settings.DatabaseName);
});
builder.Services.AddScoped<FallecidoServices>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy
                .WithOrigins(
                    "https://qr-cementerio-d27aa4d8024d.herokuapp.com/",
                    "http://qr-cementerio-d27aa4d8024d.herokuapp.com/",
                    "http://localhost:5173",    // o tu puerto de desarrollo
                    "https://localhost:5173"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// Agregar servicios de Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddMongoDbStores<ApplicationUser, ApplicationRole, string>(
        builder.Configuration["MongoDbSettings:ConnectionString"], // Usar "Connection" directamente
        builder.Configuration["MongoDbSettings:DatabaseName"]) // Usar "DatabaseName" directamente
    .AddDefaultTokenProviders();

// Configuraci�n de autenticaci�n con JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "QRMemorial",
        ValidAudience = "usuariocomun",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully");
            return Task.CompletedTask;
        }
    };
});


// Configuraci�n de Controladores y JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Swagger y otros servicios
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// IEmailSender
builder.Services.AddTransient<IEmailSender, EmailSender>();


//HEROKU
//var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
//builder.WebHost.UseUrls($"http://+:{port}");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});


// Middleware para autenticaci�n y autorizaci�n
app.UseRouting();
app.UseAuthentication(); // Aseg�rate de que esto est� antes de UseAuthorization
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");



// L�gica para crear el usuario administrador
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        // Crear el rol de administrador si no existe
        if (!await roleManager.RoleExistsAsync("admin"))
        {
            await roleManager.CreateAsync(new ApplicationRole("admin"));
        }

        // Crear el rol de usuario comun si no existe
        if (!await roleManager.RoleExistsAsync("comun"))
        {
            await roleManager.CreateAsync(new ApplicationRole("comun"));
        }

        // Crear el usuario administrador si no existe
        var adminEmail = "ninoskamirandasa@gmail.com";
        var adminUsername = "ninodev";
        var adminPassword = "EyD4HFn>s243";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var newAdmin = new ApplicationUser
            {
                UserName = adminUsername,
                Email = adminEmail,
                Nombre = "Ninoska Miranda"
            };

            var result = await userManager.CreateAsync(newAdmin, adminPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, "admin");
            }
        }
    }
    catch (Exception ex)
    {
        // Manejo de errores
        Console.WriteLine($"Error al crear el administrador: {ex.Message}");
    }
}

app.Run();