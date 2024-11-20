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
    public class FamilyControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _Id = new Guid("cccccccc-dddd-eeee-ffff-000000000000");
        static string _Name = "TestFamily";
        static string _Description = "A test family created by FamilyControllerTests.cs.";
        static string _CreatedBy = "FamilyControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;
        static bool found = false;

        [TestMethod]
        public async Task Get_All_Families()
        {
            // Arrange
            var familyService = new FamilyService(db);
            var controller = new FamiliesController(familyService);

            // Act
            var actionResult = await controller.GetFamilies();

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var familyList = okResult.Value as IEnumerable<Family>;
            Assert.IsNotNull(familyList);

            foreach (var family in familyList)
            {
                if (family.Name == _Name)
                {
                    Console.WriteLine($"Test family already found in DB: ID: {family.Id}, Name: {family.Name}");
                    _Id = family.Id;
                    found = true;
                    break;
                }
            }
        }

        [TestMethod]
        public async Task Creates_Family()
        {
            if (found)
            {
                Console.WriteLine("Duplicate test family. Skipping creation.");
                Assert.Inconclusive("Test family already exists.");
            }

            // Arrange
            var familyService = new FamilyService(db);
            var controller = new FamiliesController(familyService);

            var testFamily = new Family
            {
                Name = _Name,
                Description = _Description,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            var actionResult = await controller.CreateFamily(testFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));

            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedFamily = createdAtActionResult.Value as Family;
            Assert.IsNotNull(returnedFamily);

            _Id = returnedFamily.Id;
            Console.WriteLine($"Created Family ID: {_Id}, Name: {returnedFamily.Name}");

            Assert.AreEqual(_Name, returnedFamily.Name);
            Assert.AreEqual(_Description, returnedFamily.Description);
            Assert.AreEqual(_CreatedBy, returnedFamily.CreatedBy);
        }

        [TestMethod]
        public async Task Get_Family_Given_ID()
        {
            // Arrange
            var familyService = new FamilyService(db);
            var controller = new FamiliesController(familyService);

            // Act
            var actionResult = await controller.GetFamily(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedFamily = okResult.Value as Family;
            Assert.IsNotNull(returnedFamily);

            Assert.AreEqual(_Id, returnedFamily.Id);
            Assert.AreEqual(_Name, returnedFamily.Name);
            Assert.AreEqual(_Description, returnedFamily.Description);
            Assert.AreEqual(_CreatedBy, returnedFamily.CreatedBy);
        }

        [TestMethod]
        public async Task Updates_Family()
        {
            // Arrange
            var familyService = new FamilyService(db);
            var controller = new FamiliesController(familyService);

            string newName = "UpdatedTestFamily";
            string newDescription = "An updated test family.";

            var updatedFamily = new Family
            {
                Id = _Id,
                Name = newName,
                Description = newDescription,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            // Act
            await controller.UpdateFamily(_Id, updatedFamily);
            var actionResult = await controller.GetFamily(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedFamily = okResult.Value as Family;
            Assert.IsNotNull(returnedFamily);

            Assert.AreEqual(_Id, returnedFamily.Id);
            Assert.AreEqual(newName, returnedFamily.Name);
            Assert.AreEqual(newDescription, returnedFamily.Description);
            Assert.AreEqual(_CreatedBy, returnedFamily.CreatedBy);
        }

        [TestMethod]
        public async Task Delete_Family()
        {
            // Arrange
            var familyService = new FamilyService(db);
            var controller = new FamiliesController(familyService);

            // Act
            var findResult = await controller.GetFamily(_Id);
            Assert.IsNotNull(findResult);
            Assert.IsInstanceOfType(findResult.Result, typeof(OkObjectResult));

            await controller.DeleteFamily(_Id);

            var findDeletedResult = await controller.GetFamily(_Id);

            // Assert
            Assert.IsInstanceOfType(findDeletedResult.Result, typeof(NotFoundResult));
        }
    }
}
