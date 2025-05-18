using Microsoft.AspNetCore.Mvc;

namespace IdentityApp.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
