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
        public async Task<ActionResult<IEnumerable<Species>>> GetAllSpecies()
        {
            var (_, speciesCollection) = await _speciesService.GetAllSpeciesAsync();
            return Ok(speciesCollection);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Species>> GetSpecies(Guid id)
        {
            var (result, species) = await _speciesService.GetSpeciesAsync(id);
            return result switch
            {
                QueryResult.Success => Ok(species),
                _ => NotFound(),
            };
        }


        [HttpPost]
        public async Task<ActionResult<Species>> CreateSpecies(Species species, [FromQuery] string familyId)
        {
            Guid parsedFamilyId;
            bool isValidFamilyId = Guid.TryParse(familyId, out parsedFamilyId);
            if (!isValidFamilyId)
            {
                return BadRequest("Invalid UUID format for familyId");
            }

            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not logged in");
            }

            var (result, createdSpecies) = await _speciesService.CreateSpeciesAsync(species, parsedFamilyId, nameIdentifier);
            if (createdSpecies == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier"),
                    QueryResult.OwnerNotFound => NotFound("User not found in database"),
                    QueryResult.ParentRelationNotFound => NotFound("Family not found in database"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status403Forbidden),
                };
            }

            return CreatedAtAction(
                nameof(CreateSpecies),
                new { id = createdSpecies.Id },
                createdSpecies
            );
        }


        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateSpecies(Guid id, Species species)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not logged in");
            }

            var result = await _speciesService.UpdateSpeciesAsync(id, species, nameIdentifier);

            return result switch
            {
                QueryResult.Success => NoContent(),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier"),
                QueryResult.OwnerNotFound => NotFound("User not found in database"),
                _ => StatusCode(StatusCodes.Status403Forbidden),
            };
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
                return Unauthorized("User is not logged in");
            }

            var result = await _speciesService.DeleteSpeciesAsync(id, nameIdentifier);
            return result switch
            {
                QueryResult.Success => NoContent(),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier"),
                QueryResult.OwnerNotFound => NotFound("User not found in database"),
                QueryResult.NotFound => NotFound("Given Species id not found in database"),
                _ => StatusCode(StatusCodes.Status403Forbidden),
            };
        }
    }
}
