using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/phases")]
    public class PhaseController(PhaseService phaseService,UserService userService) : BaseHelperController(userService)
    {

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Phase>>> GetPhases([FromQuery] Guid? familyId = null)
        {
            var (result, phases) = await phaseService.GetAllPhasesAsync(familyId);

            return result switch
            {
                QueryResult.Success => Ok(phases),
                QueryResult.ParentRelationNotFound => NotFound($"Family with id '{familyId}' was not found in the database"),
                _ => StatusCode(StatusCodes.Status500InternalServerError),
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Phase>> GetPhase(Guid id)
        {
            var (result, phase) = await phaseService.GetPhaseAsync(id);
            return result switch
            {
                QueryResult.Success => Ok(phase),
                _ => NotFound($"Phase with id '{id}' was not found in the database."),
            };
        }
    }
}
