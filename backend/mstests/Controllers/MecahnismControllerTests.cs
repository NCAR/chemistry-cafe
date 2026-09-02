using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;
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
        private static Mechanism? _mechanism;
        private static string? _nameIdentifier;

        private MechanismService _mechanismService;
        private MechanismController _mechanismController;
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
            _mechanismService = new MechanismService(_context);
            _mechanismController = new MockedMechanismController(_mechanismService);
            _familyService = new FamilyService(_context, _userService);
        }

        private async Task AsyncInit()
        {
            var googleId = "mechanism-sample-google-id";
            var email = "mechanism-test@fake-website.com";
            _user = await _userService.SignIn(googleId, email);
            _nameIdentifier = _user.Id.ToString();

            var familyDto = new Family
            {
                Name = "TestFamily",
                Description = "From MechanismControllerTests.cs",
                CreatedDate = DateTime.UtcNow
            }.ToDto();
            var (result, family) = await _familyService.CreateFamilyAsync(familyDto, _user.Id);
            _family = family!.Entity;

            // Seed a mechanism through the whole-family save so the read tests have data.
            _mechanism = new Mechanism
            {
                Id = Guid.NewGuid(),
                Name = "TestMechanism",
                Description = "From MechanismControllerTests.cs",
                FamilyId = _family.Id,
            };
            var dto = _family.ToDto();
            dto.Mechanisms.Add(new MechanismDto
            {
                Id = _mechanism.Id,
                FamilyId = _family.Id,
                Name = _mechanism.Name,
                Description = _mechanism.Description,
            });
            await _familyService.UpdateFamilyAsync(_family.Id, dto, _nameIdentifier!);
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
            var actionResult = await _mechanismController.GetMechanisms(null);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task GetMechanism()
        {
            var actionResult = await _mechanismController.GetMechanism(_mechanism!.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var returnedMechanism = okResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);
            Assert.AreEqual(_mechanism.Id, returnedMechanism.Id);
            Assert.AreEqual(_mechanism.Name, returnedMechanism.Name);
            Assert.AreEqual(_mechanism.Description, returnedMechanism.Description);
            Assert.AreEqual(_mechanism.FamilyId, returnedMechanism.FamilyId);
        }

        [TestMethod]
        public async Task GetMechanismsFromFamily()
        {
            var actionResult = await _mechanismController.GetMechanisms(_family!.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var mechanismList = okResult.Value as IEnumerable<Mechanism>;
            Assert.IsNotNull(mechanismList);
            Assert.IsTrue(mechanismList.Count() >= 1);
        }

        [TestMethod]
        public async Task GetMechanismsFromInvalidFamily()
        {
            var actionResult = await _mechanismController.GetMechanisms(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        private async Task AsyncCleanup()
        {
            if (_family != null)
            {
                await _familyService.DeleteFamilyAsync(_family!.Id, _nameIdentifier!);
            }
            if (_user != null)
            {
                await _userService.DeleteUserAsync(_user!.Id, _nameIdentifier!);
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
