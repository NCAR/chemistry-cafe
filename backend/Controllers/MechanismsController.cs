using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MechanismsController : ControllerBase
{
    private readonly ChemistryCafeContext _context;

    public MechanismsController(ChemistryCafeContext context)
    {
        _context = context;
    }

    // GET: api/Mechanisms
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mechanism>>> GetMechanisms()
    {
        var mechanisms = await _context.Mechanisms.ToListAsync();
        return Ok(mechanisms);
    }

    // POST: api/Mechanisms
    [HttpPost]
    public async Task<ActionResult<Mechanism>> CreateMechanism(Mechanism mechanism)
    {
        var createdMechanism = await _context.Mechanisms.AddAsync(mechanism);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMechanisms), new { id = createdMechanism.Entity.Id }, createdMechanism.Entity);
    }

    // PUT: api/Mechanisms/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMechanism(Guid id, Mechanism mechanism)
    {
        if (id != mechanism.Id)
        {
            return BadRequest();
        }

        _context.Entry(mechanism).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Mechanisms/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMechanism(Guid id)
    {
        var mechanism = await _context.Mechanisms.FindAsync(id);
        if (mechanism == null)
        {
            return NotFound();
        }

        _context.Mechanisms.Remove(mechanism);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}