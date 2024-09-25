using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagMechanismSpeciesListVersionController : ControllerBase
    {
        private TagMechanismSpeciesListVersionService tagMechanismSpeciesListVersionService;
        
        //Injects sql data source setup in Program.cs
        public TagMechanismSpeciesListVersionController([FromServices] MySqlDataSource db)
        {
            this.tagMechanismSpeciesListVersionService = new TagMechanismSpeciesListVersionService(db);
        }

        // GET: api/TagMechanismSpeciesListVersion/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<TagMechanismSpeciesListVersion>> Get()
        {
            return await tagMechanismSpeciesListVersionService.GetTagMechanismSpeciesListVersionsAsync();
        }

        // GET api/TagMechanismSpeciesListVersion/5
        [HttpGet("{uuid}")]
        public async Task<TagMechanismSpeciesListVersion?> Get(Guid uuid)
        {
            return await tagMechanismSpeciesListVersionService.GetTagMechanismSpeciesListVersionAsync(uuid);
        }

        // POST api/TagMechanismSpeciesListVersion/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] TagMechanismSpeciesListVersion newTagMechanismSpeciesListVersion)
        {
            return await tagMechanismSpeciesListVersionService.CreateTagMechanismSpeciesListVersionAsync(newTagMechanismSpeciesListVersion);
        }

        // PUT api/TagMechanismSpeciesListVersion/5
        [HttpPut("update")]
        public async Task Put([FromBody] TagMechanismSpeciesListVersion newTagMechanismSpeciesListVersion)
        {
            await tagMechanismSpeciesListVersionService.UpdateTagMechanismSpeciesListVersionAsync(newTagMechanismSpeciesListVersion);
        }

        // DELETE api/TagMechanismSpeciesListVersion/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await tagMechanismSpeciesListVersionService.DeleteTagMechanismSpeciesListVersionAsync(uuid);
        }
    }
}
