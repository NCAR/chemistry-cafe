using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/reactions")]
    public class ReactionController : ControllerBase
    {
        private readonly ChemistryDbContext _context;
        private readonly UserService _userService;

        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public ReactionController(ChemistryDbContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactions([FromQuery] Guid? familyId = null)
        {
            var query = _context.Reactions
                .Include(r => r.Family)
                .Include(r => r.Reactants)
                    .ThenInclude(r => r.Species)
                .Include(r => r.Products)
                    .ThenInclude(p => p.Species)
                .Include(r => r.MechanismReactions)
                    .ThenInclude(mr => mr.Mechanism)
                .AsQueryable();

            if (familyId.HasValue)
            {
                query = query.Where(r => r.FamilyId == familyId);
            }

            var reactions = await query.ToListAsync();
            return Ok(reactions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Reaction>> GetReaction(Guid id)
        {
            var reaction = await _context.Reactions
                .Include(r => r.Family)
                .Include(r => r.Reactants)
                    .ThenInclude(r => r.Species)
                .Include(r => r.Products)
                    .ThenInclude(p => p.Species)
                .Include(r => r.MechanismReactions)
                    .ThenInclude(mr => mr.Mechanism)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reaction == null)
            {
                return NotFound();
            }

            return Ok(reaction);
        }

        [HttpPost]
        public async Task<ActionResult<Reaction>> CreateReaction(Reaction reaction)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User does not have access");
            }

            // Verify family exists and user has access
            var family = await _context.Families
                .Include(f => f.Owner)
                .FirstOrDefaultAsync(f => f.Id == reaction.FamilyId);

            if (family == null)
            {
                return NotFound("Family not found");
            }

            if (family.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Verify all species belong to the family
            if (reaction.Reactants != null)
            {
                foreach (var reactant in reaction.Reactants)
                {
                    var species = await _context.Species.FindAsync(reactant.SpeciesId);
                    if (species == null || species.FamilyId != reaction.FamilyId)
                    {
                        return BadRequest($"Reactant species {reactant.SpeciesId} not found in family");
                    }
                }
            }

            if (reaction.Products != null)
            {
                foreach (var product in reaction.Products)
                {
                    var species = await _context.Species.FindAsync(product.SpeciesId);
                    if (species == null || species.FamilyId != reaction.FamilyId)
                    {
                        return BadRequest($"Product species {product.SpeciesId} not found in family");
                    }
                }
            }

            // Set defaults
            reaction.Id = Guid.NewGuid();
            reaction.CreatedDate = DateTime.UtcNow;
            reaction.UpdatedDate = DateTime.UtcNow;
            reaction.MechanismReactions = new List<MechanismReaction>();

            var createdReaction = _context.Reactions.Add(reaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetReaction),
                new { id = createdReaction.Entity.Id },
                createdReaction.Entity
            );
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateReaction(Guid id, Reaction reaction)
        {
            if (reaction.Id != id)
            {
                return BadRequest("id parameter does not match given reaction id");
            }

            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("Not authenticated");
            }

            var existingReaction = await _context.Reactions
                .Include(r => r.Family)
                .Include(r => r.Family.Owner)
                .Include(r => r.Reactants)
                .Include(r => r.Products)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (existingReaction == null)
            {
                return NotFound("Reaction not found");
            }

            if (existingReaction.Family.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Verify all species belong to the family
            if (reaction.Reactants != null)
            {
                foreach (var reactant in reaction.Reactants)
                {
                    var species = await _context.Species.FindAsync(reactant.SpeciesId);
                    if (species == null || species.FamilyId != existingReaction.FamilyId)
                    {
                        return BadRequest($"Reactant species {reactant.SpeciesId} not found in family");
                    }
                }
            }

            if (reaction.Products != null)
            {
                foreach (var product in reaction.Products)
                {
                    var species = await _context.Species.FindAsync(product.SpeciesId);
                    if (species == null || species.FamilyId != existingReaction.FamilyId)
                    {
                        return BadRequest($"Product species {product.SpeciesId} not found in family");
                    }
                }
            }

            // Update allowed fields
            existingReaction.Name = reaction.Name;
            existingReaction.Description = reaction.Description;
            existingReaction.UpdatedDate = DateTime.UtcNow;

            // Update reactants and products
            if (reaction.Reactants != null)
            {
                _context.Reactants.RemoveRange(existingReaction.Reactants);
                foreach (var reactant in reaction.Reactants)
                {
                    reactant.ReactionId = id;
                }
                _context.Reactants.AddRange(reaction.Reactants);
            }

            if (reaction.Products != null)
            {
                _context.Products.RemoveRange(existingReaction.Products);
                foreach (var product in reaction.Products)
                {
                    product.ReactionId = id;
                }
                _context.Products.AddRange(reaction.Products);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReaction(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("Not authenticated");
            }

            var reaction = await _context.Reactions
                .Include(r => r.Family)
                .Include(r => r.Family.Owner)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reaction == null)
            {
                return NotFound("Reaction not found");
            }

            if (reaction.Family.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            await _context.Reactions.Where(r => r.Id == id).ExecuteDeleteAsync();
            return NoContent();
        }
    }
} 