using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/reactions")]
    public class ReactionController(ReactionService reactionService,UserService userService) : BaseHelperController(userService)
    {
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactions([FromQuery] Guid? familyId = null)
        {
            var (result, reactions) = await reactionService.GetAllReactionsAsync(familyId);

            return result switch
            {
                QueryResult.Success => Ok(reactions),
                QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' was not found in the database"),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Reaction>> GetReaction(Guid id)
        {
            var (result, reaction) = await reactionService.GetReactionAsync(id);
            return result switch
            {
                QueryResult.Success => Ok(reaction),
                _ => NotFound($"Reaction with id '{id}' was not found in the database."),
            };
        }
    }
}
