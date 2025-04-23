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
        private static Family? _family;
        private static Reaction? _reaction;
        private static string? _nameIdentifier;

        private ReactionService _reactionService; 
        private ReactionController _reactionController; 
        private UserService _userService; 
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
        public async Task UpdateReaction()
        {
            _reaction.Name = "UPDATEDTest";
            _reaction.Description = "UPDATEDDesc";
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
            _reaction = null;
        }

        private async Task AsyncCleanup()
        {
            if (_reaction != null)
            {
                await _reactionService.DeleteReactionAsync(_reaction.Id, _nameIdentifier);
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
            var tests = new ReactionControllerTests(); 
            tests.AsyncCleanup().Wait(); 
        }
    }
}
