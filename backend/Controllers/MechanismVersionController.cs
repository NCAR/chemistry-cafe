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
    public class MechanismVersionController : Controller
    {
        private readonly ChemistryDbContext _context;

        public MechanismVersionController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET: MechanismVersion
        public async Task<IActionResult> Index()
        {
            var chemistryDbContext = _context.MechanismVersions.Include(m => m.Mechanism);
            return View(await chemistryDbContext.ToListAsync());
        }

        // GET: MechanismVersion/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismVersion = await _context.MechanismVersions
                .Include(m => m.Mechanism)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mechanismVersion == null)
            {
                return NotFound();
            }

            return View(mechanismVersion);
        }

        // GET: MechanismVersion/Create
        public IActionResult Create()
        {
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id");
            return View();
        }

        // POST: MechanismVersion/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,MechanismId,VersionNumber,Tag,CreatedBy,PublishedDate")] MechanismVersion mechanismVersion)
        {
            if (ModelState.IsValid)
            {
                _context.Add(mechanismVersion);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismVersion.MechanismId);
            return View(mechanismVersion);
        }

        // GET: MechanismVersion/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismVersion = await _context.MechanismVersions.FindAsync(id);
            if (mechanismVersion == null)
            {
                return NotFound();
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismVersion.MechanismId);
            return View(mechanismVersion);
        }

        // POST: MechanismVersion/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,MechanismId,VersionNumber,Tag,CreatedBy,PublishedDate")] MechanismVersion mechanismVersion)
        {
            if (id != mechanismVersion.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(mechanismVersion);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MechanismVersionExists(mechanismVersion.Id))
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
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", mechanismVersion.MechanismId);
            return View(mechanismVersion);
        }

        // GET: MechanismVersion/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mechanismVersion = await _context.MechanismVersions
                .Include(m => m.Mechanism)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mechanismVersion == null)
            {
                return NotFound();
            }

            return View(mechanismVersion);
        }

        // POST: MechanismVersion/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var mechanismVersion = await _context.MechanismVersions.FindAsync(id);
            if (mechanismVersion != null)
            {
                _context.MechanismVersions.Remove(mechanismVersion);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MechanismVersionExists(int id)
        {
            return _context.MechanismVersions.Any(e => e.Id == id);
        }
    }
}
