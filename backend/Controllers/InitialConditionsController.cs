using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/initialconditionspecies")]
    public class InitialConditionsController : ControllerBase
    {
        private readonly InitialConditionSpeciesService _initialConditionSpeciesService;

        public InitialConditionsController(InitialConditionSpeciesService initialConditionSpeciesService)
        {
            _initialConditionSpeciesService = initialConditionSpeciesService;
        }

        // GET: api/InitialConditions/mechanism/5
        [HttpGet("mechanism/{mechanismId}")]
        public async Task<ActionResult<IEnumerable<InitialConditionsSpecies>>> GetInitialConditionsByMechanismId(Guid mechanismId)
        {
            var initialConditions = await _initialConditionSpeciesService.GetInitialConditionsByMechanismIdAsync(mechanismId);
            return Ok(initialConditions);
        }

        // POST: api/InitialConditions
        [HttpPost]
        public async Task<ActionResult<InitialConditionsSpecies>> CreateInitialCondition(InitialConditionsSpecies initialCondition)
        {
            var createdInitialCondition = await _initialConditionSpeciesService.CreateInitialConditionAsync(initialCondition);
            return CreatedAtAction(nameof(GetInitialConditionsByMechanismId), new { mechanismId = createdInitialCondition.MechanismId }, createdInitialCondition);
        }

        // PUT: api/InitialConditions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInitialCondition(Guid id, InitialConditionsSpecies initialCondition)
        {
            if (id != initialCondition.Id)
            {
                return BadRequest();
            }

            await _initialConditionSpeciesService.UpdateInitialConditionAsync(initialCondition);

            return NoContent();
        }

        // DELETE: api/InitialConditions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInitialCondition(Guid id)
        {
            await _initialConditionSpeciesService.DeleteInitialConditionAsync(id);
            return NoContent();
        }
    }
}
