using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyListController : ControllerBase
    {
        private PropertyListService propertyListService;

        //Injects sql data source setup in Program.cs
        public PropertyListController([FromServices] MySqlDataSource db)
        {
            this.propertyListService = new PropertyListService(db);
        }

        // GET: api/PropertyList/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<PropertyList>> Get()
        {
            return await propertyListService.GetPropertyListsAsync();
        }

        // GET api/PropertyList/5
        [HttpGet("{uuid}")]
        public async Task<PropertyList?> Get(Guid uuid)
        {
            return await propertyListService.GetPropertyListAsync(uuid);
        }

        // GET api/PropertyList/Properties/5
        [HttpGet("Properties/{parent_uuid}")]
        public async Task<IReadOnlyList<Property>> GetProperties(Guid parent_uuid)
        {
            return await propertyListService.GetPropertiesAsync(parent_uuid);
        }

        // POST api/PropertyList/create
        [HttpPost("create")]
        public async Task<Guid> Create([FromBody] PropertyList userPreferneces)
        {
            return await propertyListService.CreatePropertyListAsync(userPreferneces);
        }

        // PUT api/PropertyList/5
        [HttpPut("update")]
        public async Task Put([FromBody] PropertyList userpreferences)
        {
            await propertyListService.UpdatePropertyListAsync(userpreferences);
        }

        // DELETE api/PropertyList/delete/5
        [HttpDelete("delete/{uuid}")]
        public async Task Delete(Guid uuid)
        {
            await propertyListService.DeletePropertyListAsync(uuid);
        }
    }
}
