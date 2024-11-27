using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Linq; // Added for LINQ methods
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class InitialConditionsControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _InitialConditionId;
        static Guid _MechanismId;
        static Guid _SpeciesId;
        static string _MechanismName = "TestMechanismForInitialConditions";
        static string _SpeciesName = "TestSpeciesForInitialConditions";
        static string _CreatedBy = "InitialConditionsControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;
        static bool mechanismCreated = false;
        static bool speciesCreated = false;
        static bool familyCreated = false;
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
            var testFamily = families.FirstOrDefault(f => f.Name == "TestFamilyForInitialConditions");

            if (testFamily != null)
            {
                _FamilyId = testFamily.Id;
                familyCreated = false;
            }
            else
            {
                var createFamilyTask = familyService.CreateFamilyAsync("TestFamilyForInitialConditions", "A test family for InitialConditionsControllerTests.", _CreatedBy);
                createFamilyTask.Wait();
                var createdFamily = createFamilyTask.Result;
                _FamilyId = createdFamily.Id;
                familyCreated = true;
            }

            // Ensure Mechanism exists
            var mechanismService = new MechanismService(db);
            var mechanismTask = mechanismService.GetMechanismsAsync();
            mechanismTask.Wait();
            var mechanisms = mechanismTask.Result;
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
                    Description = "A test mechanism for InitialConditionsControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createMechanismTask = mechanismService.CreateMechanismAsync(newMechanism);
                createMechanismTask.Wait();
                var createdMechanism = createMechanismTask.Result;
                _MechanismId = createdMechanism.Id;
                mechanismCreated = true;
            }

            // Ensure Species exists
            var speciesService = new SpeciesService(db);
            var speciesTask = speciesService.GetSpeciesAsync();
            speciesTask.Wait();
            var speciesList = speciesTask.Result;
            var testSpecies = speciesList.FirstOrDefault(s => s.Name == _SpeciesName);

            if (testSpecies != null)
            {
                _SpeciesId = testSpecies.Id;
                speciesCreated = false;
            }
            else
            {
                var newSpecies = new Species
                {
                    Name = _SpeciesName,
                    Description = "A test species for InitialConditionsControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createSpeciesTask = speciesService.CreateSpeciesAsync(newSpecies);
                createSpeciesTask.Wait();
                var createdSpecies = createSpeciesTask.Result;
                _SpeciesId = createdSpecies.Id;
                speciesCreated = true;
            }
        }

        [TestMethod]
        public async Task Get_InitialConditions_By_MechanismId()
        {
            // Arrange
            var initialConditionsService = new InitialConditionSpeciesService(db);
            var controller = new InitialConditionsController(initialConditionsService);

            // Act
            var actionResult = await controller.GetInitialConditionsByMechanismId(_MechanismId);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var initialConditionsList = okResult.Value as IEnumerable<InitialConditionsSpecies>;
            Assert.IsNotNull(initialConditionsList);
        }

        [TestMethod]
        public async Task Creates_InitialCondition()
        {
            // Arrange
            var initialConditionsService = new InitialConditionSpeciesService(db);
            var controller = new InitialConditionsController(initialConditionsService);

            var testInitialCondition = new InitialConditionsSpecies
            {
                MechanismId = _MechanismId,
                SpeciesId = _SpeciesId,
                Concentration = 1.0,
                Temperature = 298.15,
                Pressure = 1.0,
                AdditionalConditions = "Test conditions",
                AbsConvergenceTolerance = 0.001,
                DiffusionCoefficient = 0.5,
                MolecularWeight = 18.01528,
                FixedConcentration = 0.0
            };

            // Act
            var actionResult = await controller.CreateInitialCondition(testInitialCondition);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));

            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedInitialCondition = createdAtActionResult.Value as InitialConditionsSpecies;
            Assert.IsNotNull(returnedInitialCondition);

            _InitialConditionId = returnedInitialCondition.Id;
            Console.WriteLine($"Created InitialCondition ID: {_InitialConditionId}");

            Assert.AreEqual(_MechanismId, returnedInitialCondition.MechanismId);
            Assert.AreEqual(_SpeciesId, returnedInitialCondition.SpeciesId);
            Assert.AreEqual(1.0, returnedInitialCondition.Concentration);
            Assert.AreEqual(298.15, returnedInitialCondition.Temperature);
        }

        [TestMethod]
        public async Task Updates_InitialCondition()
        {
            // Arrange
            var initialConditionsService = new InitialConditionSpeciesService(db);
            var controller = new InitialConditionsController(initialConditionsService);

            var updatedInitialCondition = new InitialConditionsSpecies
            {
                Id = _InitialConditionId,
                MechanismId = _MechanismId,
                SpeciesId = _SpeciesId,
                Concentration = 2.0,
                Temperature = 300.0,
                Pressure = 1.5,
                AdditionalConditions = "Updated test conditions",
                AbsConvergenceTolerance = 0.002,
                DiffusionCoefficient = 0.6,
                MolecularWeight = 18.01528,
                FixedConcentration = 0.0
            };

            // Act
            await controller.UpdateInitialCondition(_InitialConditionId, updatedInitialCondition);
            var actionResult = await controller.GetInitialConditionsByMechanismId(_MechanismId);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var initialConditionsList = okResult.Value as IEnumerable<InitialConditionsSpecies>;
            Assert.IsNotNull(initialConditionsList);

            var returnedInitialCondition = initialConditionsList.FirstOrDefault(ic => ic.Id == _InitialConditionId);
            Assert.IsNotNull(returnedInitialCondition);

            Assert.AreEqual(2.0, returnedInitialCondition.Concentration);
            Assert.AreEqual(300.0, returnedInitialCondition.Temperature);
            Assert.AreEqual(1.5, returnedInitialCondition.Pressure);
            Assert.AreEqual("Updated test conditions", returnedInitialCondition.AdditionalConditions);
        }

        [TestMethod]
        public async Task Updates_InitialConditions_mismatchedId()
        {
            // Arrange
            var service = new InitialConditionSpeciesService(db);
            var controller = new InitialConditionsController(service);

            var updatedInitialCondition = new InitialConditionsSpecies
            {
                Id = new Guid("cccccccc-dddd-eeee-ffff-111111111111"),
                MechanismId = _MechanismId,
                SpeciesId = _SpeciesId,
                Concentration = 2.0,
                Temperature = 300.0,
                Pressure = 1.5,
                AdditionalConditions = "Updated test conditions",
                AbsConvergenceTolerance = 0.002,
                DiffusionCoefficient = 0.6,
                MolecularWeight = 18.01528,
                FixedConcentration = 0.0
            };

            // Act
            var actionResult = await controller.UpdateInitialCondition(_InitialConditionId, updatedInitialCondition);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(BadRequestResult));
        }

        [TestMethod]
        public async Task Delete_InitialCondition()
        {
            // Arrange
            var initialConditionsService = new InitialConditionSpeciesService(db);
            var controller = new InitialConditionsController(initialConditionsService);

            // Act
            await controller.DeleteInitialCondition(_InitialConditionId);
            var actionResult = await controller.GetInitialConditionsByMechanismId(_MechanismId);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var initialConditionsList = okResult.Value as IEnumerable<InitialConditionsSpecies>;
            Assert.IsNotNull(initialConditionsList);

            var deletedInitialCondition = initialConditionsList.FirstOrDefault(ic => ic.Id == _InitialConditionId);
            Assert.IsNull(deletedInitialCondition);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            var db = DBConnection.DataSource;

            // Clean up the test initial condition
            if (_InitialConditionId != Guid.Empty)
            {
                var initialConditionsService = new InitialConditionSpeciesService(db);
                var deleteTask = initialConditionsService.DeleteInitialConditionAsync(_InitialConditionId);
                deleteTask.Wait();
            }

            // Clean up the test mechanism
            if (mechanismCreated)
            {
                var mechanismService = new MechanismService(db);
                var deleteMechanismTask = mechanismService.DeleteMechanismAsync(_MechanismId);
                deleteMechanismTask.Wait();
            }

            // Clean up the test family
            if (familyCreated)
            {
                var familyService = new FamilyService(db);
                var deleteFamilyTask = familyService.DeleteFamilyAsync(_FamilyId);
                deleteFamilyTask.Wait();
            }

            // Clean up the test species
            if (speciesCreated)
            {
                var speciesService = new SpeciesService(db);
                var deleteSpeciesTask = speciesService.DeleteSpeciesAsync(_SpeciesId);
                deleteSpeciesTask.Wait();
            }
        }
    }
}
