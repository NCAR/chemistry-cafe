using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/mechanisms")]
    public class MechanismController : ControllerBase
    {
        private readonly ChemistryDbContext _context;
        private readonly MechanismService _mechanismService;

        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public MechanismController(ChemistryDbContext context, MechanismService mechanismService)
        {
            _context = context;
            _mechanismService = mechanismService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanisms([FromQuery] Guid? familyId = null)
        {
            var (result, mechanismCollection) = await _mechanismService.GetAllMechanismsAsync(familyId);
            if (mechanismCollection == null)
            {
                return NotFound($"Family with id '{familyId}' was not found in the database.");
            }

            return Ok(mechanismCollection);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mechanism>> GetMechanism(Guid id)
        {
            var (result, mechanism) = await _mechanismService.GetMechanismAsync(id);

            if (mechanism == null)
            {
                return NotFound($"Mechanism with id '{id}' was not found in the database.");
            }

            return Ok(mechanism);
        }

        [HttpPost]
        public async Task<ActionResult<Mechanism>> CreateMechanism(Mechanism mechanism, [FromQuery] Guid familyId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, createdMechanism) = await _mechanismService.CreateMechanismAsync(mechanism, familyId, nameIdentifier);
            if (createdMechanism == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("User not found in database"),
                    QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' not found in database"),
                    QueryResult.ChildRelationNotFound => NotFound("One or more species, reactions, or phases were either not found or are not in this family"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return CreatedAtAction(
                nameof(GetMechanism),
                new { id = createdMechanism.Id },
                createdMechanism
            );
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<Mechanism>> UpdateMechanism(Guid id, Mechanism mechanism)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, updatedMechanism) = await _mechanismService.UpdateMechanismAsync(id, mechanism, nameIdentifier);
            if (updatedMechanism == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                    QueryResult.NotFound => NotFound($"Mechanism with id '{id}' was not found in the database"),
                    QueryResult.ChildRelationNotFound => NotFound("One or more species, reactions, or phases were either not found or are not in this family"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return Ok(updatedMechanism);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMechanism(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var result = await _mechanismService.DeleteMechanismAsync(id, nameIdentifier);
            
            return result switch
            {
                QueryResult.Success => NoContent(),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("Current user not found in database"),
                QueryResult.NotFound => NotFound($"Mechanism with id '{id}' was not found in the database"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }
    }
}
