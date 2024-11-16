using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.Extensions.Logging;
using Moq; // For mocking ILogger

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class MechanismSpeciesControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _MechanismId;
        static Guid _SpeciesId;
        static Guid _MechanismSpeciesId;
        static string _MechanismName = "TestMechanismForMechanismSpecies";
        static string _SpeciesName = "TestSpeciesForMechanismSpecies";
        static string _CreatedBy = "MechanismSpeciesControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;
        static bool mechanismCreated = false;
        static bool speciesCreated = false;
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
            var testFamily = families.FirstOrDefault(f => f.Name == "TestFamilyForMechanismSpecies");

            if (testFamily != null)
            {
                _FamilyId = testFamily.Id;
            }
            else
            {
                var createFamilyTask = familyService.CreateFamilyAsync("TestFamilyForMechanismSpecies", "A test family for MechanismSpeciesControllerTests.", _CreatedBy);
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
                    Description = "A test mechanism for MechanismSpeciesControllerTests.",
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
            }
            else
            {
                var newSpecies = new Species
                {
                    Name = _SpeciesName,
                    Description = "A test species for MechanismSpeciesControllerTests.",
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
        public async Task Add_Species_To_Mechanism()
        {
            // Arrange
            var logger = new Mock<ILogger<MechanismSpeciesService>>();
            var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
            var controller = new MechanismSpeciesController(mechanismSpeciesService);

            var mechanismSpecies = new MechanismSpecies
            {
                MechanismId = _MechanismId,
                SpeciesId = _SpeciesId
            };

            // Act
            await controller.AddSpeciesToMechanism(mechanismSpecies);

            // Assert
            var species = await controller.GetSpeciesByMechanismId(_MechanismId);
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var speciesList = okResult.Value as IEnumerable<Species>;
            Assert.IsNotNull(speciesList);

            var addedSpecies = speciesList.FirstOrDefault(s => s.Id == _SpeciesId);
            Assert.IsNotNull(addedSpecies);

            // Get MechanismSpeciesId for deletion
            var mechanismSpeciesList = await mechanismSpeciesService.GetMechanismSpeciesByMechanismIdAsync(_MechanismId);
            var mechanismSpeciesEntry = mechanismSpeciesList.FirstOrDefault(ms => ms.SpeciesId == _SpeciesId);
            if (mechanismSpeciesEntry != null)
            {
                _MechanismSpeciesId = mechanismSpeciesEntry.Id;
            }
        }

        [TestMethod]
        public async Task Get_Species_By_MechanismId()
        {
            // Arrange
            var logger = new Mock<ILogger<MechanismSpeciesService>>();
            var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
            var controller = new MechanismSpeciesController(mechanismSpeciesService);

            // Act
            var species = await controller.GetSpeciesByMechanismId(_MechanismId);

            // Assert
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var speciesList = okResult.Value as IEnumerable<Species>;
            Assert.IsNotNull(speciesList);
            Assert.IsTrue(speciesList.Any(s => s.Id == _SpeciesId));
        }

        [TestMethod]
        public async Task Remove_Species_From_Mechanism()
        {
            // Arrange
            var logger = new Mock<ILogger<MechanismSpeciesService>>();
            var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
            var controller = new MechanismSpeciesController(mechanismSpeciesService);

            // Act
            await controller.RemoveSpeciesFromMechanism(_MechanismSpeciesId);

            // Assert
            var species = await controller.GetSpeciesByMechanismId(_MechanismId);
            var okResult = species.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var speciesList = okResult.Value as IEnumerable<Species>;
            Assert.IsNotNull(speciesList);

            var removedSpecies = speciesList.FirstOrDefault(s => s.Id == _SpeciesId);
            Assert.IsNull(removedSpecies);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            var db = DBConnection.DataSource;

            // Clean up the test mechanism species
            var logger = new Mock<ILogger<MechanismSpeciesService>>();
            var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
            var deleteMechanismSpeciesTask = mechanismSpeciesService.RemoveSpeciesFromMechanismAsync(_MechanismSpeciesId);
            deleteMechanismSpeciesTask.Wait();

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
