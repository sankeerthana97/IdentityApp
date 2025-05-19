using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using TaskManager.Models;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private readonly AppDbContext _context;

        public TasksController(IMemoryCache cache, AppDbContext context)
        {
            _cache = cache;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetTasks()
        {
            if (!_cache.TryGetValue("tasks", out List<Task> tasks))
            {
                tasks = _context.Tasks.ToList();
                _cache.Set("tasks", tasks, TimeSpan.FromMinutes(1));
            }
            return Ok(tasks);
        }

        [HttpPost]
        [Authorize(Policy = "Admin", AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public IActionResult AddTask([FromBody] string description)
        {
            var task = new Task { Description = description };
            _context.Tasks.Add(task);
            _context.SaveChanges();
            _cache.Remove("tasks");
            return Ok(task);
        }
    }
}