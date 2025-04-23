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
    public class MechanismControllerTests 
    {
        private static ChemistryDbContext _context = DBConnection.Context;
        private static User? _user;
        private static Family? _family;
        private static Mechanism? _phase;
        private static string? _nameIdentifier;

        private MechanismService _phaseService; 
        private MechanismController _phaseController; 
        private UserService _userService; 
        private FamilyService _familyService; 

        private class MockedMechanismController : MechanismController
        {
            public MockedMechanismController(MechanismService service) : base(_context, service) 
            {
            }

            protected override string? GetNameIdentifier() 
            {
                return _nameIdentifier;
            }
        }

        public MechanismControllerTests()
        {
            _context = DBConnection.Context;
            _userService = new UserService(_context);
            _phaseService = new MechanismService(_context);
            _phaseController = new MockedMechanismController(_phaseService);
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
                Description = "From MechanismControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var (result, family) = await _familyService.CreateFamilyAsync(_family, _user.Id);
            _family = family.Entity;
            _nameIdentifier = _user.Id.ToString();
        }

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            var tests = new MechanismControllerTests(); 
            tests.AsyncInit().Wait(); 
        }

        [TestMethod]
        public async Task GetMechanisms()
        {
            var actionResult = await _phaseController.GetMechanisms(null);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task CreateMechanism()
        {
            _phase = new Mechanism 
            {
                Name = "TestMechanism",
                Description = "From MechanismControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var actionResult = await _phaseController.CreateMechanism(_phase, _family.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));
            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedMechanism = createdAtActionResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);
            Assert.AreEqual(_phase.Name, returnedMechanism.Name);
            Assert.AreEqual(_phase.Description, returnedMechanism.Description);
            Assert.AreEqual(_family.Id, returnedMechanism.FamilyId); 
            _phase = returnedMechanism;
        }

        [TestMethod]
        public async Task GetMechanism()
        {
            var actionResult = await _phaseController.GetMechanism(_phase.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var returnedMechanism = okResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);
            Assert.AreEqual(_phase.Id, returnedMechanism.Id);
            Assert.AreEqual(_phase.Name, returnedMechanism.Name);
            Assert.AreEqual(_phase.Description, returnedMechanism.Description);
            Assert.AreEqual(_phase.FamilyId, returnedMechanism.FamilyId);
        }

        [TestMethod]
        public async Task GetMechanismsFromFamily()
        {
            var actionResult = await _phaseController.GetMechanisms(_family.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var phaseList = okResult.Value as IEnumerable<Mechanism>;
            Assert.IsNotNull(phaseList);
            Assert.IsTrue(phaseList.Count() >= 1);
        }

        [TestMethod]
        public async Task UpdateMechanism()
        {
            _phase.Name = "UPDATEDTest";
            _phase.Description = "UPDATEDDesc";
            var actionResult = await _phaseController.UpdateMechanism(_phase.Id, _phase);
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(OkObjectResult));
            var createdAtActionResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedMechanism = createdAtActionResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);
            Assert.AreEqual(_phase.Id, returnedMechanism.Id);
            Assert.AreEqual(_phase.Name, returnedMechanism.Name);
            Assert.AreEqual(_phase.Description, returnedMechanism.Description);
            Assert.AreEqual(_phase.FamilyId, returnedMechanism.FamilyId); 
        }

        [TestMethod]
        public async Task DeleteMechanism()
        {
            await _familyService.UpdateFamilyAsync(_family.Id, _family, _nameIdentifier);
            _family.Mechanisms.Clear();
            await _phaseController.DeleteMechanism(_phase.Id);
            var actionResult = await _phaseController.GetMechanism(_phase.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
            _phase = null;
        }

        private async Task AsyncCleanup()
        {
            if (_phase != null)
            {
                await _phaseService.DeleteMechanismAsync(_phase.Id, _nameIdentifier);
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
            var tests = new MechanismControllerTests(); 
            tests.AsyncCleanup().Wait(); 
        }
    }
}
