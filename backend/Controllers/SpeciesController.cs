using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpeciesController : ControllerBase
{
    private readonly ChemistryCafeContext _context;

    public SpeciesController(ChemistryCafeContext context)
    {
        _context = context;
    }

    // GET: api/Species
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Species>>> GetSpecies()
    {
        var species = await _context.Species.Include(s => s.InitialConditions).Include(s => s.Properties).ToListAsync();

        if (species == null)
        {
            return NotFound();
        }

        return Ok(species);
    }

    // POST: api/Species
    [HttpPost]
    public async Task<ActionResult<Species>> CreateSpecies(Species species)
    {
        var createdSpecies = await _context.Species.AddAsync(species);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSpecies), new { id = createdSpecies.Entity.Id }, createdSpecies.Entity);
    }

    // PUT: api/Species/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSpecies(Guid id, Species species)
    {
        if (id != species.Id)
        {
            return BadRequest();
        }

        _context.Entry(species).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Species/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSpecies(Guid id)
    {
        var species = await _context.Species.FindAsync(id);
        if (species == null)
        {
            return NotFound();
        }

        _context.Species.Remove(species);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}