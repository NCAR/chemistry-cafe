using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReactionsController : ControllerBase
{
    private readonly ChemistryCafeContext _context;

    public ReactionsController(ChemistryCafeContext context)
    {
        _context = context;
    }

    // GET: api/Reactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Reaction>>> GetReactions()
    {
        var reactions = await _context.Reactions.ToListAsync();
        return Ok(reactions);
    }

    // POST: api/Reactions
    [HttpPost]
    public async Task<ActionResult<Reaction>> CreateReaction(Reaction reaction)
    {
        var createdReaction = await _context.Reactions.AddAsync(reaction);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetReactions), new { id = createdReaction.Entity.Id }, createdReaction.Entity);
    }

    // PUT: api/Reactions/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReaction(Guid id, Reaction reaction)
    {
        if (id != reaction.Id)
        {
            return BadRequest();
        }

        _context.Entry(reaction).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Reactions/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReaction(Guid id)
    {
        var reaction = await _context.Reactions.FindAsync(id);
        if (reaction == null)
        {
            return NotFound();
        }

        _context.Reactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}