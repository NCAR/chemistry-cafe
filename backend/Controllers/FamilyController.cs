using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/families")]
public class FamilyController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public FamilyController(ChemistryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Family>>> GetFamilies([FromQuery] bool? expand = false)
    {
        var families = new List<Family>();
        if (expand == true)
        {
            families = await _context.Families
                .Include(f => f.Species).Include(f => f.Owner).ToListAsync();
        } else
        {
            families = await _context.Families.ToListAsync();
        }

        return Ok(families);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Family>> GetFamily(Guid id, [FromQuery] bool? expand = false)
    {
        Family? family = null;
        if (expand == true)
        {
            family = await _context.Families
                .Include(f => f.Species).Include(f => f.Owner).FirstOrDefaultAsync(f => f.Id == id);
        } else
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
        var createdFamily = _context.Families.Add(family);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFamily), new { id = createdFamily.Entity.Id }, createdFamily.Entity);
    }
}