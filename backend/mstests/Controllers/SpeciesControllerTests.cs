using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Text.Json;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class SpeciesControllerTests
    {
        private static ChemistryDbContext _context = DBConnection.Context;
        private static User? _user;
        private static Family? _family;
        private static SpeciesDto _species = null!;
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
            _family = family!.Entity;
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
            _species = new SpeciesDto
            {
                Name = "TestSpecies",
                Description = "From SpeciesControllerTests.cs",
            };
            var actionResult = await _speciesController.CreateSpecies(_species, _family!.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));
            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedSpecies = createdAtActionResult.Value as SpeciesDto;
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
            var returnedSpecies = okResult.Value as SpeciesDto;
            Assert.IsNotNull(returnedSpecies);
            Assert.AreEqual(_species.Id, returnedSpecies.Id);
            Assert.AreEqual(_species.Name, returnedSpecies.Name);
            Assert.AreEqual(_species.Description, returnedSpecies.Description);
            Assert.AreEqual(_species.FamilyId, returnedSpecies.FamilyId);
        }

        [TestMethod]
        public async Task GetAllSpeciesFromFamily()
        {
            var actionResult = await _speciesController.GetAllSpecies(_family!.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var speciesList = okResult.Value as IEnumerable<SpeciesDto>;
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
            var returnedSpecies = createdAtActionResult.Value as SpeciesDto;
            Assert.IsNotNull(returnedSpecies);
            Assert.AreEqual(_species.Id, returnedSpecies.Id);
            Assert.AreEqual(_species.Name, returnedSpecies.Name);
            Assert.AreEqual(_species.Description, returnedSpecies.Description);
            Assert.AreEqual(_species.FamilyId, returnedSpecies.FamilyId);
        }

        [TestMethod]
        public async Task CreateSpeciesPersistsFirstClassProperties()
        {
            _nameIdentifier = _user!.Id.ToString();
            var species = new SpeciesDto
            {
                Name = "PropsSpecies",
                Description = "first-class properties",
                IsThirdBody = true,
                MolecularWeight = 0.048,
                ConstantConcentration = 1.2e-3,
                AbsoluteTolerance = 1e-9,
                OtherProperties = new Dictionary<string, JsonElement>
                {
                    ["__long name"] = JsonSerializer.SerializeToElement("ozone"),
                    ["custom number"] = JsonSerializer.SerializeToElement(42.0),
                },
            };

            var createResult = await _speciesController.CreateSpecies(species, _family!.Id);
            var created = (createResult.Result as CreatedAtActionResult)?.Value as SpeciesDto;
            Assert.IsNotNull(created);

            _context.ChangeTracker.Clear();
            var getResult = await _speciesController.GetSpecies(created!.Id);
            var fetched = (getResult.Result as OkObjectResult)?.Value as SpeciesDto;
            Assert.IsNotNull(fetched);
            Assert.AreEqual(true, fetched!.IsThirdBody);
            Assert.AreEqual(0.048, fetched.MolecularWeight);
            Assert.AreEqual(1.2e-3, fetched.ConstantConcentration);
            Assert.AreEqual(1e-9, fetched.AbsoluteTolerance);
            Assert.IsNull(fetched.ConstantMixingRatio);
            Assert.IsNotNull(fetched.OtherProperties);
            Assert.AreEqual("ozone", fetched.OtherProperties!["__long name"].GetString());
            Assert.AreEqual(42.0, fetched.OtherProperties["custom number"].GetDouble());
        }

        [TestMethod]
        public async Task CreateSpeciesPersistsConstantMixingRatio()
        {
            _nameIdentifier = _user!.Id.ToString();
            var species = new SpeciesDto
            {
                Name = "MixingRatioSpecies",
                Description = "mixing ratio",
                ConstantMixingRatio = 3.4e-2,
            };

            var createResult = await _speciesController.CreateSpecies(species, _family!.Id);
            var created = (createResult.Result as CreatedAtActionResult)?.Value as SpeciesDto;
            Assert.IsNotNull(created);

            _context.ChangeTracker.Clear();
            var getResult = await _speciesController.GetSpecies(created!.Id);
            var fetched = (getResult.Result as OkObjectResult)?.Value as SpeciesDto;
            Assert.IsNotNull(fetched);
            Assert.AreEqual(3.4e-2, fetched!.ConstantMixingRatio);
            Assert.IsNull(fetched.ConstantConcentration);
        }

        [TestMethod]
        public async Task UpdateSpeciesPersistsFirstClassProperties()
        {
            _nameIdentifier = _user!.Id.ToString();
            var species = new SpeciesDto
            {
                Name = "UpdatePropsSpecies",
                Description = "before",
                IsThirdBody = false,
                MolecularWeight = 0.018,
            };
            var createResult = await _speciesController.CreateSpecies(species, _family!.Id);
            var created = (createResult.Result as CreatedAtActionResult)?.Value as SpeciesDto;
            Assert.IsNotNull(created);

            created!.IsThirdBody = true;
            created.MolecularWeight = 0.032;
            created.ConstantConcentration = 5.0e-4;
            created.AbsoluteTolerance = 1e-10;
            var updateResult = await _speciesController.UpdateSpecies(created.Id, created);
            Assert.IsInstanceOfType(updateResult.Result, typeof(OkObjectResult));

            _context.ChangeTracker.Clear();
            var getResult = await _speciesController.GetSpecies(created.Id);
            var fetched = (getResult.Result as OkObjectResult)?.Value as SpeciesDto;
            Assert.IsNotNull(fetched);
            Assert.AreEqual(true, fetched!.IsThirdBody);
            Assert.AreEqual(0.032, fetched.MolecularWeight);
            Assert.AreEqual(5.0e-4, fetched.ConstantConcentration);
            Assert.AreEqual(1e-10, fetched.AbsoluteTolerance);
        }

        [TestMethod]
        public async Task DeleteSpecies()
        {
            await _familyService.UpdateFamilyAsync(_family!.Id, _family, _nameIdentifier!);
            _family.Species.Clear();
            await _speciesController.DeleteSpecies(_species.Id);
            var actionResult = await _speciesController.GetSpecies(_species.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task GetSpeciesFromInvalidFamily()
        {
            var actionResult = await _speciesController.GetSpecies(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task CreateSpeciesWithInvalidFamily()
        {
            var actionResult = await _speciesController.CreateSpecies(_species, Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task CreateSpeciesRejectsBothConcentrations()
        {
            _nameIdentifier = _user!.Id.ToString();
            var species = new SpeciesDto
            {
                Name = "BothConcentrations",
                ConstantConcentration = 1e-3,
                ConstantMixingRatio = 2e-3,
            };
            var result = await _speciesController.CreateSpecies(species, _family!.Id);
            Assert.IsInstanceOfType(result.Result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task DeleteInvalidSpecies()
        {
            var actionResult = await _speciesController.DeleteSpecies(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task CreateSpeciesNullNameIdentifer()
        {
            _nameIdentifier = null;
            var result = await _speciesController.CreateSpecies(_species, _family!.Id);
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task UpdateSpeciesNullNameIdentifer()
        {
            _nameIdentifier = null;
            var result = await _speciesController.UpdateSpecies(_species.Id, _species);
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task DeleteSpeciesNullNameIdentifer()
        {
            _nameIdentifier = null;
            var result = await _speciesController.DeleteSpecies(_species.Id);
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }

        private async Task AsyncCleanup()
        {
            if (_family != null)
            {
                await _familyService.DeleteFamilyAsync(_family!.Id, _nameIdentifier!);
            }
            if (_user != null)
            {
                await _userService.DeleteUserAsync(_user.Id, _nameIdentifier!);
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
