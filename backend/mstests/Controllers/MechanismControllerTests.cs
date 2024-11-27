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
    public class MechanismControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _MechanismId = Guid.NewGuid();
        static Guid _FamilyId = Guid.NewGuid();
        static string _MechanismName = "TestMechanism";
        static string _MechanismDescription = "A test mechanism created by MechanismControllerTests.cs.";
        static string _CreatedBy = "MechanismControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;
        static bool mechanismFound = false;
        static bool familyCreated = false;

        [ClassInitialize]
        public static async Task ClassInit(TestContext context)
        {
            // Create a test family to associate with mechanisms
            var db = DBConnection.DataSource;
            var familyService = new FamilyService(db);
            var existingFamilies = await familyService.GetFamiliesAsync();
            var testFamily = existingFamilies.FirstOrDefault(f => f.Name == "TestMechanismFamily");

            if (testFamily != null)
            {
                _FamilyId = testFamily.Id;
                familyCreated = true;
            }
            else
            {
                var createdFamily = await familyService.CreateFamilyAsync("TestMechanismFamily", "A test family for MechanismControllerTests.", _CreatedBy);
                _FamilyId = createdFamily.Id; // Correctly assign the created family's ID
                familyCreated = true;
            }
        }


        [TestMethod]
        public async Task Get_All_Mechanisms()
        {
            // Arrange
            var mechanismService = new MechanismService(db);
            var controller = new MechanismsController(mechanismService);

            // Act
            var actionResult = await controller.GetMechanisms();

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var mechanismList = okResult.Value as IEnumerable<Mechanism>;
            Assert.IsNotNull(mechanismList);

            foreach (var mechanism in mechanismList)
            {
                if (mechanism.Name == _MechanismName)
                {
                    Console.WriteLine($"Test mechanism already found in DB: ID: {mechanism.Id}, Name: {mechanism.Name}");
                    _MechanismId = mechanism.Id;
                    mechanismFound = true;
                    break;
                }
            }
        }

        [TestMethod]
        public async Task Creates_Mechanism()
        {
            if (mechanismFound)
            {
                Console.WriteLine("Duplicate test mechanism. Skipping creation.");
                Assert.Inconclusive("Test mechanism already exists.");
            }

            // Arrange
            var mechanismService = new MechanismService(db);
            var controller = new MechanismsController(mechanismService);

            var testMechanism = new Mechanism
            {
                FamilyId = _FamilyId,
                Name = _MechanismName,
                Description = _MechanismDescription,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            var actionResult = await controller.CreateMechanism(testMechanism);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));

            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedMechanism = createdAtActionResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);

            _MechanismId = returnedMechanism.Id;
            Console.WriteLine($"Created Mechanism ID: {_MechanismId}, Name: {returnedMechanism.Name}");

            Assert.AreEqual(_MechanismName, returnedMechanism.Name);
            Assert.AreEqual(_MechanismDescription, returnedMechanism.Description);
            Assert.AreEqual(_CreatedBy, returnedMechanism.CreatedBy);
            Assert.AreEqual(_FamilyId, returnedMechanism.FamilyId);
        }

        [TestMethod]
        public async Task Get_Mechanism_Given_ID()
        {
            // Arrange
            var mechanismService = new MechanismService(db);
            var controller = new MechanismsController(mechanismService);

            // Act
            var actionResult = await controller.GetMechanism(_MechanismId);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedMechanism = okResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);

            Assert.AreEqual(_MechanismId, returnedMechanism.Id);
            Assert.AreEqual(_MechanismName, returnedMechanism.Name);
            Assert.AreEqual(_MechanismDescription, returnedMechanism.Description);
            Assert.AreEqual(_CreatedBy, returnedMechanism.CreatedBy);
            Assert.AreEqual(_FamilyId, returnedMechanism.FamilyId);
        }

        [TestMethod]
        public async Task Get_Mechanism_Given_FamilyId()
        {
            // Arrange
            var mechanismService = new MechanismService(db);
            var controller = new MechanismsController(mechanismService);

            // Act
            var actionResult = await controller.GetMechanismsByFamilyId(_FamilyId);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var mechanismList = okResult.Value as IEnumerable<Mechanism>;
            Assert.IsNotNull(mechanismList);
            Assert.AreEqual(mechanismList.Count(), 1);

            var returnedMechanism = mechanismList.First();
            

            Assert.AreEqual(_MechanismId, returnedMechanism.Id);
            Assert.AreEqual(_MechanismName, returnedMechanism.Name);
            Assert.AreEqual(_MechanismDescription, returnedMechanism.Description);
            Assert.AreEqual(_CreatedBy, returnedMechanism.CreatedBy);
            Assert.AreEqual(_FamilyId, returnedMechanism.FamilyId);
        }

        [TestMethod]
        public async Task Updates_Mechanism()
        {
            // Arrange
            var mechanismService = new MechanismService(db);
            var controller = new MechanismsController(mechanismService);

            string newName = "UpdatedTestMechanism";
            string newDescription = "An updated test mechanism.";

            var updatedMechanism = new Mechanism
            {
                Id = _MechanismId,
                FamilyId = _FamilyId,
                Name = newName,
                Description = newDescription,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            await controller.UpdateMechanism(_MechanismId, updatedMechanism);
            var actionResult = await controller.GetMechanism(_MechanismId);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedMechanism = okResult.Value as Mechanism;
            Assert.IsNotNull(returnedMechanism);

            Assert.AreEqual(_MechanismId, returnedMechanism.Id);
            Assert.AreEqual(newName, returnedMechanism.Name);
            Assert.AreEqual(newDescription, returnedMechanism.Description);
            Assert.AreEqual(_CreatedBy, returnedMechanism.CreatedBy);
            Assert.AreEqual(_FamilyId, returnedMechanism.FamilyId);
        }

        [TestMethod]
        public async Task Updates_Mechanism_mismatchedId()
        {
            // Arrange
            var service = new MechanismService(db);
            var controller = new MechanismsController(service);

            string newName = "UpdatedTestFamily";
            string newDescription = "An updated test family.";

            var updatedMechanism = new Mechanism
            {
                Id = new Guid("cccccccc-dddd-eeee-ffff-111111111111"),
                FamilyId = _FamilyId,
                Name = newName,
                Description = newDescription,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            var actionResult = await controller.UpdateMechanism(_MechanismId, updatedMechanism);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(BadRequestResult));
        }

        [TestMethod]
        public async Task Delete_Mechanism()
        {
            // Arrange
            var mechanismService = new MechanismService(db);
            var controller = new MechanismsController(mechanismService);

            // Act
            var findResult = await controller.GetMechanism(_MechanismId);
            Assert.IsNotNull(findResult);
            Assert.IsInstanceOfType(findResult.Result, typeof(OkObjectResult));

            await controller.DeleteMechanism(_MechanismId);

            var findDeletedResult = await controller.GetMechanism(_MechanismId);

            // Assert
            Assert.IsInstanceOfType(findDeletedResult.Result, typeof(NotFoundResult));
        }

        [ClassCleanup]
        public static async Task ClassCleanup()
        {
            // Clean up the test family if it was created
            if (familyCreated)
            {
                var db = DBConnection.DataSource;
                var familyService = new FamilyService(db);
                await familyService.DeleteFamilyAsync(_FamilyId);
            }
        }
    }
}
