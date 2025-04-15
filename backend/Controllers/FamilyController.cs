using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Authorization;
using NuGet.Protocol;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/families")]
    public class FamilyController : ControllerBase
    {
        private readonly ChemistryDbContext _context;
        private readonly UserService _userService;

        /* virtual for mocking purposes */
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public FamilyController(ChemistryDbContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Family>>> GetFamilies([FromQuery] bool? expand = false)
        {
            IQueryable<Family> query = _context.Families;
            
            // Always include Owner
            query = query.Include(f => f.Owner);
            
            if (expand == true)
            {
                query = query
                    .Include(f => f.Species)
                    .Include(f => f.Mechanisms)
                    .Include(f => f.Reactions)
                        .ThenInclude(r => r.Reactants)
                            .ThenInclude(r => r.Species)
                    .Include(f => f.Reactions)
                        .ThenInclude(r => r.Products)
                            .ThenInclude(p => p.Species);
            }

            var families = await query.ToListAsync();
            return Ok(families);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Family>> GetFamily(Guid id)
        {
            var family = await _context.Families
                .Include(f => f.Owner)
                .Include(f => f.Species)
                    .ThenInclude(s => s.Phase)
                .Include(f => f.Reactions)
                    .ThenInclude(r => r.Reactants)
                        .ThenInclude(r => r.Species)
                .Include(f => f.Reactions)
                    .ThenInclude(r => r.Products)
                        .ThenInclude(p => p.Species)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Phases)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (family == null)
            {
                return NotFound();
            }

            return Ok(family);
        }

        /// <summary>
        /// Creates a brand new family assigned to the user with a unique GUID
        /// The user is only able to specify the following fields:
        /// <list type="bullet">
        ///     <item>name</item>
        ///     <item>description</item>
        /// </list>
        /// Everything else is set to a default value when the family is created.
        /// </summary>
        /// <param name="family">Information that should be saved to the database</param>
        /// <returns>HTTP result</returns>
        [HttpPost]
        public async Task<ActionResult<Family>> CreateFamily(Family family)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User does not have access");
            }

            Guid userId;
            bool isValidId = Guid.TryParse(nameIdentifier, out userId);

            if(!isValidId)
            {
                return BadRequest("Name identifier is not parsable as a guid");
            }

            User? currentUser = await _userService.GetUserByIdAsync(userId);
            if (currentUser == null)
            {
                return Unauthorized("User does not exist");
            }

            // Set defaults
            family.Id = Guid.NewGuid();
            family.CreatedDate = DateTime.UtcNow;
            family.Owner = currentUser;
            family.Species = new List<Species>();
            family.Reactions = new List<Reaction>();
            family.Mechanisms = new List<Mechanism>();

            var createdFamily = _context.Families.Add(family);
            await _context.SaveChangesAsync();

            // Return the created family with all relationships loaded
            return CreatedAtAction(
                nameof(GetFamily), 
                new { id = createdFamily.Entity.Id }, 
                await GetFamily(createdFamily.Entity.Id)
            );
        }

        /// <summary>
        /// Updates surface-level information of a given family.
        /// The user is only able to specify the following fields:
        /// <list type="bullet">
        ///     <item>name</item>
        ///     <item>description</item>
        ///     <item>owner</item>
        /// </list>
        /// </summary>
        /// <param name="id">Database ID of the family to update</param>
        /// <param name="family">Information about the family to update</param>
        /// <returns>HTTP result</returns>
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateFamily(Guid id, Family family)
        {
            if (family.Id != id)
            {
                return BadRequest("id parameter does not match given family id");
            }

            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("Not authenticated");
            }

            var existingFamily = await _context.Families
                .Include(f => f.Owner)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (existingFamily == null)
            {
                return NotFound("Family not found");
            }


            if (nameIdentifier != existingFamily.Owner.Id.ToString())
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Update allowed fields
            existingFamily.Name = family.Name;
            existingFamily.Description = family.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Deletes a given family if it is attributed to the current user
        /// </summary>
        /// <param name="id">Database ID of the family to delete</param>
        /// <returns>HTTP result</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamily(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("Not authenticated");
            }

            var family = await _context.Families
                .Include(f => f.Owner)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (family == null)
            {
                return NotFound("Family not found");
            }

            if (family.Owner.Id.ToString() != nameIdentifier)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            await _context.Families.Where(f => f.Id == id).ExecuteDeleteAsync();
            return NoContent();
        }
    }
}
