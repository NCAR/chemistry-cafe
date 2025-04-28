using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/phases")]
    public class PhaseController : ControllerBase
    {
        private readonly PhaseService _phaseService;

        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public PhaseController(PhaseService phaseService)
        {
            _phaseService = phaseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Phase>>> GetPhases([FromQuery] Guid? familyId = null)
        {
            var (result, phases) = await _phaseService.GetAllPhasesAsync(familyId);

            return result switch
            {
                QueryResult.Success => Ok(phases),
                QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' was not found in the database"),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Phase>> GetPhase(Guid id)
        {
            var (result, phase) = await _phaseService.GetPhaseAsync(id);
            return result switch
            {
                QueryResult.Success => Ok(phase),
                _ => NotFound($"Phase with id '{id}' was not found in the database."),
            };
        }

        [HttpPost]
        public async Task<ActionResult<Phase>> CreatePhase(Phase phase, [FromQuery] Guid familyId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, createdPhase) = await _phaseService.CreatePhaseAsync(phase, familyId, nameIdentifier);
            if (createdPhase == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                    QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' not found in database"),
                    QueryResult.ChildRelationNotFound => NotFound("One or more species were either not found or are not in this family"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return CreatedAtAction(
                nameof(GetPhase),
                new { id = createdPhase.Id },
                createdPhase
            );
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<Phase>> UpdatePhase(Guid id, Phase phase)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, updatedPhase) = await _phaseService.UpdatePhaseAsync(id, phase, nameIdentifier);
            if (updatedPhase == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                    QueryResult.NotFound => NotFound($"Phase with id '{id}' was not found in the database"),
                    QueryResult.DuplicateKeyError => BadRequest("One or more attributes have duplicate json keys"),
                    QueryResult.ChildRelationNotFound => NotFound("One or more species were either not found or are not in this family"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return Ok(updatedPhase);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhase(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var result = await _phaseService.DeletePhaseAsync(id, nameIdentifier);

            return result switch
            {
                QueryResult.Success => NoContent(),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                QueryResult.NotFound => NotFound($"Phase with id '{id}' was not found in the database"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }
    }
}
