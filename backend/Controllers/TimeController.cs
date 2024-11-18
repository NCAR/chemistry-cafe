
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Chemistry_Cafe_API.Services;

namespace Chemistry_Cafe_API.Controllers
{
    [ApiController]
    [Route("api/servertime")]
    public class TimeController : ControllerBase
    {
        private readonly TimeService _timeService;

        public TimeController(TimeService timeService)
        {
            _timeService = timeService;
        }

        [HttpGet]
        public ActionResult<string> GetServerTime()
        {
            var serverTime = _timeService.GetCurrentTime();
            return Ok(serverTime);
        }
    }
}