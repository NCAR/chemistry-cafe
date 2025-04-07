using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Authorization;
using NuGet.Protocol;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/families")]
public class FamilyController : ControllerBase
{
    private readonly ChemistryDbContext _context;
    private readonly UserService _userService;

    /* virtual for mocking purposes */
    public virtual string? GetNameIdentifier() {
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
        var families = new List<Family>();
        if (expand == true)
        {
            families = await _context.Families
                .Include(f => f.Species).Include(f => f.Owner).ToListAsync();
        }
        else
        {
            families = await _context.Families.Include(f => f.Owner).ToListAsync();
        }

        return Ok(families);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Family>> GetFamily(Guid id, [FromQuery] bool? expand = true)
    {
        Family? family = null;
        if (expand == true)
        {
            family = await _context.Families
                .Include(f => f.Species).Include(f => f.Owner).FirstOrDefaultAsync(f => f.Id == id);
        }
        else
        {
            family = await _context.Families.FirstOrDefaultAsync(f => f.Id == id);
        }

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

        User? currentUser = await _userService.GetUserByIdAsync(Guid.Parse(nameIdentifier));
        if (currentUser == null)
        {
            return Unauthorized("User does not exist");
        }

        // Defaults which the frontend user cannot specify
        family.Id = new Guid();
        family.CreatedDate = DateTime.UtcNow;
        family.Owner = currentUser;
        family.Species = [];
        var createdFamily = _context.Families.Add(family);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFamily), new { id = createdFamily.Entity.Id }, createdFamily.Entity);
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

        Family? existingFamily = await _context.Families
            .Include(f => f.Owner).FirstOrDefaultAsync(f => f.Id == id);
        if (existingFamily == null)
        {
            return NotFound("Family not found");
        }

        if (nameIdentifier != existingFamily.Owner.Id.ToString())
        {
            return StatusCode(StatusCodes.Status403Forbidden);
        }

        User? updatedOwner = await _context.Users.FindAsync(family.Owner.Id);
        if (updatedOwner == null)
        {
            return NotFound("New family owner to transfer not found");
        }

        // Set fields the user is allowed to change in this function
        existingFamily.Name = family.Name;
        existingFamily.Description = family.Description;
        existingFamily.Owner = updatedOwner;
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

        Family? family = await _context.Families
            .Include(f => f.Owner).FirstOrDefaultAsync(f => f.Id == id);
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
