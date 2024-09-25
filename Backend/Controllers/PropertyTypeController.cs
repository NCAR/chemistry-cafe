using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyTypeController : ControllerBase
    {
        private PropertyTypeService propertyTypeService;

        //Injects sql data source setup in Program.cs
        public PropertyTypeController([FromServices] MySqlDataSource db)
        {
            this.propertyTypeService = new PropertyTypeService(db);
        }

        // GET: api/PropertyType/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<PropertyType>> Get()
        {
            return await propertyTypeService.GetPropertyTypesAsync();
        }

        // GET api/PropertyType/5
        [HttpGet("{uuid}")]
        public async Task<PropertyType?> Get(Guid uuid)
        {
            return await propertyTypeService.GetPropertyTypeAsync(uuid);
        }

        // GET: api/PropertyType/Validation/uuid
        [HttpGet("Validation/{validation}")]
        public async Task<IReadOnlyList<PropertyType>> GetValidation(string validation)
        {
            return await propertyTypeService.GetPropertyTypeValidationAsync(validation);
        }

        // POST api/PropertyType/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] PropertyType propertyType)
        {
            return await propertyTypeService.CreatePropertyTypeAsync(propertyType);
        }

        // PUT api/PropertyType/5
        [HttpPut("update")]
        public async Task Put([FromBody] PropertyType propertytype)
        {
            await propertyTypeService.UpdatePropertyTypeAsync(propertytype);
        }

        // DELETE api/PropertyType/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await propertyTypeService.DeletePropertyTypeAsync(uuid);
        }
    }
}
