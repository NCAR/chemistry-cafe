using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/mechanismreactions")]
    public class MechanismReactionsController : ControllerBase
    {
        private readonly MechanismReactionService _mechanismReactionService;

        public MechanismReactionsController(MechanismReactionService mechanismReactionService)
        {
            _mechanismReactionService = mechanismReactionService;
        }

        // GET: api/MechanismReactions/mechanism/5
        [HttpGet("mechanism/{mechanismId}")]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactionsByMechanismId(Guid mechanismId)
        {
            var reactions = await _mechanismReactionService.GetMechanismReactionsByMechanismIdAsync(mechanismId);
            return Ok(reactions);
        }

        // POST: api/MechanismReactions
        [HttpPost]
        public async Task<IActionResult> AddReactionToMechanism(MechanismReaction mechanismReaction)
        {
            await _mechanismReactionService.AddReactionToMechanismAsync(mechanismReaction);
            return NoContent();
        }

        // DELETE: api/MechanismReactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveReactionFromMechanism(Guid id)
        {
            await _mechanismReactionService.RemoveReactionFromMechanismAsync(id);
            return NoContent();
        }
    }
}
