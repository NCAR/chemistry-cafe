using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/mechanism")]
    public class MechanismsController : ControllerBase
    {
        private readonly MechanismService _mechanismService;

        public MechanismsController(MechanismService mechanismService)
        {
            _mechanismService = mechanismService;
        }

        // GET: api/Mechanisms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanisms()
        {
            var mechanisms = await _mechanismService.GetMechanismsAsync();
            return Ok(mechanisms);
        }

        // GET: api/Mechanisms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Mechanism>> GetMechanism(Guid id)
        {
            var mechanism = await _mechanismService.GetMechanismAsync(id);

            if (mechanism == null)
            {
                return NotFound();
            }

            return Ok(mechanism);
        }

        // GET: api/Mechanisms/family/5
        [HttpGet("family/{familyId}")]
        public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanismsByFamilyId(Guid familyId)
        {
            var mechanisms = await _mechanismService.GetMechanismsByFamilyIdAsync(familyId);
            return Ok(mechanisms);
        }

        // POST: api/Mechanisms
        [HttpPost]
        public async Task<ActionResult<Mechanism>> CreateMechanism(Mechanism mechanism)
        {
            var createdMechanism = await _mechanismService.CreateMechanismAsync(mechanism);
            return CreatedAtAction(nameof(GetMechanism), new { id = createdMechanism.Id }, createdMechanism);
        }

        // PUT: api/Mechanisms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMechanism(Guid id, Mechanism mechanism)
        {
            if (id != mechanism.Id)
            {
                return BadRequest();
            }

            await _mechanismService.UpdateMechanismAsync(mechanism);

            return NoContent();
        }

        // DELETE: api/Mechanisms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMechanism(Guid id)
        {
            await _mechanismService.DeleteMechanismAsync(id);
            return NoContent();
        }
    }
}
