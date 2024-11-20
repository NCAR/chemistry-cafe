using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class MechanismReactionsControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _MechanismId;
        static Guid _ReactionId;
        static Guid _MechanismReactionId;
        static string _MechanismName = "TestMechanismForMechanismReactions";
        static string _ReactionName = "TestReactionForMechanismReactions";
        static string _CreatedBy = "MechanismReactionsControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;
        static bool mechanismCreated = false;
        static bool reactionCreated = false;
        static Guid _FamilyId;

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            var db = DBConnection.DataSource;

            // Ensure Family exists
            var familyService = new FamilyService(db);
            var familiesTask = familyService.GetFamiliesAsync();
            familiesTask.Wait();
            var families = familiesTask.Result;
            var testFamily = families.FirstOrDefault(f => f.Name == "TestFamilyForMechanismReactions");

            if (testFamily != null)
            {
                _FamilyId = testFamily.Id;
            }
            else
            {
                var createFamilyTask = familyService.CreateFamilyAsync("TestFamilyForMechanismReactions", "A test family for MechanismReactionsControllerTests.", _CreatedBy);
                createFamilyTask.Wait();
                var createdFamily = createFamilyTask.Result;
                _FamilyId = createdFamily.Id;
            }

            // Ensure Mechanism exists
            var mechanismService = new MechanismService(db);
            var mechanismsTask = mechanismService.GetMechanismsAsync();
            mechanismsTask.Wait();
            var mechanisms = mechanismsTask.Result;
            var testMechanism = mechanisms.FirstOrDefault(m => m.Name == _MechanismName);

            if (testMechanism != null)
            {
                _MechanismId = testMechanism.Id;
            }
            else
            {
                var newMechanism = new Mechanism
                {
                    FamilyId = _FamilyId,
                    Name = _MechanismName,
                    Description = "A test mechanism for MechanismReactionsControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createMechanismTask = mechanismService.CreateMechanismAsync(newMechanism);
                createMechanismTask.Wait();
                var createdMechanism = createMechanismTask.Result;
                _MechanismId = createdMechanism.Id;
                mechanismCreated = true;
            }

            // Ensure Reaction exists
            var reactionService = new ReactionService(db);
            var reactionsTask = reactionService.GetReactionsAsync();
            reactionsTask.Wait();
            var reactions = reactionsTask.Result;
            var testReaction = reactions.FirstOrDefault(r => r.Name == _ReactionName);

            if (testReaction != null)
            {
                _ReactionId = testReaction.Id;
            }
            else
            {
                var newReaction = new Reaction
                {
                    Name = _ReactionName,
                    Description = "A test reaction for MechanismReactionsControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createReactionTask = reactionService.CreateReactionAsync(newReaction);
                createReactionTask.Wait();
                var createdReaction = createReactionTask.Result;
                _ReactionId = createdReaction.Id;
                reactionCreated = true;
            }
        }

        [TestMethod]
        public async Task Add_Reaction_To_Mechanism()
        {
            // Arrange
            var mechanismReactionService = new MechanismReactionService(db);
            var controller = new MechanismReactionsController(mechanismReactionService);

            var mechanismReaction = new MechanismReaction
            {
                MechanismId = _MechanismId,
                ReactionId = _ReactionId
            };

            // Act
            await controller.AddReactionToMechanism(mechanismReaction);

            // Assert
            var reactions = await controller.GetReactionsByMechanismId(_MechanismId);
            var okResult = reactions.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionList = okResult.Value as IEnumerable<MechanismReaction>;
            Assert.IsNotNull(reactionList);

            var addedReaction = reactionList.FirstOrDefault(r => r.ReactionId == _ReactionId);
            Assert.IsNotNull(addedReaction);

            _MechanismReactionId = addedReaction.Id;
        }

        [TestMethod]
        public async Task Get_Reactions_By_MechanismId()
        {
            // Arrange
            var mechanismReactionService = new MechanismReactionService(db);
            var controller = new MechanismReactionsController(mechanismReactionService);

            // Act
            var reactions = await controller.GetReactionsByMechanismId(_MechanismId);

            // Assert
            var okResult = reactions.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionList = okResult.Value as IEnumerable<MechanismReaction>;
            Assert.IsNotNull(reactionList);
            Assert.IsTrue(reactionList.Any(r => r.ReactionId == _ReactionId));
        }

        [TestMethod]
        public async Task Remove_Reaction_From_Mechanism()
        {
            // Arrange
            var mechanismReactionService = new MechanismReactionService(db);
            var controller = new MechanismReactionsController(mechanismReactionService);

            // Act
            await controller.RemoveReactionFromMechanism(_MechanismReactionId);

            // Assert
            var reactions = await controller.GetReactionsByMechanismId(_MechanismId);
            var okResult = reactions.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionList = okResult.Value as IEnumerable<MechanismReaction>;
            Assert.IsNotNull(reactionList);

            var removedReaction = reactionList.FirstOrDefault(r => r.ReactionId == _ReactionId);
            Assert.IsNull(removedReaction);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            var db = DBConnection.DataSource;

            // Clean up the test mechanism reaction
            try
            {
                var mechanismReactionService = new MechanismReactionService(db);
                var deleteMechanismReactionTask = mechanismReactionService.RemoveReactionFromMechanismAsync(_MechanismReactionId);
                deleteMechanismReactionTask.Wait();
            }
            catch (AggregateException ex)
            {
                if (ex.InnerException is ArgumentException argEx && argEx.Message == "Reaction does not exist.")
                {
                    // Mapping already deleted; proceed without error
                }
                else
                {
                    throw; // Re-throw unexpected exceptions
                }
            }

            // Clean up the test mechanism
            if (mechanismCreated)
            {
                var mechanismService = new MechanismService(db);
                var deleteMechanismTask = mechanismService.DeleteMechanismAsync(_MechanismId);
                deleteMechanismTask.Wait();
            }

            // Clean up the test family
            var familyService = new FamilyService(db);
            var deleteFamilyTask = familyService.DeleteFamilyAsync(_FamilyId);
            deleteFamilyTask.Wait();

            // Clean up the test reaction
            if (reactionCreated)
            {
                var reactionService = new ReactionService(db);
                var deleteReactionTask = reactionService.DeleteReactionAsync(_ReactionId);
                deleteReactionTask.Wait();
            }
        }

    }
}
