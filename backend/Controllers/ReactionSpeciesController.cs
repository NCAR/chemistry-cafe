using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/reactionspecies")]
    public class ReactionSpeciesController : ControllerBase
    {
        private readonly ReactionSpeciesService _reactionSpeciesService;

        public ReactionSpeciesController(ReactionSpeciesService reactionSpeciesService)
        {
            _reactionSpeciesService = reactionSpeciesService;
        }

        // GET: api/ReactionSpecies/reaction/5
        [HttpGet("reaction/{reactionId}")]
        public async Task<ActionResult<IEnumerable<ReactionSpecies>>> GetSpeciesByReactionId(Guid reactionId)
        {
            var reactionSpecies = await _reactionSpeciesService.GetSpeciesByReactionIdAsync(reactionId);
            return Ok(reactionSpecies);
        }

        // POST: api/ReactionSpecies
        [HttpPost]
        public async Task<IActionResult> AddSpeciesToReaction(ReactionSpecies reactionSpecies)
        {
            await _reactionSpeciesService.AddSpeciesToReactionAsync(reactionSpecies);
            return NoContent();
        }

        // PUT: api/ReactionSpecies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReactionSpecies(Guid id, ReactionSpecies reactionSpecies)
        {
            if (id != reactionSpecies.Id)
            {
                return BadRequest();
            }

            await _reactionSpeciesService.UpdateReactionSpeciesAsync(reactionSpecies);

            return NoContent();
        }

        // DELETE: api/ReactionSpecies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveSpeciesFromReaction(Guid id)
        {
            await _reactionSpeciesService.RemoveSpeciesFromReactionAsync(id);
            return NoContent();
        }
    }
}
