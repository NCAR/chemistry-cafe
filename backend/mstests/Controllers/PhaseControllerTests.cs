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
    public class PhaseControllerTests 
    {
        private static ChemistryDbContext _context = DBConnection.Context;
        private static User? _user;
        private static Family? _family;
        private static Phase? _phase;
        private static string? _nameIdentifier;

        private PhaseService _phaseService; 
        private PhaseController _phaseController; 
        private UserService _userService; 
        private FamilyService _familyService; 

        private class MockedPhaseController : PhaseController
        {
            public MockedPhaseController(PhaseService service) : base(service) 
            {
            }

            protected override string? GetNameIdentifier() 
            {
                return _nameIdentifier;
            }
        }

        public PhaseControllerTests()
        {
            _context = DBConnection.Context;
            _userService = new UserService(_context);
            _phaseService = new PhaseService(_context, _userService);
            _phaseController = new MockedPhaseController(_phaseService);
            _familyService = new FamilyService(_context, _userService);
        }

        private async Task AsyncInit()
        {
            var googleId = "phase-sample-google-id";
            var email = "phase-test@fake-website.com";
            _user = await _userService.SignIn(googleId, email);
            _family = new Family
            {
                Name = "TestFamily",
                Description = "From PhaseControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var (result, family) = await _familyService.CreateFamilyAsync(_family, _user.Id);
            _family = family.Entity;
            _nameIdentifier = _user.Id.ToString();
        }

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            var tests = new PhaseControllerTests(); 
            tests.AsyncInit().Wait(); 
        }

        [TestMethod]
        public async Task GetPhases()
        {
            var actionResult = await _phaseController.GetPhases(null);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task CreatePhase()
        {
            _phase = new Phase 
            {
                Name = "TestPhase",
                Description = "From PhaseControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var actionResult = await _phaseController.CreatePhase(_phase, _family.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));
            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedPhase = createdAtActionResult.Value as Phase;
            Assert.IsNotNull(returnedPhase);
            Assert.AreEqual(_phase.Name, returnedPhase.Name);
            Assert.AreEqual(_phase.Description, returnedPhase.Description);
            Assert.AreEqual(_family.Id, returnedPhase.FamilyId); 
            _phase = returnedPhase;
        }

        [TestMethod]
        public async Task GetPhase()
        {
            var actionResult = await _phaseController.GetPhase(_phase.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var returnedPhase = okResult.Value as Phase;
            Assert.IsNotNull(returnedPhase);
            Assert.AreEqual(_phase.Id, returnedPhase.Id);
            Assert.AreEqual(_phase.Name, returnedPhase.Name);
            Assert.AreEqual(_phase.Description, returnedPhase.Description);
            Assert.AreEqual(_phase.FamilyId, returnedPhase.FamilyId);
        }

        [TestMethod]
        public async Task GetPhasesFromFamily()
        {
            var actionResult = await _phaseController.GetPhases(_family.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var phaseList = okResult.Value as IEnumerable<Phase>;
            Assert.IsNotNull(phaseList);
            Assert.IsTrue(phaseList.Count() >= 1);
        }

        [TestMethod]
        public async Task GetPhasesFromInvalidFamily()
        {
            var actionResult = await _phaseController.GetPhases(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task CreatePhaseWithInvalidFamily()
        {
            var actionResult = await _phaseController.CreatePhase(_phase, Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task DeleteInvalidPhase()
        {
            var actionResult = await _phaseController.DeletePhase(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task UpdatePhase()
        {
            _phase.Name = "UPDATEDTest";
            _phase.Description = "UPDATEDDesc";
            var actionResult = await _phaseController.UpdatePhase(_phase.Id, _phase);
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(OkObjectResult));
            var createdAtActionResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedPhase = createdAtActionResult.Value as Phase;
            Assert.IsNotNull(returnedPhase);
            Assert.AreEqual(_phase.Id, returnedPhase.Id);
            Assert.AreEqual(_phase.Name, returnedPhase.Name);
            Assert.AreEqual(_phase.Description, returnedPhase.Description);
            Assert.AreEqual(_phase.FamilyId, returnedPhase.FamilyId); 
        }

        [TestMethod]
        public async Task DeletePhase()
        {
            await _familyService.UpdateFamilyAsync(_family.Id, _family, _nameIdentifier);
            _family.Phases.Clear();
            await _phaseController.DeletePhase(_phase.Id);
            var actionResult = await _phaseController.GetPhase(_phase.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
            _phase = null;
        }

        private async Task AsyncCleanup()
        {
            if (_phase != null)
            {
                await _phaseService.DeletePhaseAsync(_phase.Id, _nameIdentifier);
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
            var tests = new PhaseControllerTests(); 
            tests.AsyncCleanup().Wait(); 
        }
    }
}
