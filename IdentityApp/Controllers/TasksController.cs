using Microsoft.AspNetCore.Mvc;

namespace IdentityApp.Controllers
{
    public class TasksController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
