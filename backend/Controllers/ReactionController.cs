using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using System.Diagnostics.CodeAnalysis;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/reactions")]
    public class ReactionController : ControllerBase
    {
        private readonly ReactionService _reactionService;

        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public ReactionController(ReactionService reactionService)
        {
            _reactionService = reactionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactions([FromQuery] Guid? familyId = null)
        {
            var (result, reactions) = await _reactionService.GetAllReactionsAsync(familyId);

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
            var (result, reaction) = await _reactionService.GetReactionAsync(id);
            return result switch
            {
                QueryResult.Success => Ok(reaction),
                _ => NotFound($"Reaction with id '{id}' was not found in the database."),
            };
        }
    }
}
