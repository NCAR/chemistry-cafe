using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Chemistry_Cafe_API.Models;

namespace Chemistry_Cafe_API.Controllers
{
    public class ReactionSpecysController : Controller
    {
        private readonly ChemistryDbContext _context;

        public ReactionSpecysController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET: ReactionSpecys
        public async Task<IActionResult> Index()
        {
            var chemistryDbContext = _context.ReactionSpecies.Include(r => r.Reaction).Include(r => r.Species);
            return View(await chemistryDbContext.ToListAsync());
        }

        // GET: ReactionSpecys/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var reactionSpecy = await _context.ReactionSpecies
                .Include(r => r.Reaction)
                .Include(r => r.Species)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (reactionSpecy == null)
            {
                return NotFound();
            }

            return View(reactionSpecy);
        }

        // GET: ReactionSpecys/Create
        public IActionResult Create()
        {
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id");
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id");
            return View();
        }

        // POST: ReactionSpecys/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,ReactionId,SpeciesId,Role")] ReactionSpecy reactionSpecy)
        {
            if (ModelState.IsValid)
            {
                _context.Add(reactionSpecy);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id", reactionSpecy.ReactionId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", reactionSpecy.SpeciesId);
            return View(reactionSpecy);
        }

        // GET: ReactionSpecys/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var reactionSpecy = await _context.ReactionSpecies.FindAsync(id);
            if (reactionSpecy == null)
            {
                return NotFound();
            }
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id", reactionSpecy.ReactionId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", reactionSpecy.SpeciesId);
            return View(reactionSpecy);
        }

        // POST: ReactionSpecys/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,ReactionId,SpeciesId,Role")] ReactionSpecy reactionSpecy)
        {
            if (id != reactionSpecy.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(reactionSpecy);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ReactionSpecyExists(reactionSpecy.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id", reactionSpecy.ReactionId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", reactionSpecy.SpeciesId);
            return View(reactionSpecy);
        }

        // GET: ReactionSpecys/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var reactionSpecy = await _context.ReactionSpecies
                .Include(r => r.Reaction)
                .Include(r => r.Species)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (reactionSpecy == null)
            {
                return NotFound();
            }

            return View(reactionSpecy);
        }

        // POST: ReactionSpecys/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var reactionSpecy = await _context.ReactionSpecies.FindAsync(id);
            if (reactionSpecy != null)
            {
                _context.ReactionSpecies.Remove(reactionSpecy);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool ReactionSpecyExists(int id)
        {
            return _context.ReactionSpecies.Any(e => e.Id == id);
        }
    }
}
