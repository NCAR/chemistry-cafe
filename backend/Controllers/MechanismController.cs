using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/mechanisms")]
    public class MechanismController : ControllerBase
    {
        private readonly ChemistryDbContext _context;
        private readonly MechanismService _mechanismService;

        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public MechanismController(ChemistryDbContext context, MechanismService mechanismService)
        {
            _context = context;
            _mechanismService = mechanismService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanisms([FromQuery] Guid? familyId = null)
        {
            var (result, mechanismCollection) = await _mechanismService.GetAllMechanismsAsync(familyId);
            if (mechanismCollection == null)
            {
                return NotFound($"Family with id '{familyId}' was not found in the database.");
            }

            return Ok(mechanismCollection);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mechanism>> GetMechanism(Guid id)
        {
            var (result, mechanism) = await _mechanismService.GetMechanismAsync(id);

            if (mechanism == null)
            {
                return NotFound($"Mechanism with id '{id}' was not found in the database.");
            }

            return Ok(mechanism);
        }
    }
}
