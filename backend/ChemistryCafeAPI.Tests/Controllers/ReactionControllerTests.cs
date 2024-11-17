using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class ReactionControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _Id = new Guid("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
        static string _Name = "TestReaction";
        static string _Description = "A test reaction created by ReactionControllerTests.cs.";
        static string _CreatedBy = "ReactionControllerTests.cs";
        static DateTime _CreatedDate;
        static bool found = false;

        [TestMethod]
        public async Task Get_All_Reactions()
        {
            // Arrange
            var reactionService = new ReactionService(db);
            var controller = new ReactionsController(reactionService);

            // Act
            var actionResult = await controller.GetReactions();

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionList = okResult.Value as IEnumerable<Reaction>;
            Assert.IsNotNull(reactionList);

            foreach (var reaction in reactionList)
            {
                if (reaction.Name == _Name)
                {
                    Console.WriteLine($"Test reaction already found in DB: ID: {reaction.Id}, Name: {reaction.Name}");
                    _Id = reaction.Id;
                    found = true;
                    break;
                }
            }
        }

        [TestMethod]
        public async Task Creates_Reaction()
        {
            if (found)
            {
                Console.WriteLine("Duplicate test reaction. Skipping creation.");
                Assert.Inconclusive("Test reaction already exists.");
            }

            // Arrange
            var reactionService = new ReactionService(db);
            var controller = new ReactionsController(reactionService);

            var testReaction = new Reaction
            {
                Name = _Name,
                Description = _Description,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            var actionResult = await controller.CreateReaction(testReaction);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));

            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedReaction = createdAtActionResult.Value as Reaction;
            Assert.IsNotNull(returnedReaction);

            _Id = returnedReaction.Id;
            Console.WriteLine($"Created Reaction ID: {_Id}, Name: {returnedReaction.Name}");

            Assert.AreEqual(_Name, returnedReaction.Name);
            Assert.AreEqual(_Description, returnedReaction.Description);
            Assert.AreEqual(_CreatedBy, returnedReaction.CreatedBy);
        }

        [TestMethod]
        public async Task Get_Reaction_Given_ID()
        {
            // Arrange
            var reactionService = new ReactionService(db);
            var controller = new ReactionsController(reactionService);

            // Act
            var actionResult = await controller.GetReaction(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedReaction = okResult.Value as Reaction;
            Assert.IsNotNull(returnedReaction);

            Assert.AreEqual(_Id, returnedReaction.Id);
            Assert.AreEqual(_Name, returnedReaction.Name);
            Assert.AreEqual(_Description, returnedReaction.Description);
            Assert.AreEqual(_CreatedBy, returnedReaction.CreatedBy);
        }

        [TestMethod]
        public async Task Updates_Reaction()
        {
            // Arrange
            var reactionService = new ReactionService(db);
            var controller = new ReactionsController(reactionService);

            string newName = "UpdatedTestReaction";
            string newDescription = "An updated test reaction.";

            var updatedReaction = new Reaction
            {
                Id = _Id,
                Name = newName,
                Description = newDescription,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            await controller.UpdateReaction(_Id, updatedReaction);
            var actionResult = await controller.GetReaction(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedReaction = okResult.Value as Reaction;
            Assert.IsNotNull(returnedReaction);

            Assert.AreEqual(_Id, returnedReaction.Id);
            Assert.AreEqual(newName, returnedReaction.Name);
            Assert.AreEqual(newDescription, returnedReaction.Description);
            Assert.AreEqual(_CreatedBy, returnedReaction.CreatedBy);
        }

        [TestMethod]
        public async Task Delete_Reaction()
        {
            // Arrange
            var reactionService = new ReactionService(db);
            var controller = new ReactionsController(reactionService);

            // Act
            var findResult = await controller.GetReaction(_Id);
            Assert.IsNotNull(findResult);
            Assert.IsInstanceOfType(findResult.Result, typeof(OkObjectResult));

            await controller.DeleteReaction(_Id);

            var findDeletedResult = await controller.GetReaction(_Id);

            // Assert
            Assert.IsInstanceOfType(findDeletedResult.Result, typeof(NotFoundResult));
        }
    }
}