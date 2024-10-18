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
    public class InitialConditionsSpecysController : Controller
    {
        private readonly ChemistryDbContext _context;

        public InitialConditionsSpecysController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET: InitialConditionsSpecys
        public async Task<IActionResult> Index()
        {
            var chemistryDbContext = _context.InitialConditionsSpecies.Include(i => i.Mechanism).Include(i => i.Species);
            return View(await chemistryDbContext.ToListAsync());
        }

        // GET: InitialConditionsSpecys/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var initialConditionsSpecy = await _context.InitialConditionsSpecies
                .Include(i => i.Mechanism)
                .Include(i => i.Species)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (initialConditionsSpecy == null)
            {
                return NotFound();
            }

            return View(initialConditionsSpecy);
        }

        // GET: InitialConditionsSpecys/Create
        public IActionResult Create()
        {
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id");
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id");
            return View();
        }

        // POST: InitialConditionsSpecys/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,MechanismId,SpeciesId,Concentration,Temperature,Pressure,AdditionalConditions")] InitialConditionsSpecy initialConditionsSpecy)
        {
            if (ModelState.IsValid)
            {
                _context.Add(initialConditionsSpecy);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", initialConditionsSpecy.MechanismId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", initialConditionsSpecy.SpeciesId);
            return View(initialConditionsSpecy);
        }

        // GET: InitialConditionsSpecys/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var initialConditionsSpecy = await _context.InitialConditionsSpecies.FindAsync(id);
            if (initialConditionsSpecy == null)
            {
                return NotFound();
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", initialConditionsSpecy.MechanismId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", initialConditionsSpecy.SpeciesId);
            return View(initialConditionsSpecy);
        }

        // POST: InitialConditionsSpecys/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,MechanismId,SpeciesId,Concentration,Temperature,Pressure,AdditionalConditions")] InitialConditionsSpecy initialConditionsSpecy)
        {
            if (id != initialConditionsSpecy.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(initialConditionsSpecy);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!InitialConditionsSpecyExists(initialConditionsSpecy.Id))
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
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", initialConditionsSpecy.MechanismId);
            ViewData["SpeciesId"] = new SelectList(_context.Species, "Id", "Id", initialConditionsSpecy.SpeciesId);
            return View(initialConditionsSpecy);
        }

        // GET: InitialConditionsSpecys/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var initialConditionsSpecy = await _context.InitialConditionsSpecies
                .Include(i => i.Mechanism)
                .Include(i => i.Species)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (initialConditionsSpecy == null)
            {
                return NotFound();
            }

            return View(initialConditionsSpecy);
        }

        // POST: InitialConditionsSpecys/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var initialConditionsSpecy = await _context.InitialConditionsSpecies.FindAsync(id);
            if (initialConditionsSpecy != null)
            {
                _context.InitialConditionsSpecies.Remove(initialConditionsSpecy);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool InitialConditionsSpecyExists(int id)
        {
            return _context.InitialConditionsSpecies.Any(e => e.Id == id);
        }
    }
}
