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
    public class MechanismReactionsController : Controller
    {
        private readonly ChemistryDbContext _context;

        public MechanismReactionsController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET: MechanismReactions
        public async Task<IActionResult> Index()
        {
            var chemistryDbContext = _context.MechanismReactions.Include(m => m.Mechanism).Include(m => m.Reaction);
            return View(await chemistryDbContext.ToListAsync());
        }

        // GET: MechanismReactions/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismReaction = await _context.MechanismReactions
                .Include(m => m.Mechanism)
                .Include(m => m.Reaction)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mechanismReaction == null)
            {
                return NotFound();
            }

            return View(mechanismReaction);
        }

        // GET: MechanismReactions/Create
        public IActionResult Create()
        {
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id");
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id");
            return View();
        }

        // POST: MechanismReactions/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,MechanismId,ReactionId")] MechanismReaction mechanismReaction)
        {
            if (ModelState.IsValid)
            {
                _context.Add(mechanismReaction);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismReaction.MechanismId);
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id", mechanismReaction.ReactionId);
            return View(mechanismReaction);
        }

        // GET: MechanismReactions/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismReaction = await _context.MechanismReactions.FindAsync(id);
            if (mechanismReaction == null)
            {
                return NotFound();
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismReaction.MechanismId);
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id", mechanismReaction.ReactionId);
            return View(mechanismReaction);
        }

        // POST: MechanismReactions/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,MechanismId,ReactionId")] MechanismReaction mechanismReaction)
        {
            if (id != mechanismReaction.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(mechanismReaction);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MechanismReactionExists(mechanismReaction.Id))
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
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismReaction.MechanismId);
            ViewData["ReactionId"] = new SelectList(_context.Reactions, "Id", "Id", mechanismReaction.ReactionId);
            return View(mechanismReaction);
        }

        // GET: MechanismReactions/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismReaction = await _context.MechanismReactions
                .Include(m => m.Mechanism)
                .Include(m => m.Reaction)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mechanismReaction == null)
            {
                return NotFound();
            }

            return View(mechanismReaction);
        }

        // POST: MechanismReactions/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var mechanismReaction = await _context.MechanismReactions.FindAsync(id);
            if (mechanismReaction != null)
            {
                _context.MechanismReactions.Remove(mechanismReaction);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MechanismReactionExists(int id)
        {
            return _context.MechanismReactions.Any(e => e.Id == id);
        }
    }
}
