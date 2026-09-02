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
    }
}
