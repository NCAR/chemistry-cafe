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
    public class UserMechanismsController : Controller
    {
        private readonly ChemistryDbContext _context;

        public UserMechanismsController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET: UserMechanisms
        public async Task<IActionResult> Index()
        {
            var chemistryDbContext = _context.UserMechanisms.Include(u => u.Mechanism).Include(u => u.User);
            return View(await chemistryDbContext.ToListAsync());
        }

        // GET: UserMechanisms/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userMechanism = await _context.UserMechanisms
                .Include(u => u.Mechanism)
                .Include(u => u.User)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (userMechanism == null)
            {
                return NotFound();
            }

            return View(userMechanism);
        }

        // GET: UserMechanisms/Create
        public IActionResult Create()
        {
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id");
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id");
            return View();
        }

        // POST: UserMechanisms/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,UserId,MechanismId,Role")] UserMechanism userMechanism)
        {
            if (ModelState.IsValid)
            {
                _context.Add(userMechanism);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", userMechanism.MechanismId);
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id", userMechanism.UserId);
            return View(userMechanism);
        }

        // GET: UserMechanisms/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userMechanism = await _context.UserMechanisms.FindAsync(id);
            if (userMechanism == null)
            {
                return NotFound();
            }
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", userMechanism.MechanismId);
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id", userMechanism.UserId);
            return View(userMechanism);
        }

        // POST: UserMechanisms/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,UserId,MechanismId,Role")] UserMechanism userMechanism)
        {
            if (id != userMechanism.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(userMechanism);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!UserMechanismExists(userMechanism.Id))
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
            ViewData["MechanismId"] = new SelectList(_context.Mechanisms, "Id", "Id", userMechanism.MechanismId);
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id", userMechanism.UserId);
            return View(userMechanism);
        }

        // GET: UserMechanisms/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userMechanism = await _context.UserMechanisms
                .Include(u => u.Mechanism)
                .Include(u => u.User)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (userMechanism == null)
            {
                return NotFound();
            }

            return View(userMechanism);
        }

        // POST: UserMechanisms/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var userMechanism = await _context.UserMechanisms.FindAsync(id);
            if (userMechanism != null)
            {
                _context.UserMechanisms.Remove(userMechanism);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool UserMechanismExists(int id)
        {
            return _context.UserMechanisms.Any(e => e.Id == id);
        }
    }
}
