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

        [HttpPost]
        public async Task<ActionResult<Reaction>> CreateReaction(Reaction reaction, [FromQuery] Guid familyId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, createdReaction) = await _reactionService.CreateReactionAsync(reaction, familyId, nameIdentifier);
            if (createdReaction == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                    QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' not found in database"),
                    QueryResult.DuplicateKeyError => BadRequest("One or more attributes have duplicate json keys"),
                    QueryResult.ChildRelationNotFound => NotFound("One or more reactant/product species were either not found or are not in this family"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return CreatedAtAction(
                nameof(GetReaction),
                new { id = createdReaction.Id },
                createdReaction
            );
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<Reaction>> UpdateReaction(Guid id, Reaction reaction)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, updatedReaction) = await _reactionService.UpdateReactionAsync(id, reaction, nameIdentifier);
            if (updatedReaction == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                    QueryResult.NotFound => NotFound($"Reaction with id '{id}' was not found in the database"),
                    QueryResult.DuplicateKeyError => BadRequest("One or more attributes have duplicate json keys"),
                    QueryResult.ChildRelationNotFound => NotFound("One or more reactant/product species were either not found or are not in this family"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return Ok(updatedReaction);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReaction(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var result = await _reactionService.DeleteReactionAsync(id, nameIdentifier);

            return result switch
            {
                QueryResult.Success => NoContent(),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                QueryResult.NotFound => NotFound($"Reaction with id '{id}' was not found in the database"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }
    }
}
