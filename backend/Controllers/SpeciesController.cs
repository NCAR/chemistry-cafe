using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/species")]
    public class SpeciesController : ControllerBase
    {
        private readonly SpeciesService _speciesService;

        public SpeciesController(SpeciesService speciesService)
        {
            _speciesService = speciesService;
        }

        // GET: api/Species
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Species>>> GetSpecies()
        {
            var species = await _speciesService.GetSpeciesAsync();
            return Ok(species);
        }

        // GET: api/Species/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Species>> GetSpecies(Guid id)
        {
            var species = await _speciesService.GetSpeciesAsync(id);

            if (species == null)
            {
                return NotFound();
            }

            return Ok(species);
        }

        // GET: api/Species/family/5
        [HttpGet("family/{familyId}")]
        public async Task<ActionResult<IEnumerable<Species>>> GetSpeciesByFamilyId(Guid familyId)
        {
            var species = await _speciesService.GetSpeciesByFamilyIdAsync(familyId);
            return Ok(species);
        }

        // POST: api/Species
        [HttpPost]
        public async Task<ActionResult<Species>> CreateSpecies(Species species)
        {
            var createdSpecies = await _speciesService.CreateSpeciesAsync(species);
            return CreatedAtAction(nameof(GetSpecies), new { id = createdSpecies.Id }, createdSpecies);
        }

        // PUT: api/Species/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSpecies(Guid id, Species species)
        {
            if (id != species.Id)
            {
                return BadRequest();
            }

            await _speciesService.UpdateSpeciesAsync(species);

            return NoContent();
        }

        // DELETE: api/Species/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecies(Guid id)
        {
            await _speciesService.DeleteSpeciesAsync(id);
            return NoContent();
        }
    }
}
