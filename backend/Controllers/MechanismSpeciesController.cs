using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/mechanismspecies")]
    public class MechanismSpeciesController : ControllerBase
    {
        private readonly MechanismSpeciesService _mechanismSpeciesService;

        public MechanismSpeciesController(MechanismSpeciesService mechanismSpeciesService)
        {
            _mechanismSpeciesService = mechanismSpeciesService;
        }

        
        // GET: api/MechanismSpecies/mechanism/5
        [HttpGet("mechanism/{mechanismId}")]
        public async Task<ActionResult<IEnumerable<Species>>> GetSpeciesByMechanismId(Guid mechanismId)
        {
            var mechanismSpeciesList = await _mechanismSpeciesService.GetMechanismSpeciesByMechanismIdAsync(mechanismId);
            var speciesList = mechanismSpeciesList.Select(ms => ms.Species).ToList();
            return Ok(speciesList);
        }

        // POST: api/MechanismSpecies
        [HttpPost]
        public async Task<IActionResult> AddSpeciesToMechanism(MechanismSpecies mechanismSpecies)
        {
            await _mechanismSpeciesService.AddSpeciesToMechanismAsync(mechanismSpecies);
            return NoContent();
        }

        // DELETE: api/MechanismSpecies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveSpeciesFromMechanism(Guid id)
        {
            await _mechanismSpeciesService.RemoveSpeciesFromMechanismAsync(id);
            return NoContent();
        }
    }
}
