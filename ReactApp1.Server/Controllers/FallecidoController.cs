using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Security.Claims;
using QRCoder;
using MongoDB.Driver;
using System.Text.Json;
using System.IO;
using ZstdSharp.Unsafe;

namespace ReactApp1.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/fallecidos")]
    public class FallecidoController : ControllerBase
    {
        private readonly FallecidoServices _fallecidoService;
        private readonly UserManager<ApplicationUser> _userManager;

        public FallecidoController(FallecidoServices fallecidoService, UserManager<ApplicationUser> userManager)
        {
            _fallecidoService = fallecidoService;
            _userManager = userManager;
        }

        [HttpGet("{id:length(24)}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Get(string id)
        {
            // Obtiene la información del fallecido
            var fallecido = await _fallecidoService.GetAsync(id);

            if (fallecido == null)
            {
                return NotFound("Fallecido no encontrado.");
            }

            // Ruta base del fallecido en el sistema de archivos
            var fallecidoFolderPath = Path.Combine("uploads", "fallecidos", id);

            // Rutas de archivos individuales
            var imageDirectory = Path.Combine(fallecidoFolderPath, "image");
            var imagePath = Directory.GetFiles(imageDirectory, "perfil_*")
                                .FirstOrDefault()
                                ?? Path.Combine(imageDirectory, "perfil.jpg");

            var qrPath = Path.Combine(fallecidoFolderPath, "QR", "qr-code.png");
            var multimediaPath = Path.Combine(fallecidoFolderPath, "multimedia");

            // Listas para almacenar archivos multimedia
            var galleryFiles = new List<string>();
            var audioFiles = new List<string>();

            // Agregar archivos de la galería (imágenes y videos)
            var galleryPath = Path.Combine(multimediaPath, "galeria");
            if (Directory.Exists(galleryPath))
            {
                var galleryFilesInDir = Directory.GetFiles(galleryPath);
                galleryFiles.AddRange(galleryFilesInDir.Select(file => Path.Combine("uploads", "fallecidos", id, "multimedia", "galeria", Path.GetFileName(file))));
            }

            // Agregar archivos de audio
            var audioPath = Path.Combine(multimediaPath, "audio");
            if (Directory.Exists(audioPath))
            {
                var audioFilesInDir = Directory.GetFiles(audioPath);
                audioFiles.AddRange(audioFilesInDir.Select(file => Path.Combine("uploads", "fallecidos", id, "multimedia", "audio", Path.GetFileName(file))));
            }

            var baseUrl = Request.Host.Value.Contains("localhost")
    ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
    : $"{Request.Scheme}://{Request.Host}";


            // Respuesta personalizada que incluye información del fallecido y archivos
            return Ok(new
            {
                fallecido.Id,
                fallecido.Nombre,
                fallecido.Genero,
                fallecido.FechaNacimiento,
                fallecido.LugarNacimiento,
                fallecido.FechaFallecimiento,
                fallecido.LugarFallecimiento,
                fallecido.Biografia,
                ImageUrl = imagePath != null ?
    $"{baseUrl}/uploads/fallecidos/{id}/image/{Path.GetFileName(imagePath)}" :
    null,
                QRUrl = System.IO.File.Exists(qrPath) ? $"{baseUrl}/uploads/fallecidos/{id}/QR/qr-code.png" : null,
                GalleryFiles = galleryFiles.Select(file => $"{baseUrl}/{file.Replace("\\", "/")}").ToList(),
                AudioFiles = audioFiles.Select(file => $"{baseUrl}/{file.Replace("\\", "/")}").ToList()
            });

        }


        [HttpPost("nuevo")]
        public async Task<ActionResult<Fallecido>> Create([FromForm] FallecidoCreateModel model)
        {
            try
            {

                var usuario = await _userManager.FindByIdAsync(model.userId);
                if (usuario == null)
                {
                    return NotFound("Usuario no encontrado.");
                }

                var fallecido = new Fallecido
                {
                    Nombre = model.Nombre,
                    Genero = model.Genero,
                    FechaNacimiento = model.FechaNacimiento,
                    LugarNacimiento = model.LugarNacimiento,
                    FechaFallecimiento = model.FechaFallecimiento,
                    LugarFallecimiento = model.LugarFallecimiento,
                    Biografia = model.Biografia
                };

                // Crear el registro del fallecido en la base de datos
                var createdFallecido = await _fallecidoService.CreateAsync(fallecido);

                // Crear la carpeta del fallecido en el servidor
                var fallecidoFolderPath = Path.Combine("uploads", "fallecidos", createdFallecido.Id.ToString());
                Directory.CreateDirectory(fallecidoFolderPath);
                Directory.CreateDirectory(Path.Combine(fallecidoFolderPath, "image"));
                Directory.CreateDirectory(Path.Combine(fallecidoFolderPath, "QR"));
                Directory.CreateDirectory(Path.Combine(fallecidoFolderPath, "multimedia", "galeria"));
                Directory.CreateDirectory(Path.Combine(fallecidoFolderPath, "multimedia", "audio"));

                // Guardar la imagen de perfil del fallecido (solo permitir imágenes)
                if (model.ImagenFallecido != null)
                {
                    var imageMimeType = model.ImagenFallecido.ContentType.ToLowerInvariant();
                    if (imageMimeType.StartsWith("image/"))
                    {
                        var timestamp = DateTime.Now.Ticks;
                        var fileName = $"perfil_{timestamp}.jpg";

                        var imagePath = Path.Combine(fallecidoFolderPath, "image", fileName);
                        using (var fileStream = new FileStream(imagePath, FileMode.Create))
                        {
                            await model.ImagenFallecido.CopyToAsync(fileStream);
                        }
                    }
                    else
                    {
                        return BadRequest("El archivo de imagen del fallecido debe ser de tipo imagen.");
                    }
                }
                else
                {
                    return BadRequest("Es necesario proporcionar una imagen para el fallecido.");
                }

                // Guardar archivos multimedia (solo imágenes, videos o audios)
                if (model.Multimedias != null)
                {
                    foreach (var file in model.Multimedias)
                    {
                        var contentType = file.ContentType.ToLowerInvariant();

                        if (contentType.StartsWith("image/"))
                        {
                            var galleryPath = Path.Combine(fallecidoFolderPath, "multimedia", "galeria", file.FileName);
                            using (var fileStream = new FileStream(galleryPath, FileMode.Create))
                            {
                                await file.CopyToAsync(fileStream);
                            }
                        }
                        else if (contentType.StartsWith("video/"))
                        {
                            var galleryPath = Path.Combine(fallecidoFolderPath, "multimedia", "galeria", file.FileName);
                            using (var fileStream = new FileStream(galleryPath, FileMode.Create))
                            {
                                await file.CopyToAsync(fileStream);
                            }
                        }
                        else if (contentType.StartsWith("audio/"))
                        {
                            var audioPath = Path.Combine(fallecidoFolderPath, "multimedia", "audio", file.FileName);
                            using (var fileStream = new FileStream(audioPath, FileMode.Create))
                            {
                                await file.CopyToAsync(fileStream);
                            }
                        }
                        else
                        {
                            return BadRequest($"El archivo '{file.FileName}' no es un tipo multimedia permitido.");
                        }
                    }
                }


                // Generar y guardar el código QR
                var baseUrl = Request.Host.Value.Contains("localhost")
    ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
    : $"{Request.Scheme}://{Request.Host}";
                var qrUrl = $"{baseUrl}/ser-querido/{createdFallecido.Id}";

                using (var qrGenerator = new QRCodeGenerator())
                {
                    var qrData = qrGenerator.CreateQrCode(qrUrl, QRCodeGenerator.ECCLevel.Q);
                    using (var qrCode = new PngByteQRCode(qrData))
                    {
                        var qrCodeBytes = qrCode.GetGraphic(20); // El número 20 determina el tamaño del QR
                        var qrPath = Path.Combine(fallecidoFolderPath, "QR", "qr-code.png");
                        await System.IO.File.WriteAllBytesAsync(qrPath, qrCodeBytes);
                    }
                }

                // Actualizar el usuario con el nuevo ID del fallecido
                usuario.FallecidosIds.Add(createdFallecido.Id);
                var result = await _userManager.UpdateAsync(usuario);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                return CreatedAtAction(nameof(Get), new { id = createdFallecido.Id }, createdFallecido);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }



        [HttpGet("getFallecidos")]
        [AllowAnonymous]
        public async Task<ActionResult<List<object>>> GetFallecidos(string userId)
        {
            try
            {
                // 1. Obtener usuario
                var usuario = await _userManager.FindByIdAsync(userId);
                if (usuario == null)
                {
                    return NotFound("Usuario no encontrado.");
                }

                // 2. Obtener fallecidos
                var fallecidos = await _fallecidoService.GetFallecidosByIdsAsync(usuario.FallecidosIds);
                if (!fallecidos.Any())
                {
                    return Ok(new List<object>());
                }

                // 3. Construir base URL una sola vez
                var baseUrl = Request.Host.Value.Contains("localhost")
    ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
    : $"{Request.Scheme}://{Request.Host}";

                // 4. Verificar existencia de archivos de manera asíncrona
                var tasks = fallecidos.Select(async fallecido =>
                {
                    var fallecidoFolderPath = Path.Combine("uploads", "fallecidos", fallecido.Id);
                    var imageDirectory = Path.Combine(fallecidoFolderPath, "image");
                    var imagePath = Directory.GetFiles(imageDirectory, "perfil_*")
                                        .FirstOrDefault()
                                        ?? Path.Combine(imageDirectory, "perfil.jpg");
                    var qrPath = Path.Combine(fallecidoFolderPath, "QR", "qr-code.png");

                    // Realizar verificaciones de archivo de manera asíncrona
                    var qrExists = await Task.Run(() => System.IO.File.Exists(qrPath));

                    return new
                    {
                        fallecido.Id,
                        fallecido.Nombre,
                        fallecido.FechaFallecimiento,
                        ImageUrl = imagePath != null ? $"{baseUrl}/uploads/fallecidos/{fallecido.Id}/image/{Path.GetFileName(imagePath)}" : null,
                        QRUrl = qrExists ? $"{baseUrl}/uploads/fallecidos/{fallecido.Id}/QR/qr-code.png" : null,
                    };
                });

                // 5. Esperar a que todas las tareas se completen
                var fallecidosConArchivos = await Task.WhenAll(tasks);

                return Ok(fallecidosConArchivos.ToList());
            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("getAllFallecidos")]
        [AllowAnonymous]
        public async Task<ActionResult<List<object>>> GetAllFallecidos()
        {
            try
            {
                // Obtener todos los fallecidos
                var fallecidos = await _fallecidoService.GetAllFallecidosAsync();
                // Crear una lista de respuesta personalizada con solo QR e imagen
                var fallecidosConArchivos = fallecidos.Select(fallecido =>
                {
                    var baseUrl = Request.Host.Value.Contains("localhost")
                        ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
                        : $"{Request.Scheme}://{Request.Host}";
                    var fallecidoFolderPath = Path.Combine("uploads", "fallecidos", fallecido.Id);
                    var imageDirectory = Path.Combine(fallecidoFolderPath, "image");
                    var imagePath = Directory.GetFiles(imageDirectory, "perfil_*")
                                        .FirstOrDefault()
                                        ?? Path.Combine(imageDirectory, "perfil.jpg");
                    var qrPath = Path.Combine(fallecidoFolderPath, "QR", "qr-code.png");
                    return new
                    {
                        fallecido.Id,
                        fallecido.Nombre,
                        fallecido.FechaFallecimiento,
                        ImageUrl = imagePath != null ? $"{baseUrl}/uploads/fallecidos/{fallecido.Id}/image/{Path.GetFileName(imagePath)}" : null,
                        QRUrl = System.IO.File.Exists(qrPath) ? $"{baseUrl}/uploads/fallecidos/{fallecido.Id}/QR/qr-code.png" : null,
                    };
                }).ToList();
                return Ok(fallecidosConArchivos);
            }
            catch (Exception ex)
            {

                // Return a 500 Internal Server Error with a generic error message
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }


        [HttpPut("update/{id:length(24)}")]
        public async Task<IActionResult> Update(string id, [FromQuery] string fieldName, [FromQuery] string newValue)
        {
            try
            {
                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                var property = fallecido.GetType().GetProperty(fieldName);
                if (property != null)
                {
                    // Convertir newValue al tipo de la propiedad antes de asignar
                    var convertedValue = Convert.ChangeType(newValue, property.PropertyType);
                    var updateResult = await _fallecidoService.UpdateAsync(id, fieldName, convertedValue);

                    if (updateResult)
                        return Ok();
                    else
                        return BadRequest("Error al actualizar el campo.");
                }
                return BadRequest("Error al actualizar el campo. Propiedad vacia|?");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }



        [HttpPut("update-file/{id}")]
        public async Task<IActionResult> UpdateFile(string id, [FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No se ha proporcionado ningún archivo.");

                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                var basePath = Path.Combine("uploads", "fallecidos", id);
                var imageDirectory = Path.Combine(basePath, "image");
                var existingImagePath = Directory.GetFiles(imageDirectory, "perfil_*")
                                    .FirstOrDefault()
                                    ?? Path.Combine(imageDirectory, "perfil.jpg");

                // Generar un nuevo nombre de archivo con timestamp
                var timestamp = DateTime.Now.Ticks;
                var fileName = $"perfil_{timestamp}.jpg";
                var newImagePath = Path.Combine(imageDirectory, fileName);

                // Eliminar el archivo existente
                if (!string.IsNullOrEmpty(existingImagePath))
                {
                    System.IO.File.Delete(existingImagePath);
                }

                // Guardar el nuevo archivo
                Directory.CreateDirectory(Path.GetDirectoryName(newImagePath));
                using (var stream = new FileStream(newImagePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var baseUrl = Request.Host.Value.Contains("localhost")
    ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
    : $"{Request.Scheme}://{Request.Host}";

                return Ok(new
                {
                    message = "Imagen actualizada correctamente",
                    imageUrl = $"{baseUrl}/uploads/fallecidos/{id}/image/{fileName}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }


        // Endpoint específico para generar QR
        [HttpPost("generate-qr/{id:length(24)}")]
        public async Task<IActionResult> GenerateQR(string id)
        {
            try
            {
                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                var basePath = Path.Combine("uploads", "fallecidos", id);
                var baseUrl = Request.Host.Value.Contains("localhost")
    ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
    : $"{Request.Scheme}://{Request.Host}";
                var qrUrl = $"{baseUrl}/ser-querido/{id}";
                var qrPath = Path.Combine(basePath, "QR", "qr-code.png");

                Directory.CreateDirectory(Path.GetDirectoryName(qrPath));
                using (var qrGenerator = new QRCodeGenerator())
                {
                    var qrData = qrGenerator.CreateQrCode(qrUrl, QRCodeGenerator.ECCLevel.Q);
                    using (var qrCode = new PngByteQRCode(qrData))
                    {
                        var qrCodeBytes = qrCode.GetGraphic(20);
                        await System.IO.File.WriteAllBytesAsync(qrPath, qrCodeBytes);
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }


        [HttpDelete("delete/{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var usuario = await _userManager.FindByIdAsync(userId);

                if (usuario == null)
                {
                    return NotFound("Usuario no encontrado.");
                }

                // Verificar permisos de usuario
                if (usuario.FallecidosIds.Contains(id) || User.IsInRole("admin"))
                {
                    // Eliminar la carpeta del fallecido
                    var directoryPath = Path.Combine("uploads", "fallecidos", id);
                    if (Directory.Exists(directoryPath))
                    {
                        Directory.Delete(directoryPath, recursive: true);
                    }

                    // Eliminar el fallecido de la base de datos
                    await _fallecidoService.DeleteAsync(id);

                    // Eliminar el ID del fallecido de la lista del usuario
                    usuario.FallecidosIds.Remove(id);
                    var result = await _userManager.UpdateAsync(usuario);

                    if (result.Succeeded)
                    {
                        return NoContent();
                    }

                    return BadRequest(result.Errors);

                }
                else
                {
                    return Forbid("No tienes permiso para editar este fallecido.");
                }


            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("search/{busqueda}")]
        public async Task<ActionResult<List<object>>> SearchFallecidos(string busqueda)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(busqueda))
                    return BadRequest(new { error = "El término de búsqueda no puede estar vacío" });

                var fallecidos = await _fallecidoService.SearchFallecidosByNameAsync(busqueda);

                // Selecciona solo Id y Nombre del modelo existente
                return Ok(new
                {
                    Resultados = fallecidos.Select(f => new
                    {
                        Id = f.Id,
                        Nombre = f.Nombre
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                // Devuelve una respuesta de error BadRequest
                return BadRequest(new { error = $"Error interno del servidor: {ex.Message}" });

            }
        }


        [HttpDelete("delete-multimedia/{id:length(24)}")]
        public async Task<IActionResult> DeleteMultimedia(string id, [FromQuery] string fileUrl)
        {
            try
            {
                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                // Ruta completa del archivo
                string filePath = Path.Combine(Directory.GetCurrentDirectory(), fileUrl.TrimStart('/'));

                // Verificar si el archivo existe y eliminarlo
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    return NoContent();
                }
                else
                {
                    return NotFound("Archivo multimedia no encontrado.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }



        [HttpPost("add-multimedia/{id:length(24)}")]
        public async Task<IActionResult> AddMultimedia(string id, [FromForm] List<IFormFile> files, [FromQuery] string tipo)
        {
            try
            {
                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                var basePath = Path.Combine("uploads", "fallecidos", id, "multimedia");
                var targetPath = tipo.ToLower() == "galeria" ?
                    Path.Combine(basePath, "galeria") :
                    Path.Combine(basePath, "audio");

                Directory.CreateDirectory(targetPath);

                foreach (var file in files)
                {
                    var mimeType = file.ContentType.ToLower();
                    bool isValid = tipo.ToLower() switch
                    {
                        "galeria" => mimeType.StartsWith("image/") || mimeType == "video/mp4",
                        "voces" => mimeType.StartsWith("audio/"),
                        _ => false
                    };

                    if (!isValid)
                        return BadRequest($"Archivo no válido para el tipo {tipo}: {file.FileName}");

                    var filePath = Path.Combine(targetPath, file.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Error interno del servidor");
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }

        // Método helper para validación
        private async Task<(ApplicationUser user, Fallecido fallecido)> ValidateUserAndFallecido(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var usuario = await _userManager.FindByIdAsync(userId);

            if (usuario == null)
            {
                return (null, null);
            }

            // Verificar permisos de usuario
            if (usuario.FallecidosIds.Contains(id) || User.IsInRole("admin"))
            {
                var fallecido = await _fallecidoService.GetAsync(id);
                if (fallecido == null)
                    return (usuario, null);

                return (usuario, fallecido);
            }
            else
            {
                return (usuario, null);
            }

        }



        //Relacion


        [HttpPost("addrelacion/{id}")]
        public async Task<IActionResult> AddRelacion(string id, [FromBody] RelacionCreateModel model)
        {
            try
            {
                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                var relacion = new Relacion
                {
                    Fallecido1Id = model.Fallecido1Id,
                    Fallecido2Id = model.Fallecido2Id,
                    TipoRelacion1 = model.TipoRelacion1,
                    TipoRelacion2 = model.TipoRelacion2
                };

                await _fallecidoService.AddRelacionAsync(relacion);

                return Ok(relacion);

            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }
        }


        [HttpPut("updaterelacion/{id:length(24)}")]
        public async Task<IActionResult> UpdateRelacion(string id, [FromBody] RelacionCreateModel model)
        {

            try
            {
                var (usuario, fallecido) = await ValidateUserAndFallecido(id);
                if (usuario == null) return NotFound("Usuario no encontrado.");
                if (fallecido == null) return NotFound("Fallecido no encontrado.");

                var relacion = await _fallecidoService.GetRelacionByIdAsync(id);
                if (relacion == null)
                {
                    return BadRequest("Relación no encontrada");
                }
                relacion.TipoRelacion1 = model.TipoRelacion1;
                relacion.TipoRelacion2 = model.TipoRelacion2;
                relacion.Fallecido1Id = model.Fallecido1Id;
                relacion.Fallecido2Id = model.Fallecido2Id;
                await _fallecidoService.UpdateRelacionAsync(id, relacion);
                return Ok(relacion);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error interno del servidor: {ex.Message}");
            }

        }

        [HttpGet("getrelacion/{id:length(24)}")]
        [AllowAnonymous]

        public async Task<IActionResult> GetRelacion(string id)
        {
            var baseUrl = Request.Host.Value.Contains("localhost")
               ? $"{Request.Scheme}://localhost:{Environment.GetEnvironmentVariable("MYLOCAL_PORT")}"
               : $"{Request.Scheme}://{Request.Host}";
            var relacion = await _fallecidoService.GetRelacionByFallecidoIdAsync(id, baseUrl);

            return Ok(relacion);
        }

        [HttpDelete("deleterelacion/{id:length(24)}")]
        public async Task<IActionResult> DeleteRelacion(string id, string relacionId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var usuario = await _userManager.FindByIdAsync(userId);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado.");
            }

            if (usuario.FallecidosIds.Contains(id) || User.IsInRole("admin"))
            {
                var relacion = await _fallecidoService.GetRelacionByIdAsync(relacionId);
                if (relacion == null)
                {
                    return NotFound("Relación no encontrada.");
                }

                await _fallecidoService.DeleteRelacionAsync(relacionId);

                return Ok();
            }
            else
            {
                return Forbid("No tienes permiso para agregar una relación entre estos fallecidos.");

            }


        }

    }

    public class FallecidoCreateModel
    {
        public string Nombre { get; set; }
        public string Genero { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string LugarNacimiento { get; set; }
        public DateTime FechaFallecimiento { get; set; }
        public IFormFile ImagenFallecido { get; set; }
        public string LugarFallecimiento { get; set; }
        public string Biografia { get; set; }
        public string userId { get; set; }
        public List<IFormFile> Multimedias { get; set; }

    }

    public class FallecidoInfo
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string ImageUrl { get; set; }
        public string FechaFallecimiento { get; set; }
    }

    public class RelacionCreateModel
    {
        public string Fallecido1Id { get; set; }  // ID del primer fallecido
        public string Fallecido2Id { get; set; }  // ID del segundo fallecido
        public string TipoRelacion1 { get; set; }
        public string TipoRelacion2 { get; set; }
    }

}

