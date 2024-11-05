using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/reactions")]
    public class ReactionsController : ControllerBase
    {
        private readonly ReactionService _reactionService;

        public ReactionsController(ReactionService reactionService)
        {
            _reactionService = reactionService;
        }

        // GET: api/Reactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactions()
        {
            var reactions = await _reactionService.GetReactionsAsync();
            return Ok(reactions);
        }

        // GET: api/Reactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reaction>> GetReaction(Guid id)
        {
            var reaction = await _reactionService.GetReactionAsync(id);

            if (reaction == null)
            {
                return NotFound();
            }

            return Ok(reaction);
        }

        // GET: api/Reactions/family/5
        [HttpGet("family/{familyId}")]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactionsByFamilyId(Guid familyId)
        {
            var reactions = await _reactionService.GetReactionsByFamilyIdAsync(familyId);
            return Ok(reactions);
        }
        
        [HttpGet("mechanism/{mechanismId}")]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactionsByMechanismId(Guid mechanismId)
        {
            var reactions = await _reactionService.GetReactionsByMechanismIdAsync(mechanismId);
            return Ok(reactions);
        }

        // POST: api/Reactions
        [HttpPost]
        public async Task<ActionResult<Reaction>> CreateReaction(Reaction reaction)
        {
            var createdReaction = await _reactionService.CreateReactionAsync(reaction);
            return CreatedAtAction(nameof(GetReaction), new { id = createdReaction.Id }, createdReaction);
        }

        // PUT: api/Reactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReaction(Guid id, Reaction reaction)
        {
            if (id != reaction.Id)
            {
                return BadRequest();
            }

            await _reactionService.UpdateReactionAsync(reaction);

            return NoContent();
        }

        // DELETE: api/Reactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReaction(Guid id)
        {
            await _reactionService.DeleteReactionAsync(id);
            return NoContent();
        }
    }
}
