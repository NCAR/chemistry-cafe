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
    public class ReactionControllerTests
    {
        private static ChemistryDbContext _context = DBConnection.Context;
        private static User? _user;
        private static Family _family = null!;
        private static Reaction _reaction = null!;
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
            _nameIdentifier = _user.Id.ToString();

            var familyDto = new Family
            {
                Name = "TestFamily",
                Description = "From ReactionControllerTests.cs",
                CreatedDate = DateTime.UtcNow
            }.ToDto();
            var (result, family) = await _familyService.CreateFamilyAsync(familyDto, _user.Id);
            _family = family!.Entity;

            // Seed a reaction through the whole-family save so the read tests have data.
            _reaction = new Reaction
            {
                Id = Guid.NewGuid(),
                Name = "TestReaction",
                Description = "From ReactionControllerTests.cs",
                ReactionType = "TestReactionType",
                FamilyId = _family.Id,
            };
            var dto = _family.ToDto();
            dto.Reactions.Add(new ReactionDto
            {
                Id = _reaction.Id,
                FamilyId = _family.Id,
                Name = _reaction.Name,
                Description = _reaction.Description,
                ReactionType = _reaction.ReactionType,
            });
            await _familyService.UpdateFamilyAsync(_family.Id, dto, _nameIdentifier!);
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

        private async Task AsyncCleanup()
        {
            if (_family != null)
            {
                await _familyService.DeleteFamilyAsync(_family.Id, _nameIdentifier!);
            }
            if (_user != null)
            {
                await _userService.DeleteUserAsync(_user.Id, _nameIdentifier!);
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
