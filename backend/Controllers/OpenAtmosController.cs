using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OpenAtmosController : ControllerBase
    {
        private OpenAtmosService openAtmosService;

        //Injects sql data source setup in Program.cs
        public OpenAtmosController([FromServices] MySqlDataSource db)
        {
            this.openAtmosService = new OpenAtmosService(db);
        }

        // GET: api/OpenAtmos/JSON
        [HttpGet("JSON/{tag_mechanism_uuid}")]
        public async Task<string> GetJSON(Guid tag_mechanism_uuid)
        {
            return await openAtmosService.GetJSON(tag_mechanism_uuid);
        }

        // GET: api/OpenAtmos/YAML
        [HttpGet("YAML/{tag_mechanism_uuid}")]
        public async Task<string> GetYAML(Guid tag_mechanism_uuid)
        {
            return await openAtmosService.GetYAML(tag_mechanism_uuid);
        }

    }
}
