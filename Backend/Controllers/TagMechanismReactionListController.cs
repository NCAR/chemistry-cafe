using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagMechanismReactionListController : ControllerBase
    {
        private TagMechanismReactionListService tagMechReationListService;
        
        //Injects sql data source setup in Program.cs
        public TagMechanismReactionListController([FromServices] MySqlDataSource db)
        {
            this.tagMechReationListService = new TagMechanismReactionListService(db);
        }

        // GET: api/TagMechanismReaction/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<TagMechanismReactionList>> Get()
        {
            return await tagMechReationListService.GetTagMechanismReactionsAsync();
        }

        // GET api/TagMechanismReaction/5
        [HttpGet("{uuid}")]
        public async Task<TagMechanismReactionList?> Get(Guid uuid)
        {
            return await tagMechReationListService.GetTagMechanismReactionAsync(uuid);
        }

        // POST api/TagMechanismReaction/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] TagMechanismReactionList newTagMechanismReaction)
        {
            return await tagMechReationListService.CreateTagMechanismReactionAsync(newTagMechanismReaction);
        }

        // PUT api/TagMechanismReaction/5
        [HttpPut("update")]
        public async Task Put([FromBody] TagMechanismReactionList newTagMechanismReaction)
        {
            await tagMechReationListService.UpdateTagMechanismReactionAsync(newTagMechanismReaction);
        }

        // DELETE api/TagMechanismReaction/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await tagMechReationListService.DeleteTagMechanismReactionAsync(uuid);
        }
    }
}
