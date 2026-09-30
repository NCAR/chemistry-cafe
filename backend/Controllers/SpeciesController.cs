using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/species")]
    public class SpeciesController(SpeciesService speciesService,UserService userService) : BaseHelperController(userService)
    {
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpeciesDto>>> GetAllSpecies([FromQuery] Guid? familyId = null)
        {
            var (result, speciesCollection) = await speciesService.GetAllSpeciesAsync(familyId);
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
            var (result, species) = await speciesService.GetSpeciesAsync(id);

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
