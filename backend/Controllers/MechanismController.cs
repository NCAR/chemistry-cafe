using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        private readonly UserService _userService;

        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public MechanismController(ChemistryDbContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanisms([FromQuery] Guid? familyId = null)
        {
            IQueryable<Mechanism> query = _context.Mechanisms
                .Include(m => m.Family)
                .Include(m => m.Phases)
                .Include(m => m.Species)
                .Include(mr => mr.Reactions)
                    .ThenInclude(r => r.Reactants)
                        .ThenInclude(r => r.Species)
                .Include(mr => mr.Reactions)
                    .ThenInclude(r => r.Products)
                        .ThenInclude(p => p.Species);

            if (familyId.HasValue)
            {
                query = query.Where(m => m.FamilyId == familyId);
            }

            var mechanisms = await query.ToListAsync();
            return Ok(mechanisms);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mechanism>> GetMechanism(Guid id)
        {
            var mechanism = await _context.Mechanisms
                .Include(m => m.Family)
                .Include(m => m.Phases)
                .Include(m => m.Species)
                .Include(mr => mr.Reactions)
                    .ThenInclude(r => r.Reactants)
                        .ThenInclude(r => r.Species)
                .Include(mr => mr.Reactions)
                    .ThenInclude(r => r.Products)
                        .ThenInclude(p => p.Species)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mechanism == null)
            {
                return NotFound();
            }

            return Ok(mechanism);
        }

        [HttpPost]
        public async Task<ActionResult<Mechanism>> CreateMechanism(Mechanism mechanism)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User does not have access");
            }

            // Verify family exists and user has access
            var family = await _context.Families
                .Include(f => f.Owner)
                .FirstOrDefaultAsync(f => f.Id == mechanism.FamilyId);

            if (family == null)
            {
                return NotFound("Family not found");
            }

            if (family.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Set defaults
            mechanism.Id = Guid.NewGuid();
            mechanism.CreatedDate = DateTime.UtcNow;
            mechanism.UpdatedDate = DateTime.UtcNow;
            mechanism.Phases = new List<Phase>();
            mechanism.Species = new List<Species>();
            mechanism.Reactions = new List<Reaction>();

            // Verify all species and reactions belong to the family
            if (mechanism.Species != null)
            {
                foreach (var s in mechanism.Species)
                {
                    var species = await _context.Species.FindAsync(s.Id);
                    if (species == null || species.FamilyId != mechanism.FamilyId)
                    {
                        return BadRequest($"Species {s.Id} not found in family");
                    }
                }
            }

            if (mechanism.Reactions != null)
            {
                foreach (var r in mechanism.Reactions)
                {
                    var reaction = await _context.Reactions.FindAsync(r.Id);
                    if (reaction == null || reaction.FamilyId != mechanism.FamilyId)
                    {
                        return BadRequest($"Reaction {r.Id} not found in family");
                    }
                }
            }

            var createdMechanism = _context.Mechanisms.Add(mechanism);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMechanism),
                new { id = createdMechanism.Entity.Id },
                createdMechanism.Entity
            );
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateMechanism(Guid id, Mechanism mechanism)
        {
            if (mechanism.Id != id)
            {
                return BadRequest("id parameter does not match given mechanism id");
            }

            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("Not authenticated");
            }

            var existingMechanism = await _context.Mechanisms
                .Include(m => m.Family)
                .Include(m => m.Family!.Owner)
                .Include(m => m.Species)
                .Include(m => m.Reactions)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (existingMechanism == null)
            {
                return NotFound("Mechanism not found");
            }

            if (existingMechanism.Family!.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Verify all new species and reactions belong to the family
            if (mechanism.Species != null)
            {
                foreach (var s in mechanism.Species)
                {
                    var species = await _context.Species.FindAsync(s.Id);
                    if (species == null || species.FamilyId != existingMechanism.FamilyId)
                    {
                        return BadRequest($"Species {s.Id} not found in family");
                    }
                }
                existingMechanism.Species = mechanism.Species;
            }

            if (mechanism.Reactions != null)
            {
                foreach (var r in mechanism.Reactions)
                {
                    var reaction = await _context.Reactions.FindAsync(r.Id);
                    if (reaction == null || reaction.FamilyId != existingMechanism.FamilyId)
                    {
                        return BadRequest($"Reaction {r.Id} not found in family");
                    }
                }
                existingMechanism.Reactions = mechanism.Reactions;
            }

            // Update allowed fields
            existingMechanism.Name = mechanism.Name;
            existingMechanism.Description = mechanism.Description;
            existingMechanism.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMechanism(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("Not authenticated");
            }

            var mechanism = await _context.Mechanisms
                .Include(m => m.Family)
                .Include(m => m.Family!.Owner)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mechanism == null)
            {
                return NotFound("Mechanism not found");
            }

            if (mechanism.Family!.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            await _context.Mechanisms.Where(m => m.Id == id).ExecuteDeleteAsync();
            return NoContent();
        }
    }
} 