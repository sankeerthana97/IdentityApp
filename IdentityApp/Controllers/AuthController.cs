using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Models;
using TaskManager.Services;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // ... [existing code] ...

        [HttpPost("cookie-login")]
        public async Task<IActionResult> CookieLogin([FromBody] LoginModel model)
        {
            var result = await _signInManager.PasswordSignInAsync(
                model.Email, model.Password, false, false);

            if (!result.Succeeded) return Unauthorized();

            // Generate cookie authentication
            var user = await _userManager.FindByEmailAsync(model.Email);
            var principal = await _signInManager.CreateUserPrincipalAsync(user);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Ok(new { message = "Cookie login successful" });
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("test-jwt")]
        public IActionResult TestJwt() => Ok("JWT works!");

        [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
        [HttpGet("test-cookie")]
        public IActionResult TestCookie() => Ok("Cookie works!");
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}