using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagMechanismReactionListVersionController : ControllerBase
    {
        private TagMechanismReactionListVersionService tagMechanismReactionListVersionService;
        
        //Injects sql data source setup in Program.cs
        public TagMechanismReactionListVersionController([FromServices] MySqlDataSource db)
        {
            this.tagMechanismReactionListVersionService = new TagMechanismReactionListVersionService(db);
        }

        // GET: api/TagMechanismReactionListVersion/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<TagMechanismReactionListVersion>> Get()
        {
            return await tagMechanismReactionListVersionService.GetTagMechanismReactionListVersionsAsync();
        }

        // GET api/TagMechanismReactionListVersion/5
        [HttpGet("{uuid}")]
        public async Task<TagMechanismReactionListVersion?> Get(Guid uuid)
        {
            return await tagMechanismReactionListVersionService.GetTagMechanismReactionListVersionAsync(uuid);
        }

        // POST api/TagMechanismReactionListVersion/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] TagMechanismReactionListVersion newTagMechanismReactionListVersion)
        {
            return await tagMechanismReactionListVersionService.CreateTagMechanismReactionListVersionAsync(newTagMechanismReactionListVersion);
        }

        // PUT api/TagMechanismReactionListVersion/5
        [HttpPut("update")]
        public async Task Put([FromBody] TagMechanismReactionListVersion newTagMechanismReactionListVersion)
        {
            await tagMechanismReactionListVersionService.UpdateTagMechanismReactionListVersionAsync(newTagMechanismReactionListVersion);
        }

        // DELETE api/TagMechanismReactionListVersion/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await tagMechanismReactionListVersionService.DeleteTagMechanismReactionListVersionAsync(uuid);
        }
    }
}
