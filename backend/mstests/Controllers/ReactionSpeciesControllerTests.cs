using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class ReactionSpeciesControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _FamilyId;
        static Guid _MechanismId;
        static Guid _ReactionId;
        static Guid _SpeciesReactantId;
        static Guid _SpeciesProductId;
        static Guid _ReactionSpeciesReactantId; // Mapping for reactant
        static Guid _ReactionSpeciesProductId;  // Mapping for product
        static string _FamilyName = "TestFamilyForReactionSpecies";
        static string _MechanismName = "TestMechanismForReactionSpecies";
        static string _ReactionName = "TestReactionForReactionSpecies";
        static string _SpeciesReactantName = "TestSpeciesReactantForReactionSpecies";
        static string _SpeciesProductName = "TestSpeciesProductForReactionSpecies";
        static string _CreatedBy = "ReactionSpeciesControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;
        static bool familyCreated = false;
        static bool mechanismCreated = false;
        static bool reactionCreated = false;
        static bool speciesReactantCreated = false;
        static bool speciesProductCreated = false;

        /// <summary>
        /// ClassInitialize ensures that the necessary Family, Mechanism, Reaction, and Species exist.
        /// Creates them if they don't and sets the corresponding IDs.
        /// </summary>
        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            var db = DBConnection.DataSource;

            // Ensure Family exists
            var familyService = new FamilyService(db);
            var familiesTask = familyService.GetFamiliesAsync();
            familiesTask.Wait();
            var families = familiesTask.Result;
            var testFamily = families.FirstOrDefault(f => f.Name == _FamilyName);

            if (testFamily != null)
            {
                _FamilyId = testFamily.Id;
                familyCreated = false;
            }
            else
            {
                var createFamilyTask = familyService.CreateFamilyAsync(_FamilyName, "A test family for ReactionSpeciesControllerTests.", _CreatedBy);
                createFamilyTask.Wait();
                var createdFamily = createFamilyTask.Result;
                _FamilyId = createdFamily.Id;
                familyCreated = true;
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
                mechanismCreated = false;
            }
            else
            {
                var newMechanism = new Mechanism
                {
                    FamilyId = _FamilyId,
                    Name = _MechanismName,
                    Description = "A test mechanism for ReactionSpeciesControllerTests.",
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
                reactionCreated = false;
            }
            else
            {
                var newReaction = new Reaction
                {
                    Name = _ReactionName,
                    Description = "A test reaction for ReactionSpeciesControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createReactionTask = reactionService.CreateReactionAsync(newReaction);
                createReactionTask.Wait();
                var createdReaction = createReactionTask.Result;
                _ReactionId = createdReaction.Id;
                reactionCreated = true;
            }

            // Ensure Reactant Species exists
            var speciesService = new SpeciesService(db);
            var speciesTask = speciesService.GetSpeciesAsync();
            speciesTask.Wait();
            var speciesList = speciesTask.Result;
            var testSpeciesReactant = speciesList.FirstOrDefault(s => s.Name == _SpeciesReactantName);

            if (testSpeciesReactant != null)
            {
                _SpeciesReactantId = testSpeciesReactant.Id;
                speciesReactantCreated = false;
            }
            else
            {
                var newSpeciesReactant = new Species
                {
                    Name = _SpeciesReactantName,
                    Description = "A test reactant species for ReactionSpeciesControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createSpeciesReactantTask = speciesService.CreateSpeciesAsync(newSpeciesReactant);
                createSpeciesReactantTask.Wait();
                var createdSpeciesReactant = createSpeciesReactantTask.Result;
                _SpeciesReactantId = createdSpeciesReactant.Id;
                speciesReactantCreated = true;
            }

            // Ensure Product Species exists
            var testSpeciesProduct = speciesList.FirstOrDefault(s => s.Name == _SpeciesProductName);

            if (testSpeciesProduct != null)
            {
                _SpeciesProductId = testSpeciesProduct.Id;
                speciesProductCreated = false;
            }
            else
            {
                var newSpeciesProduct = new Species
                {
                    Name = _SpeciesProductName,
                    Description = "A test product species for ReactionSpeciesControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createSpeciesProductTask = speciesService.CreateSpeciesAsync(newSpeciesProduct);
                createSpeciesProductTask.Wait();
                var createdSpeciesProduct = createSpeciesProductTask.Result;
                _SpeciesProductId = createdSpeciesProduct.Id;
                speciesProductCreated = true;
            }
        }

        /// <summary>
        /// Adds a species as a reactant to a reaction and verifies the addition.
        /// </summary>
        [TestMethod]
        public async Task Add_Species_To_Reaction_As_Reactant()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            var reactionSpecies = new ReactionSpecies
            {
                ReactionId = _ReactionId,
                SpeciesId = _SpeciesReactantId,
                Role = "reactant",
            };

            // Act
            await controller.AddSpeciesToReaction(reactionSpecies);

            // Assert
            var species = await controller.GetSpeciesByReactionId(_ReactionId);
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionSpeciesList = okResult.Value as IEnumerable<ReactionSpecies>;
            Assert.IsNotNull(reactionSpeciesList);

            var addedReactionSpecies = reactionSpeciesList.FirstOrDefault(rs => rs.SpeciesId == _SpeciesReactantId && rs.Role == "reactant");
            Assert.IsNotNull(addedReactionSpecies);

            _ReactionSpeciesReactantId = addedReactionSpecies.Id;
        }

        /// <summary>
        /// Adds a species as a product to a reaction and verifies the addition.
        /// </summary>
        [TestMethod]
        public async Task Add_Species_To_Reaction_As_Product()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            var reactionSpecies = new ReactionSpecies
            {
                ReactionId = _ReactionId,
                SpeciesId = _SpeciesProductId,
                Role = "product",
            };

            // Act
            await controller.AddSpeciesToReaction(reactionSpecies);

            // Assert
            var species = await controller.GetSpeciesByReactionId(_ReactionId);
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionSpeciesList = okResult.Value as IEnumerable<ReactionSpecies>;
            Assert.IsNotNull(reactionSpeciesList);

            var addedReactionSpecies = reactionSpeciesList.FirstOrDefault(rs => rs.SpeciesId == _SpeciesProductId && rs.Role == "product");
            Assert.IsNotNull(addedReactionSpecies);

            _ReactionSpeciesProductId = addedReactionSpecies.Id;
        }

        /// <summary>
        /// Retrieves all species associated with a reaction and verifies the retrieval.
        /// </summary>
        [TestMethod]
        public async Task Get_Species_By_ReactionId()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            // Act
            var species = await controller.GetSpeciesByReactionId(_ReactionId);

            // Assert
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionSpeciesList = okResult.Value as IEnumerable<ReactionSpecies>;
            Assert.IsNotNull(reactionSpeciesList);
            Assert.IsTrue(reactionSpeciesList.Any(rs => rs.SpeciesId == _SpeciesReactantId));
            Assert.IsTrue(reactionSpeciesList.Any(rs => rs.SpeciesId == _SpeciesProductId));
        }

        /// <summary>
        /// Retrieves only reactants associated with a reaction and verifies the retrieval.
        /// </summary>
        [TestMethod]
        public async Task Get_Reactants_By_ReactionId()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            // Act
            var reactants = await controller.GetReactantsByReactionId(_ReactionId);

            // Assert
            var okResult = reactants.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactantList = okResult.Value as IEnumerable<ReactionSpeciesDto>;
            Assert.IsNotNull(reactantList);
            Assert.IsTrue(reactantList.All(r => r.Role == "reactant"));
            Assert.IsTrue(reactantList.Any(r => r.SpeciesId == _SpeciesReactantId));
        }

        /// <summary>
        /// Retrieves only products associated with a reaction and verifies the retrieval.
        /// </summary>
        [TestMethod]
        public async Task Get_Products_By_ReactionId()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            // Act
            var products = await controller.GetProductsByReactionId(_ReactionId);

            // Assert
            var okResult = products.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var productList = okResult.Value as IEnumerable<ReactionSpeciesDto>;
            Assert.IsNotNull(productList);
            Assert.IsTrue(productList.All(r => r.Role == "product"));
            Assert.IsTrue(productList.Any(r => r.SpeciesId == _SpeciesProductId));
        }

        /// <summary>
        /// Updates the role of a species in a reaction and verifies the update.
        /// </summary>
        [TestMethod]
        public async Task Update_ReactionSpecies_Role()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            var updatedReactionSpecies = new ReactionSpecies
            {
                Id = _ReactionSpeciesReactantId,
                ReactionId = _ReactionId,
                SpeciesId = _SpeciesReactantId,
                Role = "product", // Change role from reactant to product
            };

            // Act
            var result = await controller.UpdateReactionSpecies(_ReactionSpeciesReactantId, updatedReactionSpecies);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify the update
            var species = await controller.GetSpeciesByReactionId(_ReactionId);
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionSpeciesList = okResult.Value as IEnumerable<ReactionSpecies>;
            Assert.IsNotNull(reactionSpeciesList);

            var updatedEntry = reactionSpeciesList.FirstOrDefault(rs => rs.Id == _ReactionSpeciesReactantId);
            Assert.IsNotNull(updatedEntry);
            Assert.AreEqual("product", updatedEntry.Role);
            updatedReactionSpecies.Role = "reactant";
            var revertResult = await controller.UpdateReactionSpecies(_ReactionSpeciesReactantId, updatedReactionSpecies);
            Assert.IsInstanceOfType(revertResult, typeof(NoContentResult));
        }

        [TestMethod]
        public async Task Updates_Reaction_mismatchedId()
        {
            // Arrange
            var service = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(service);

            var updatedReactionSpecies = new ReactionSpecies
            {
                Id = new Guid("cccccccc-dddd-eeee-ffff-111111111111"),
                ReactionId = _ReactionId,
                SpeciesId = _SpeciesReactantId,
                Role = "product", // Change role from reactant to product
            };

            // Act
            var actionResult = await controller.UpdateReactionSpecies(_ReactionSpeciesReactantId, updatedReactionSpecies);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(BadRequestResult));
        }

        /// <summary>
        /// Removes a species from a reaction and verifies the removal.
        /// </summary>
        [TestMethod]
        public async Task Remove_Species_From_Reaction()
        {
            // Arrange
            var reactionSpeciesService = new ReactionSpeciesService(db);
            var controller = new ReactionSpeciesController(reactionSpeciesService);

            // Act
            var result = await controller.RemoveSpeciesFromReaction(_ReactionSpeciesReactantId);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify removal
            var species = await controller.GetSpeciesByReactionId(_ReactionId);
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var reactionSpeciesList = okResult.Value as IEnumerable<ReactionSpecies>;
            Assert.IsNotNull(reactionSpeciesList);

            var removedEntry = reactionSpeciesList.FirstOrDefault(rs => rs.Id == _ReactionSpeciesReactantId);
            Assert.IsNull(removedEntry);
        }

        /// <summary>
        /// ClassCleanup deletes all test data created during the tests.
        /// Handles cases where entries might already be deleted to prevent exceptions.
        /// </summary>
        [ClassCleanup]
        public static void ClassCleanup()
        {
            var db = DBConnection.DataSource;

            // Clean up the test ReactionSpecies entries
            try
            {
                var reactionSpeciesService = new ReactionSpeciesService(db);
                // Remove reactant mapping if it still exists
                var deleteReactantTask = reactionSpeciesService.RemoveSpeciesFromReactionAsync(_ReactionSpeciesReactantId);
                deleteReactantTask.Wait();
            }
            catch (AggregateException ex)
            {
                if (ex.InnerException is MySqlException mysqlEx && mysqlEx.Message.Contains("does not exist"))
                {
                    // Mapping already deleted; proceed without error
                    Console.WriteLine("ReactionSpecies reactant mapping already deleted.");
                }
                else
                {
                    throw; // Re-throw unexpected exceptions
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error during cleanup (Reactant): {ex.Message}");
                throw;
            }

            try
            {
                var reactionSpeciesService = new ReactionSpeciesService(db);
                // Remove product mapping if it still exists
                var deleteProductTask = reactionSpeciesService.RemoveSpeciesFromReactionAsync(_ReactionSpeciesProductId);
                deleteProductTask.Wait();
            }
            catch (AggregateException ex)
            {
                if (ex.InnerException is MySqlException mysqlEx && mysqlEx.Message.Contains("does not exist"))
                {
                    // Mapping already deleted; proceed without error
                    Console.WriteLine("ReactionSpecies product mapping already deleted.");
                }
                else
                {
                    throw; // Re-throw unexpected exceptions
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error during cleanup (Product): {ex.Message}");
                throw;
            }

            // Clean up the test Reaction
            if (reactionCreated)
            {
                try
                {
                    var reactionService = new ReactionService(db);
                    var deleteReactionTask = reactionService.DeleteReactionAsync(_ReactionId);
                    deleteReactionTask.Wait();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error deleting Reaction: {ex.Message}");
                }
            }

            // Clean up the test Mechanism
            if (mechanismCreated)
            {
                try
                {
                    var mechanismService = new MechanismService(db);
                    var deleteMechanismTask = mechanismService.DeleteMechanismAsync(_MechanismId);
                    deleteMechanismTask.Wait();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error deleting Mechanism: {ex.Message}");
                }
            }

            // Clean up the test Family
            if (familyCreated)
            {
                try
                {
                    var familyService = new FamilyService(db);
                    var deleteFamilyTask = familyService.DeleteFamilyAsync(_FamilyId);
                    deleteFamilyTask.Wait();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error deleting Family: {ex.Message}");
                }
            }

            // Clean up the test Reactant Species
            if (speciesReactantCreated)
            {
                try
                {
                    var speciesService = new SpeciesService(db);
                    var deleteSpeciesReactantTask = speciesService.DeleteSpeciesAsync(_SpeciesReactantId);
                    deleteSpeciesReactantTask.Wait();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error deleting Reactant Species: {ex.Message}");
                }
            }

            // Clean up the test Product Species
            if (speciesProductCreated)
            {
                try
                {
                    var speciesService = new SpeciesService(db);
                    var deleteSpeciesProductTask = speciesService.DeleteSpeciesAsync(_SpeciesProductId);
                    deleteSpeciesProductTask.Wait();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error deleting Product Species: {ex.Message}");
                }
            }
        }
    }
}
