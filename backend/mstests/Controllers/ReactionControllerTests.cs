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
    public class ReactionControllerTests 
    {
        private static ChemistryDbContext _context = DBConnection.Context;
        private static User? _user;
        private static Family _family;
        private static Reaction? _reaction;
        private static string? _nameIdentifier;

        private ReactionService _reactionService; 
        private ReactionController _reactionController; 
        private UserService _userService; 
        private SpeciesService _speciesService;
        private FamilyService _familyService; 

        private class MockedReactionController : ReactionController
        {
            public MockedReactionController(ReactionService service) : base(service) 
            {
            }

            protected override string? GetNameIdentifier() 
            {
                return _nameIdentifier;
            }
        }

        public ReactionControllerTests()
        {
            _context = DBConnection.Context;
            _userService = new UserService(_context);
            _reactionService = new ReactionService(_context);
            _reactionController = new MockedReactionController(_reactionService);
            _speciesService = new SpeciesService(_context);
            _familyService = new FamilyService(_context, _userService);
        }

        private async Task AsyncInit()
        {
            var googleId = "reaction-sample-google-id";
            var email = "reaction-test@fake-website.com";
            _user = await _userService.SignIn(googleId, email);
            _family = new Family
            {
                Name = "TestFamily",
                Description = "From ReactionControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var (result, family) = await _familyService.CreateFamilyAsync(_family, _user.Id);
            _family = family.Entity;
            _nameIdentifier = _user.Id.ToString();
        }

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            var tests = new ReactionControllerTests(); 
            tests.AsyncInit().Wait(); 
        }

        [TestMethod]
        public async Task GetReactions()
        {
            var actionResult = await _reactionController.GetReactions(null);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task CreateReaction()
        {
            _reaction = new Reaction 
            {
                Name = "TestReaction",
                Description = "From ReactionControllerTests.cs",
                CreatedDate = DateTime.UtcNow,
                ReactionType = "TestReactionType" 
            };
            var actionResult = await _reactionController.CreateReaction(_reaction, _family.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));
            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedReaction = createdAtActionResult.Value as Reaction;
            Assert.IsNotNull(returnedReaction);
            Assert.AreEqual(_reaction.Name, returnedReaction.Name);
            Assert.AreEqual(_reaction.Description, returnedReaction.Description);
            Assert.AreEqual(_family.Id, returnedReaction.FamilyId); 
            _reaction = returnedReaction;
        }

        [TestMethod]
        public async Task GetReaction()
        {
            var actionResult = await _reactionController.GetReaction(_reaction.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var returnedReaction = okResult.Value as Reaction;
            Assert.IsNotNull(returnedReaction);
            Assert.AreEqual(_reaction.Id, returnedReaction.Id);
            Assert.AreEqual(_reaction.Name, returnedReaction.Name);
            Assert.AreEqual(_reaction.Description, returnedReaction.Description);
            Assert.AreEqual(_reaction.FamilyId, returnedReaction.FamilyId);
        }

        [TestMethod]
        public async Task GetReactionsFromFamily()
        {
            var actionResult = await _reactionController.GetReactions(_family.Id);
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var reactionList = okResult.Value as IEnumerable<Reaction>;
            Assert.IsNotNull(reactionList);
            Assert.IsTrue(reactionList.Count() >= 1);
        }

        [TestMethod]
        public async Task GetReactionsFromInvalidFamily()
        {
            var actionResult = await _reactionController.GetReactions(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task CreateReactionWithInvalidFamily()
        {
            var actionResult = await _reactionController.CreateReaction(_reaction, Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task DeleteInvalidReaction()
        {
            var actionResult = await _reactionController.DeleteReaction(Guid.NewGuid());
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task UpdateReaction()
        {
            var _reactant = new Species 
            {
                Name = "TestReactant",
                Description = "Reactant From SpeciesControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var _product = new Species 
            {
                Name = "TestProduct",
                Description = "Product from ReactionControllerTests.cs",
                CreatedDate = DateTime.UtcNow 
            };
            var (result1, reactant) = await _speciesService.CreateSpeciesAsync(_reactant, 
                                                                               _family.Id, 
                                                                               _nameIdentifier);
            var (result2, product) = await _speciesService.CreateSpeciesAsync(_product, 
                                                                              _family.Id, 
                                                                              _nameIdentifier);
            _reaction.Name = "UPDATEDTest";
            _reaction.Description = "UPDATEDDesc";
            _reaction.Reactants.Add(
                    new Reactant
                    {
                        ReactionId = _reaction.Id,
                        Reaction = _reaction,
                        SpeciesId = reactant.Id,
                        Species = reactant,
                        Coefficient = 1
                    }
            );
            _reaction.Products.Add(
                    new Product 
                    {
                        ReactionId = _reaction.Id,
                        Reaction = _reaction,
                        SpeciesId = product.Id,
                        Species = product, 
                        Coefficient = 2,
                        Branch = "maybe?" 
                    }
            );
            _reaction.NumericalAttributes.Add(
                new ReactionNumericalAttribute
                {
                    ReactionId = _reaction.Id,
                    Reaction = _reaction,
                    SerializationKey = "test-numerical-serial-key",
                    Value = 10000
                }
            );
            _reaction.StringAttributes.Add(
                new ReactionStringAttribute
                {
                    ReactionId = _reaction.Id,
                    Reaction = _reaction,
                    SerializationKey = "test-string-serial-key",
                    Value = "test-value"
                }
            );
            var actionResult = await _reactionController.UpdateReaction(_reaction.Id, _reaction);
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(OkObjectResult));
            var createdAtActionResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(createdAtActionResult);
            var returnedReaction = createdAtActionResult.Value as Reaction;
            Assert.IsNotNull(returnedReaction);
            Assert.AreEqual(_reaction.Id, returnedReaction.Id);
            Assert.AreEqual(_reaction.Name, returnedReaction.Name);
            Assert.AreEqual(_reaction.Description, returnedReaction.Description);
            Assert.AreEqual(_reaction.FamilyId, returnedReaction.FamilyId); 
        }

        [TestMethod]
        public async Task DeleteReaction()
        {
            await _familyService.UpdateFamilyAsync(_family.Id, _family, _nameIdentifier);
            _family.Reactions.Clear();
            await _reactionController.DeleteReaction(_reaction.Id);
            var actionResult = await _reactionController.GetReaction(_reaction.Id);
            Assert.IsInstanceOfType(actionResult.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task CreateReactionNullNameIdentifer()
        {
            _nameIdentifier = null;
            var result = await _reactionController.CreateReaction(_reaction, _family.Id);
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task UpdateReactionNullNameIdentifer()
        {
            _nameIdentifier = null;
            var result = await _reactionController.UpdateReaction(_reaction.Id, _reaction); 
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task DeleteReactionNullNameIdentifer()
        {
            _nameIdentifier = null;
            var result = await _reactionController.DeleteReaction(_reaction.Id); 
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }

        private async Task AsyncCleanup()
        {
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
            var tests = new ReactionControllerTests(); 
            tests.AsyncCleanup().Wait(); 
        }
    }
}
