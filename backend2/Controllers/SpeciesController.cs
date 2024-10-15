using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpeciesController : ControllerBase
    {
        private SpeciesService speciesService;

        //Injects sql data source setup in Program.cs
        public SpeciesController([FromServices] MySqlDataSource db)
        {
            this.speciesService = new SpeciesService(db);
        }

        // GET: api/Species/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<Species>> Get()
        {
            return await speciesService.GetSpeciesAsync();
        }

        // GET api/Species/TagMechanism/5
        [HttpGet("TagMechanism/{tag_mechanism_uuid}")]
        public async Task<IReadOnlyList<Species>> GetTags(Guid tag_mechanism_uuid)
        {
            return await speciesService.GetTags(tag_mechanism_uuid);
        }

        // GET api/Species/5
        [HttpGet("{uuid}")]
        public async Task<Species?> Get(Guid uuid)
        {
            return await speciesService.GetSpeciesAsync(uuid);
        }

        // POST api/Species/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] string type)
        {
            return await speciesService.CreateSpeciesAsync(type);
        }

        // PUT api/Species/5
        [HttpPut("update")]
        public async Task Put([FromBody] Species species)
        {
            await speciesService.UpdateSpeciesAsync(species);
        }

        // DELETE api/Species/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await speciesService.DeleteSpeciesAsync(uuid);
        }
    }
}
