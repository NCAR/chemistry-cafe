using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/families")]
public class FamilyController : ControllerBase
{
    private readonly ChemistryDbContext _context;
    private readonly UserService _userService;
    
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

    [HttpPost]
    public async Task<ActionResult<Family>> CreateFamily(Family family)
    {
        Console.WriteLine(family);
        // todo: owner is the user who sent the request
        ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
        var nameIdentifier = claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _userService.GetUserByIdAsync(Guid.Parse(nameIdentifier));
        family.Owner = currentUser;

        // species list starts empty
        family.Species = new List<Species>();
        Console.WriteLine(family);

        var createdFamily = _context.Families.Add(family);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFamily), new { id = createdFamily.Entity.Id }, createdFamily.Entity);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFamily(Guid id, Family family)
    {
        if (id != family.Id)
        {
            return BadRequest();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFamily(Guid id)
    {
        var family = await _context.Families.FindAsync(id);
        if (family == null)
        {
            return NotFound();
        }
    }
}