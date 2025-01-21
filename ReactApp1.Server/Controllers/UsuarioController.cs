using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity.UI.Services;
using System.Web;

namespace ReactApp1.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;

        public UsuariosController(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager, IConfiguration configuration, IEmailSender emailSender)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _emailSender = emailSender;
        }

        // Login de usuario y generación de token JWT
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            var user = await _userManager.FindByEmailAsync(loginModel.Email);

            if (user != null && await _userManager.CheckPasswordAsync(user, loginModel.Password))
            {
                var token = await GenerateJwtToken(user);

                // Verifica si el token es nulo o vacío
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("❌ Error: Token vacío");
                    return BadRequest(new { error = "No se pudo generar el token de autenticación" });
                }

                return Ok(new { token });
            }

            return Unauthorized("Email o contraseña incorrectos");
        }


        // Nuevo método para verificar el correo electrónico
        [HttpGet("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("Usuario no encontrado.");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                // El correo ha sido verificado,redireccionar con un mensaje
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var redirectUrl = $"{baseUrl}/dashboard?emailVerified=true"; // Ruta en tu aplicación React
                return Redirect(redirectUrl);
            }
            else
            {
                return BadRequest("No se pudo verificar el correo electrónico.");
            }
        }



        // Obtiene información del usuario autenticado
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<object>> GetCurrentUser()
        {
            try
            {
                Console.WriteLine("Iniciando GetCurrentUser");
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"UserId obtenido: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    Console.WriteLine("UserId es nulo o vacío");
                    return Unauthorized("User ID claim not found.");
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    Console.WriteLine($"Usuario con ID {userId} no encontrado");
                    return NotFound($"User with ID {userId} not found.");
                }

                // Obtener los roles del usuario
                var roles = await _userManager.GetRolesAsync(user);

                Console.WriteLine($"Usuario encontrado: {user.Email}");

                // Devuelve el usuario con los roles incluidos
                return Ok(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.EmailConfirmed,
                    user.CreatedOn,
                    user.PhoneNumber,
                    user.Nombre,
                    user.FallecidosIds,
                    Roles = roles // Añade los roles aquí
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetCurrentUser: {ex}");
                Console.WriteLine("❌ Error: Token vacío");
                return BadRequest($"Internal server error: {ex.Message}" );
            }
        }


        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                    return Unauthorized("User not found.");

                var token = await GenerateJwtToken(user);

                return Ok(new { token, user });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al refrescar el token: {ex}");
                return BadRequest(new { error = "No se pudo refrescar el token de autenticación" });
            }
        }

        // Obtiene todos los usuarios (Solo admin)
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<object>>> Get()
        {
            var usuarios = _userManager.Users.ToList();
            var usuariosConRoles = new List<object>();

            foreach (var usuario in usuarios)
            {
                var roles = await _userManager.GetRolesAsync(usuario);
                usuariosConRoles.Add(new
                {
                   usuario.Id,
                   usuario.Nombre,
                   usuario.Email,
                   usuario.FallecidosIds,
                   Roles = roles
                });
            }

            return Ok(usuariosConRoles);
        }


        // Obtiene un usuario por su ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApplicationUser>> Get(string id)
        {
            var usuario = await _userManager.FindByIdAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }
            return Ok(usuario);
        }

        // Modificar el método Create para enviar correo de verificación
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            try
            {
                // Generar un nombre de usuario basado en el email (antes del '@')
                var baseUserName = model.Email.Split('@')[0];
                var userName = baseUserName;
                // Verificar si ya existe un usuario con este nombre de usuario
                int counter = 1;
                while (await _userManager.FindByNameAsync(userName) != null)
                {
                    userName = $"{baseUserName}{counter}";
                    counter++;
                }

                var newUser = new ApplicationUser
                {
                    Email = model.Email,
                    Nombre = model.Nombre,
                    UserName = userName
                };

                var result = await _userManager.CreateAsync(newUser, model.Password);
                if (result.Succeeded)
                {
                    // Asignar rol 
                    await _userManager.AddToRoleAsync(newUser, model.Role);

                    if (model.SkipEmailVerification)
                    {
                        // Si skipEmailVerification es true, marcar el email como verificado automáticamente
                        newUser.EmailConfirmed = true;
                        await _userManager.UpdateAsync(newUser);
                        return Ok();
                    }
                    else
                    {
                        // Generar token de verificación de correo electrónico
                        var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
                        var encodedToken = HttpUtility.UrlEncode(token);

                        // Construir URL de verificación
                        var verificationUrl = $"{Request.Scheme}://{Request.Host}/api/usuarios/verify-email?userId={newUser.Id}&token={encodedToken}";
                        var htmlMessage = $"<html><body><p>Por favor confirma tu cuenta haciendo clic en este enlace: <a href='{verificationUrl}'>Verificar correo electrónico</a></p></body></html>";
                        Console.WriteLine(htmlMessage);

                        // Enviar correo de verificación
                        await _emailSender.SendEmailAsync(newUser.Email, "Confirma tu correo electrónico", htmlMessage);

                        var baseUrl = $"{Request.Scheme}://{Request.Host}";
                        var redirectUrl = $"{baseUrl}/dashboard"; // Ruta en tu aplicación React

                        // Redirigir al navegador
                        return Redirect(redirectUrl);
                    }
                }

                return BadRequest(new { message = "Error al crear el usuario.", errors = result.Errors.Select(e => e.Description) });
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error en el registro: {ex}");

                // Return a more generic error message
                return BadRequest($"Ocurrió un error interno en el servidor." );
            }
        }

        // Actualiza un usuario existente
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ApplicationUser updatedUser)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Solo el administrador o el propio usuario pueden actualizar
            if (User.IsInRole("admin") || userId == id)
            {
                // Actualizar solo los campos que han cambiado
                if (!string.IsNullOrWhiteSpace(updatedUser.Nombre))
                {
                    user.Nombre = updatedUser.Nombre;
                }

                if (!string.IsNullOrWhiteSpace(updatedUser.Email))
                {
                    user.Email = updatedUser.Email;
                }

                var result = await _userManager.UpdateAsync(user);

                if (result.Succeeded)
                {
                    return NoContent();
                }

                return BadRequest(result.Errors);
            }

            return Forbid();
        }


        // Elimina un usuario
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var usuario = await _userManager.FindByIdAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            // Solo el administrador o el propio usuario pueden eliminar
            if (User.IsInRole("admin") || userId == id)
            {
                var result = await _userManager.DeleteAsync(usuario);

                if (result.Succeeded)
                {
                    return NoContent();
                }

                return BadRequest(result.Errors);
            }

            return Forbid();
        }

        // Método privado para generar el token JWT
        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            try
            {
                Console.WriteLine("🎟️ Iniciando generación de JWT para usuario: " + user.Email);

                // Verificar configuración
                var jwtKey = _configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_KEY");
                var jwtIssuer = _configuration["Jwt:Issuer"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER");
                var jwtAudience = _configuration["Jwt:Audience"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE");
                var jwtExpireMinutes = _configuration["Jwt:ExpireMinutes"] ?? Environment.GetEnvironmentVariable("JWT_EXPIRE_MINUTES");

                Console.WriteLine($"📝 Configuración JWT encontrada:");
                Console.WriteLine($"- Issuer: {!string.IsNullOrEmpty(jwtIssuer)}");
                Console.WriteLine($"- Audience: {!string.IsNullOrEmpty(jwtAudience)}");
                Console.WriteLine($"- Key: {!string.IsNullOrEmpty(jwtKey)}");
                Console.WriteLine($"- Expire Minutes: {jwtExpireMinutes}");

                if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) ||
                    string.IsNullOrEmpty(jwtAudience) || string.IsNullOrEmpty(jwtExpireMinutes))
                {
                    throw new InvalidOperationException("Configuración JWT incompleta");
                }

                // Crear claims
                var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id)
        };

                // Agregar roles
                Console.WriteLine("👥 Obteniendo roles del usuario...");
                var roles = await _userManager.GetRolesAsync(user);
                Console.WriteLine($"Roles encontrados: {string.Join(", ", roles)}");

                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                // Crear credenciales
                Console.WriteLine("🔐 Generando credenciales...");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                // Configurar expiración
                var minutes = Convert.ToDouble(jwtExpireMinutes);
                var expires = DateTime.UtcNow.AddMinutes(minutes);
                Console.WriteLine($"⏰ Token expirará en: {minutes} minutos");

                // Generar token
                Console.WriteLine("🔄 Generando token JWT...");
                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: expires,
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                Console.WriteLine("✅ Token JWT generado exitosamente");

                return tokenString;
            }
            catch (Exception ex)
            {
                Console.WriteLine("🚨 ERROR al generar el token JWT:");
                Console.WriteLine($"Mensaje: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                    Console.WriteLine($"Inner Stack Trace: {ex.InnerException.StackTrace}");
                }

                return string.Empty;
            }
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user != null)
            {
                // Generamos el token usando Identity
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = HttpUtility.UrlEncode(token);

                // Construir URL de restablecimiento
                var resetUrl = $"{Request.Scheme}://{Request.Host}/api/usuarios/reset-password?token={encodedToken}&email={HttpUtility.UrlEncode(email)}";

                // Usar el mismo EmailSender que usas para la confirmación de correo
                await _emailSender.SendEmailAsync(
                    email,
                    "Recuperar Contraseña",
                    $"<html><body><p>Para recuperar tu contraseña, haz clic aquí: <a href='{resetUrl}'>Recuperar contraseña</a></p></body></html>"
                );
            }

            // Siempre devolvemos OK por seguridad
            return Ok(new { message = "Si el correo existe, recibirás las instrucciones para recuperar tu contraseña." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromQuery] string token, [FromQuery] string email, [FromBody] string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return BadRequest("Usuario no encontrado");
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (result.Succeeded)
            {
                return Ok(new { message = "Contraseña actualizada correctamente" });
            }

            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }


    }
}
