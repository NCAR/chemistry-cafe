using Microsoft.AspNetCore.Mvc;
using Chemistry_Cafe_API.Services;
using System.Threading.Tasks;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/openatmos")]
    public class OpenAtmosController : ControllerBase
    {
        private readonly OpenAtmosService _openAtmosService;

        public OpenAtmosController(OpenAtmosService openAtmosService)
        {
            _openAtmosService = openAtmosService;
        }

        [HttpGet("mechanism/{mechanismId}/json")]
        public async Task<IActionResult> GetMechanismJson(Guid mechanismId)
        {
            var jsonResult = await _openAtmosService.GetJSON(mechanismId);
            if (string.IsNullOrEmpty(jsonResult))
            {
                return NotFound($"Mechanism with ID {mechanismId} not found.");
            }
            return Content(jsonResult, "application/json");
        }

        [HttpGet("mechanism/{mechanismId}/yaml")]
        public async Task<IActionResult> GetMechanismYaml(Guid mechanismId)
        {
            var yamlResult = await _openAtmosService.GetYAML(mechanismId);
            if (string.IsNullOrEmpty(yamlResult))
            {
                return NotFound($"Mechanism with ID {mechanismId} not found.");
            }
            return Content(yamlResult, "text/yaml");
        }

        [HttpGet("mechanism/{mechanismId}/musicbox")]
        public async Task<IActionResult> GetMechanismMusicbox(Guid mechanismId)
        {
            var zipFileBytes = await _openAtmosService.GetMusicboxJSON(mechanismId);
            if (zipFileBytes == null || zipFileBytes.Length == 0)
            {
                return NotFound($"Mechanism with ID {mechanismId} not found.");
            }

            // Set the file name for the response
            var fileName = "musicbox.zip";
            
            // Return the zip file as a file response
            return File(zipFileBytes, "application/zip", fileName);
        }
    }
}
