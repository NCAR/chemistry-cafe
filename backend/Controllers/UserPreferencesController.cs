using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserPreferencesController : ControllerBase
    {
        private UserPreferencesService userpreferencesService;

        //Injects sql data source setup in Program.cs
        public UserPreferencesController([FromServices] MySqlDataSource db)
        {
            this.userpreferencesService = new UserPreferencesService(db);
        }

        // GET: api/UserPreferences/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<UserPreferences>> Get()
        {
            return await userpreferencesService.GetUserPreferencesAsync();
        }

        // GET api/UserPreferences/5
        [HttpGet("{uuid}")]
        public async Task<UserPreferences?> Get(Guid uuid)
        {
            return await userpreferencesService.GetUserPreferencesAsync(uuid);
        }

        // POST api/UserPreferences/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] UserPreferences userPreferneces)
        {
            return await userpreferencesService.CreateUserPreferencesAsync(userPreferneces);
        }

        // PUT api/UserPreferences/5
        [HttpPut("update")]
        public async Task Put([FromBody] UserPreferences userpreferences)
        {
            await userpreferencesService.UpdateUserPreferencesAsync(userpreferences);
        }

        // DELETE api/UserPreferences/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await userpreferencesService.DeleteUserPreferencesAsync(uuid);
        }
    }
}
