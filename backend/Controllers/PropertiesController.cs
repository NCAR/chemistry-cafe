using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/properties")]
    public class PropertiesController : ControllerBase
    {
        private readonly PropertyService _propertyService;

        public PropertiesController(PropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        // GET: api/Properties
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Property>>> GetProperties()
        {
            var properties = await _propertyService.GetPropertiesAsync();
            return Ok(properties);
        }

        // GET: api/Properties/id/{id}
        [HttpGet("id/{id}")]
        public async Task<ActionResult<Property>> GetPropertyById(Guid id)
        {
            var property = await _propertyService.GetPropertyByIdAsync(id);

            if (property == null)
            {
                return NotFound();
            }

            return Ok(property);
        }

        // POST: api/Properties
        [HttpPost]
        public async Task<ActionResult<Property>> CreateProperty(Property property)
        {
            var createdProperty = await _propertyService.CreatePropertyAsync(property);
            return CreatedAtAction(nameof(GetPropertyById), new { id = createdProperty.Id }, createdProperty);
        }

        // PUT: api/Properties/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProperty(Guid id, Property property)
        {
            if (id != property.Id)
            {
                return BadRequest();
            }

            await _propertyService.UpdatePropertyAsync(property);

            return NoContent();
        }

        // DELETE: api/Properties/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProperty(Guid id)
        {
            await _propertyService.DeletePropertyAsync(id);
            return NoContent();
        }
    }
}
