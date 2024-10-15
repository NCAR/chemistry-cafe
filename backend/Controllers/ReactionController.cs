using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReactionController : ControllerBase
    {
        private ReactionService reactionService;

        //Injects sql data source setup in Program.cs
        public ReactionController([FromServices] MySqlDataSource db)
        {
            this.reactionService = new ReactionService(db);
        }

        // GET: api/Reaction/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<Reaction>> Get()
        {
            return await reactionService.GetReactionsAsync();
        }

        // GET api/Reaction/5
        [HttpGet("{uuid}")]
        public async Task<Reaction?> Get(Guid uuid)
        {
            return await reactionService.GetReactionAsync(uuid);
        }

        // GET api/Reaction/String/5
        [HttpGet("String/{uuid}")]
        public async Task<String?> GetString(Guid uuid)
        {
            return await reactionService.GetReactionStringAsync(uuid);
        }

        // GET api/Reaction/TagMechanism/5
        [HttpGet("TagMechanism/{tag_mechanism_uuid}")]
        public async Task<IReadOnlyList<Reaction>> GetTags(Guid tag_mechanism_uuid)
        {
            return await reactionService.GetTags(tag_mechanism_uuid);
        }

        // POST api/Reaction/create
        [HttpPost("create")]

        public async Task<Guid> Create([FromBody] string type)
        {
            return await reactionService.CreateReactionAsync(type);
        }

        // PUT api/Reaction/5
        [HttpPut("update")]
        public async Task Put([FromBody] Reaction reaction)
        {
            await reactionService.UpdateReactionAsync(reaction);
        }

        // DELETE api/Reaction/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await reactionService.DeleteReactionAsync(uuid);
        }
    }
}
