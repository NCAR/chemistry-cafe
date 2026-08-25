using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;
using System.Diagnostics.CodeAnalysis;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/species")]
    public class SpeciesController : ControllerBase
    {
        private readonly SpeciesService _speciesService;

        [ExcludeFromCodeCoverage]
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
        public async Task<ActionResult<IEnumerable<SpeciesDto>>> GetAllSpecies([FromQuery] Guid? familyId = null)
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
            return Ok(speciesCollection.Select(s => s.ToDto()));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SpeciesDto>> GetSpecies(Guid id)
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

            return Ok(species.ToDto());
        }


        [HttpPost]
        public async Task<ActionResult<SpeciesDto>> CreateSpecies(SpeciesDto species, [FromQuery] Guid familyId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, createdSpecies) = await _speciesService.CreateSpeciesAsync(species.ToEntity(), familyId, nameIdentifier);
            if (createdSpecies == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                    QueryResult.OwnerNotFound => Unauthorized("User not found in database"),
                    QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' not found in database"),
                    QueryResult.DuplicateKeyError => BadRequest("One or more attributes have duplicate serialization keys"),
                    QueryResult.ValidationError => BadRequest("Constant concentration and constant mixing ratio are mutually exclusive"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return CreatedAtAction(
                nameof(CreateSpecies),
                new { id = createdSpecies.Id },
                createdSpecies.ToDto()
            );
        }


        [HttpPatch("{id}")]
        public async Task<ActionResult<SpeciesDto>> UpdateSpecies(Guid id, SpeciesDto species)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (result, updatedSpecies) = await _speciesService.UpdateSpeciesAsync(id, species.ToEntity(), nameIdentifier);
            if (updatedSpecies == null)
            {
                return result switch
                {
                    QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier"),
                    QueryResult.OwnerNotFound => Unauthorized("User not found in database"),
                    QueryResult.DuplicateKeyError => BadRequest("One or more attributes have duplicate serialization keys"),
                    QueryResult.ValidationError => BadRequest("Constant concentration and constant mixing ratio are mutually exclusive"),
                    QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                    _ => StatusCode(StatusCodes.Status500InternalServerError),
                };
            }

            return Ok(updatedSpecies.ToDto());
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
