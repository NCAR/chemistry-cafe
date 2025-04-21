using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class SpeciesControllerTests 
    {
        private static ChemistryDbContext _context;
        private static SpeciesService _speciesService; 
        private static SpeciesController _speciesController; 

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            _context = DBConnection.Context;
            _speciesService = new SpeciesService(_context);
            _speciesController = new SpeciesController(_speciesService);
        }
    }
}
