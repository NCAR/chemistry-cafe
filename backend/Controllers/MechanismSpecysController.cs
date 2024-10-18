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
    public class MechanismSpecysController : Controller
    {
        private readonly ChemistryDbContext _context;

        public MechanismSpecysController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET: MechanismSpecys
        public async Task<IActionResult> Index()
        {
            var chemistryDbContext = _context.MechanismSpecies.Include(m => m.Mechanism).Include(m => m.Species);
            return View(await chemistryDbContext.ToListAsync());
        }

        // GET: MechanismSpecys/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismSpecy = await _context.MechanismSpecies
                .Include(m => m.Mechanism)
                .Include(m => m.Species)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mechanismSpecy == null)
            {
                return NotFound();
            }

            return View(mechanismSpecy);
        }

        // GET: MechanismSpecys/Create
        public IActionResult Create()
        {
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id");
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id");
            return View();
        }

        // POST: MechanismSpecys/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,MechanismId,SpeciesId")] MechanismSpecy mechanismSpecy)
        {
            if (ModelState.IsValid)
            {
                _context.Add(mechanismSpecy);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismSpecy.MechanismId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", mechanismSpecy.SpeciesId);
            return View(mechanismSpecy);
        }

        // GET: MechanismSpecys/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismSpecy = await _context.MechanismSpecies.FindAsync(id);
            if (mechanismSpecy == null)
            {
                return NotFound();
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismSpecy.MechanismId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", mechanismSpecy.SpeciesId);
            return View(mechanismSpecy);
        }

        // POST: MechanismSpecys/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,MechanismId,SpeciesId")] MechanismSpecy mechanismSpecy)
        {
            if (id != mechanismSpecy.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(mechanismSpecy);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MechanismSpecyExists(mechanismSpecy.Id))
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
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismSpecy.MechanismId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", mechanismSpecy.SpeciesId);
            return View(mechanismSpecy);
        }

        // GET: MechanismSpecys/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismSpecy = await _context.MechanismSpecies
                .Include(m => m.Mechanism)
                .Include(m => m.Species)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mechanismSpecy == null)
            {
                return NotFound();
            }

            return View(mechanismSpecy);
        }

        // POST: MechanismSpecys/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var mechanismSpecy = await _context.MechanismSpecies.FindAsync(id);
            if (mechanismSpecy != null)
            {
                _context.MechanismSpecies.Remove(mechanismSpecy);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MechanismSpecyExists(int id)
        {
            return _context.MechanismSpecies.Any(e => e.Id == id);
        }
    }
}
