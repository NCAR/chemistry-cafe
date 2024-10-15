using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagMechanismSpeciesListController : ControllerBase
    {
        private TagMechanismSpeciesListService tagMechSpeciesList;
        
        //Injects sql data source setup in Program.cs
        public TagMechanismSpeciesListController([FromServices] MySqlDataSource db)
        {
            this.tagMechSpeciesList = new TagMechanismSpeciesListService(db);
        }

        // GET: api/TagMechanismSpecies/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<TagMechanismSpeciesList>> Get()
        {
            return await tagMechSpeciesList.GetTagMechanismSpeciessAsync();
        }

        // GET api/TagMechanismSpecies/5
        [HttpGet("{uuid}")]
        public async Task<TagMechanismSpeciesList?> Get(Guid uuid)
        {
            return await tagMechSpeciesList.GetTagMechanismSpeciesAsync(uuid);
        }

        // POST api/TagMechanismSpecies/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] TagMechanismSpeciesList newTagMechanismSpecies)
        {
            return await tagMechSpeciesList.CreateTagMechanismSpeciesAsync(newTagMechanismSpecies);
        }

        // PUT api/TagMechanismSpecies/5
        [HttpPut("update")]
        public async Task Put([FromBody] TagMechanismSpeciesList newTagMechanismSpecies)
        {
            await tagMechSpeciesList.UpdateTagMechanismSpeciesAsync(newTagMechanismSpecies);
        }

        // DELETE api/TagMechanismSpecies/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await tagMechSpeciesList.DeleteTagMechanismSpeciesAsync(uuid);
        }
    }
}
