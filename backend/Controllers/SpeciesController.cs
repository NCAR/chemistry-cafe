using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/species")]
    public class SpeciesController : ControllerBase
    {
        private readonly SpeciesService _speciesService;

        /* virtual for mocking purposes */
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public SpeciesController(SpeciesService speciesService)
        {
            _speciesService = speciesService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Species>>> GetAllSpecies([FromQuery] Guid? familyId = null)
        {
            var (result, speciesCollection) = await _speciesService.GetAllSpeciesAsync(familyId);
            if (speciesCollection == null)
            {
                return result switch
                {
                    QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' was not found in the database."),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }
            return Ok(speciesCollection);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Species>> GetSpecies(Guid id)
        {
            var (result, species) = await _speciesService.GetSpeciesAsync(id);

            if (species == null)
            {
                return result switch
                {
                    QueryResult.NotFound => NotFound($"Species with id '{id}' was not found in the database."),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return Ok(species);
        }


        [HttpPost]
        public async Task<ActionResult<Species>> CreateSpecies(Species species, [FromQuery] Guid familyId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, createdSpecies) = await _speciesService.CreateSpeciesAsync(species, familyId, nameIdentifier);
            if (createdSpecies == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("User not found in database"),
                    QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' not found in database"),
                    QueryResult.DuplicateKeyError => BadRequest("One or more attributes have duplicate serialization keys"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return CreatedAtAction(
                nameof(CreateSpecies),
                new { id = createdSpecies.Id },
                createdSpecies
            );
        }


        [HttpPatch("{id}")]
        public async Task<ActionResult<Species>> UpdateSpecies(Guid id, Species species)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, updatedSpecies) = await _speciesService.UpdateSpeciesAsync(id, species, nameIdentifier);
            if (updatedSpecies == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier"),
                    QueryResult.OwnerNotFound => Unauthorized("User not found in database"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return Ok(updatedSpecies);
        }

        /// <summary>
        /// Deletes a given family if it is attributed to the current user
        /// </summary>
        /// <param name="id">Database ID of the family to delete</param>
        /// <returns>HTTP result</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecies(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var result = await _speciesService.DeleteSpeciesAsync(id, nameIdentifier);
            return result switch
            {
                QueryResult.Success => NoContent(),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier"),
                QueryResult.OwnerNotFound => Unauthorized("User not found in database"),
                QueryResult.NotFound => NotFound("Given Species id not found in database"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }
    }
}
