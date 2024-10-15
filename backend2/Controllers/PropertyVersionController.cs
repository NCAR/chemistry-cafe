using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyVersionController : ControllerBase
    {
        private PropertyVersionService propertyVersionService;
        
        //Injects sql data source setup in Program.cs
        public PropertyVersionController([FromServices] MySqlDataSource db)
        {
            this.propertyVersionService = new PropertyVersionService(db);
        }

        // GET: api/PropertyVersion/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<PropertyVersion>> Get()
        {
            return await propertyVersionService.GetPropertyVersionsAsync();
        }

        // GET api/PropertyVersion/5
        [HttpGet("{uuid}")]
        public async Task<PropertyVersion?> Get(Guid uuid)
        {
            return await propertyVersionService.GetPropertyVersionAsync(uuid);
        }

        // POST api/PropertyVersion/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] PropertyVersion newPropertyVersion)
        {
            return await propertyVersionService.CreatePropertyVersionAsync(newPropertyVersion);
        }

        // PUT api/PropertyVersion/5
        [HttpPut("update")]
        public async Task Put([FromBody] PropertyVersion newPropertyVersion)
        {
            await propertyVersionService.UpdatePropertyVersionAsync(newPropertyVersion);
        }

        // DELETE api/PropertyVersion/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await propertyVersionService.DeletePropertyVersionAsync(uuid);
        }
    }
}
