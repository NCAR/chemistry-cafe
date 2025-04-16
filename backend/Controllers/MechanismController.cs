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
                .Include(m => m.MechanismSpecies)
                    .ThenInclude(ms => ms.Species)
                .Include(m => m.MechanismReactions)
                    .ThenInclude(mr => mr.Reaction)
                        .ThenInclude(r => r.Reactants)
                            .ThenInclude(r => r.Species)
                .Include(m => m.MechanismReactions)
                    .ThenInclude(mr => mr.Reaction)
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
                .Include(m => m.MechanismSpecies)
                    .ThenInclude(ms => ms.Species)
                .Include(m => m.MechanismReactions)
                    .ThenInclude(mr => mr.Reaction)
                        .ThenInclude(r => r.Reactants)
                            .ThenInclude(r => r.Species)
                .Include(m => m.MechanismReactions)
                    .ThenInclude(mr => mr.Reaction)
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

            if (family.Owner.GoogleId.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Set defaults
            mechanism.Id = Guid.NewGuid();
            mechanism.CreatedDate = DateTime.UtcNow;
            mechanism.UpdatedDate = DateTime.UtcNow;
            mechanism.Phases = new List<Phase>();
            mechanism.MechanismSpecies = new List<MechanismSpecies>();
            mechanism.MechanismReactions = new List<MechanismReaction>();

            // Verify all species and reactions belong to the family
            if (mechanism.MechanismSpecies != null)
            {
                foreach (var ms in mechanism.MechanismSpecies)
                {
                    var species = await _context.Species.FindAsync(ms.SpeciesId);
                    if (species == null || species.FamilyId != mechanism.FamilyId)
                    {
                        return BadRequest($"Species {ms.SpeciesId} not found in family");
                    }
                }
            }

            if (mechanism.MechanismReactions != null)
            {
                foreach (var mr in mechanism.MechanismReactions)
                {
                    var reaction = await _context.Reactions.FindAsync(mr.ReactionId);
                    if (reaction == null || reaction.FamilyId != mechanism.FamilyId)
                    {
                        return BadRequest($"Reaction {mr.ReactionId} not found in family");
                    }
                }
            }

            var createdMechanism = _context.Mechanisms.Add(mechanism);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMechanism),
                new { id = createdMechanism.Entity.Id },
                await GetMechanism(createdMechanism.Entity.Id)
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
                .Include(m => m.Family.Owner)
                .Include(m => m.MechanismSpecies)
                .Include(m => m.MechanismReactions)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (existingMechanism == null)
            {
                return NotFound("Mechanism not found");
            }

            if (existingMechanism.Family.Owner.GoogleId.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Verify all new species and reactions belong to the family
            if (mechanism.MechanismSpecies != null)
            {
                foreach (var ms in mechanism.MechanismSpecies)
                {
                    var species = await _context.Species.FindAsync(ms.SpeciesId);
                    if (species == null || species.FamilyId != existingMechanism.FamilyId)
                    {
                        return BadRequest($"Species {ms.SpeciesId} not found in family");
                    }
                }
            }

            if (mechanism.MechanismReactions != null)
            {
                foreach (var mr in mechanism.MechanismReactions)
                {
                    var reaction = await _context.Reactions.FindAsync(mr.ReactionId);
                    if (reaction == null || reaction.FamilyId != existingMechanism.FamilyId)
                    {
                        return BadRequest($"Reaction {mr.ReactionId} not found in family");
                    }
                }
            }

            // Update allowed fields
            existingMechanism.Name = mechanism.Name;
            existingMechanism.Description = mechanism.Description;
            existingMechanism.UpdatedDate = DateTime.UtcNow;

            // Update references
            if (mechanism.MechanismSpecies != null)
            {
                _context.MechanismSpecies.RemoveRange(existingMechanism.MechanismSpecies);
                _context.MechanismSpecies.AddRange(mechanism.MechanismSpecies);
            }

            if (mechanism.MechanismReactions != null)
            {
                _context.MechanismReactions.RemoveRange(existingMechanism.MechanismReactions);
                _context.MechanismReactions.AddRange(mechanism.MechanismReactions);
            }

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
                .Include(m => m.Family.Owner)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mechanism == null)
            {
                return NotFound("Mechanism not found");
            }

            if (mechanism.Family.Owner.GoogleId.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            await _context.Mechanisms.Where(m => m.Id == id).ExecuteDeleteAsync();
            return NoContent();
        }
    }
} 