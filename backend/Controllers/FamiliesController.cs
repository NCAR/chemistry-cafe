using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/families")]
    public class FamiliesController : ControllerBase
    {
        private readonly FamilyService _familyService;

        public FamiliesController(FamilyService familyService)
        {
            _familyService = familyService;
        }

        // GET: api/Families
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Family>>> GetFamilies()
        {
            var families = await _familyService.GetFamiliesAsync();
            return Ok(families);
        }

        // GET: api/Families/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Family>> GetFamily(int id)
        {
            var family = await _familyService.GetFamilyAsync(id);

            if (family == null)
            {
                return NotFound();
            }

            return Ok(family);
        }

        // POST: api/Families
        [HttpPost]
        public async Task<ActionResult<Family>> CreateFamily(Family family)
        {
            var createdFamily = await _familyService.CreateFamilyAsync(family.Name, family.Description, family.CreatedBy);
            return CreatedAtAction(nameof(GetFamily), new { id = createdFamily.Id }, createdFamily);
        }

        // PUT: api/Families/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFamily(int id, Family family)
        {
            if (id != family.Id)
            {
                return BadRequest();
            }

            await _familyService.UpdateFamilyAsync(family);

            return NoContent();
        }

        // DELETE: api/Families/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamily(int id)
        {
            await _familyService.DeleteFamilyAsync(id);
            return NoContent();
        }
    }
}
