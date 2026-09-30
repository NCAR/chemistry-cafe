using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/mechanisms")]
    public class MechanismController(MechanismService mechanismService,UserService userService) : BaseHelperController(userService)
    {

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanisms([FromQuery] Guid? familyId = null)
        {
            var (result, mechanismCollection) = await mechanismService.GetAllMechanismsAsync(familyId);
            if (mechanismCollection == null)
            {
                return NotFound($"Family with id '{familyId}' was not found in the database.");
            }

            return Ok(mechanismCollection);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mechanism>> GetMechanism(Guid id)
        {
            var (result, mechanism) = await mechanismService.GetMechanismAsync(id);

            if (mechanism == null)
            {
                return NotFound($"Mechanism with id '{id}' was not found in the database.");
            }

            return Ok(mechanism);
        }
    }
}
