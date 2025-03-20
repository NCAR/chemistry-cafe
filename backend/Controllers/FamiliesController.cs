using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FamiliesController : ControllerBase
{
    private readonly ChemistryCafeContext _context;

    public FamiliesController(ChemistryCafeContext context)
    {
        _context = context;
    }

    // GET: api/Families
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Family>>> GetFamilies()
    {
        var families = await _context.Families
            .Include(f => f.Species)
            .Include(f => f.Reactions)
            .Include(f => f.Mechanisms)
            .ToListAsync();
        return Ok(families);
    }

    // GET: api/Families/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Family>> GetFamily(Guid id)
    {
        var family = await _context.Families.Include(f => f.Species).Include(f => f.Reactions).Include(f => f.Mechanisms).FirstOrDefaultAsync(f => f.Id == id);

        if (family == null)
        {
            return NotFound();
        }

        return Ok(family);
    }

    // POST: api/Families
    [HttpPost]
    public async Task<ActionResult<Family>> CreateFamily(Family family)
    {
        var createdFamily = await _context.Families.AddAsync(family);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetFamily), new { id = createdFamily.Entity.Id }, createdFamily.Entity);
    }

    // PUT: api/Families/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFamily(Guid id, Family family)
    {
        if (id != family.Id)
        {
            return BadRequest();
        }

        _context.Entry(family).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Families/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFamily(Guid id)
    {
        var family = await _context.Families.FindAsync(id);
        if (family == null)
        {
            return NotFound();
        }

        _context.Families.Remove(family);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}