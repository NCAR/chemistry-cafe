using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FamilyController : ControllerBase
    {
        private FamilyService familyService;

        //Injects sql data source setup in Program.cs
        public FamilyController([FromServices] MySqlDataSource db)
        {
            this.familyService = new FamilyService(db);
        }

        // GET: api/Family/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<Family>> Get()
        {
            return await familyService.GetFamiliesAsync();
        }

        // GET api/Family/5
        [HttpGet("{uuid}")]
        public async Task<Family?> Get(Guid uuid)
        {
            return await familyService.GetFamilyAsync(uuid);
        }

        // POST api/Family/create
        [HttpPost("create")]
        public async Task<Family> Create([FromBody] string name)
        {
            return await familyService.CreateFamilyAsync(name);
        }

        // PUT api/Family/5
        [HttpPut("update")]
        public async Task Put([FromBody] Family family)
        {
            await familyService.UpdateFamilyAsync(family);
        }

        // DELETE api/Family/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await familyService.DeleteFamilyAsync(uuid);
        }
    }
}
