using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class SpeciesControllerTests 
    {
        private static ChemistryDbContext _context = DBConnection.Context;
        private static User? _user;
        private static Family? _family;
        private static Species? _species;
        private static string? _nameIdentifier;

        private SpeciesService _speciesService; 
        private SpeciesController _speciesController; 
        private UserService _userService; 
        private FamilyService _familyService; 

        private class MockedSpeciesController : SpeciesController
        {
            public MockedSpeciesController(SpeciesService service) : base(service) 
            {
            }

            protected override string? GetNameIdentifier() 
            {
                return _nameIdentifier;
            }
        }

        public SpeciesControllerTests()
        {
            _context = DBConnection.Context;
            _speciesService = new SpeciesService(_context);
            _speciesController = new MockedSpeciesController(_speciesService);
            _userService = new UserService(_context);
            _familyService = new FamilyService(_context, _userService);
        }

        private async Task AsyncInit()
        {
            var googleId = "species-sample-google-id";
            var email = "species-test@fake-website.com";
            _user = await _userService.SignIn(googleId, email);
            _family = new Family
            {
                Name = "TestFamily",
                Description = "From SpeciesControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var (result, family) = await _familyService.CreateFamilyAsync(_family, _user.Id);
            _family = family.Entity;
            _nameIdentifier = _user.Id.ToString();
        }

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            var tests = new SpeciesControllerTests(); 
            tests.AsyncInit().Wait(); 
        }

        [TestMethod]
        public async Task GetAllSpecies()
        {
            var actionResult = await _speciesController.GetAllSpecies(null);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task CreateSpecies()
        {
            _species = new Species 
            {
                Name = "TestSpecies",
                Description = "From SpeciesControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var actionResult = await _speciesController.CreateSpecies(_species, _family.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));
            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedSpecies = createdAtActionResult.Value as Species;
            Assert.IsNotNull(returnedSpecies);
            Assert.AreEqual(_species.Name, returnedSpecies.Name);
            Assert.AreEqual(_species.Description, returnedSpecies.Description);
            Assert.AreEqual(_family.Id, returnedSpecies.FamilyId); 
            _species = returnedSpecies;
        }

        [TestMethod]
        public async Task GetSpecies()
        {
            var actionResult = await _speciesController.GetSpecies(_species.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var returnedSpecies = okResult.Value as Species;
            Assert.IsNotNull(returnedSpecies);
            Assert.AreEqual(_species.Id, returnedSpecies.Id);
            Assert.AreEqual(_species.Name, returnedSpecies.Name);
            Assert.AreEqual(_species.Description, returnedSpecies.Description);
            Assert.AreEqual(_species.FamilyId, returnedSpecies.FamilyId);
        }

        [TestMethod]
        public async Task GetAllSpeciesFromFamily()
        {
            var actionResult = await _speciesController.GetAllSpecies(_family.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var speciesList = okResult.Value as IEnumerable<Species>;
            Assert.IsNotNull(speciesList);
            Assert.IsTrue(speciesList.Count() >= 1);
        }

        [TestMethod]
        public async Task UpdateSpecies()
        {
            _species.Name = "UPDATEDTest";
            _species.Description = "UPDATEDDesc";
            var actionResult = await _speciesController.UpdateSpecies(_species.Id, _species);
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(OkObjectResult));
            var createdAtActionResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedSpecies = createdAtActionResult.Value as Species;
            Assert.IsNotNull(returnedSpecies);
            Assert.AreEqual(_species.Id, returnedSpecies.Id);
            Assert.AreEqual(_species.Name, returnedSpecies.Name);
            Assert.AreEqual(_species.Description, returnedSpecies.Description);
            Assert.AreEqual(_species.FamilyId, returnedSpecies.FamilyId); 
        }

        [TestMethod]
        public async Task DeleteSpecies()
        {
            await _familyService.DeleteFamilyAsync(_family.Id, _nameIdentifier);
            _family = null;
            await _speciesController.DeleteSpecies(_species.Id);
            var actionResult = await _speciesController.GetSpecies(_species.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
            _species = null;
        }

        private async Task AsyncCleanup()
        {
            if (_species != null)
            {
                await _speciesService.DeleteSpeciesAsync(_species.Id, _nameIdentifier);
            }
            if (_family != null)
            {
                await _familyService.DeleteFamilyAsync(_family.Id, _nameIdentifier);
            }
            if (_user != null)
            {
                await _userService.DeleteUserAsync(_user.Id, _nameIdentifier);
            }
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            var tests = new SpeciesControllerTests(); 
            tests.AsyncCleanup().Wait(); 
        }
    }
}
