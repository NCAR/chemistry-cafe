using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private UserService userService;

        //Injects sql data source setup in Program.cs
        public UserController([FromServices] MySqlDataSource db)
        {
            this.userService = new UserService(db);
        }

        // GET: api/User/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<User>> Get()
        {
            return await userService.GetUsersAsync();
        }

        // GET api/User/5
        [HttpGet("{uuid}")]
        public async Task<User?> Get(Guid uuid)
        {
            return await userService.GetUserAsync(uuid);
        }

        // GET api/User/email/{email}
        [HttpGet("email={email}")]
        public async Task<User?> Get(string email)
        {
            return await userService.GetUserAsync(email);
        }

        // POST api/User/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] string log_in_info)
        {
            return await userService.CreateUserAsync(log_in_info);
        }

        // PUT api/User/5
        [HttpPut("update")]
        public async Task Put([FromBody] User user)
        {
            await userService.UpdateUserAsync(user);
        }

        // DELETE api/User/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await userService.DeleteUserAsync(uuid);
        }
    }
}
