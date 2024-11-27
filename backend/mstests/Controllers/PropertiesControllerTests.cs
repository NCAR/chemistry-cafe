using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Services;
using Chemistry_Cafe_API.Models;
using MySqlConnector;
using System;
using System.Linq;
using System.Collections.Generic;
using Moq; // For mocking ILogger

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class PropertiesControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;

        // IDs for test data
        static Guid _FamilyId;
        static Guid _MechanismId;
        static Guid _SpeciesId;
        static Guid _PropertyId;

        // Flags to track created data
        static bool familyCreated = false;
        static bool mechanismCreated = false;
        static bool speciesCreated = false;
        static bool propertyCreated = false;

        // Test data constants
        const string _FamilyName = "TestFamilyForProperties";
        const string _MechanismName = "TestMechanismForProperties";
        const string _SpeciesName = "TestSpeciesForProperties";
        const string _CreatedBy = "PropertiesControllerTests.cs";
        static DateTime _CreatedDate = DateTime.UtcNow;

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
            }
            else
            {
                var createFamilyTask = familyService.CreateFamilyAsync(_FamilyName, "A test family for PropertiesControllerTests.", _CreatedBy);
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
            }
            else
            {
                var newMechanism = new Mechanism
                {
                    FamilyId = _FamilyId,
                    Name = _MechanismName,
                    Description = "A test mechanism for PropertiesControllerTests.",
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
                    Description = "A test species for PropertiesControllerTests.",
                    CreatedBy = _CreatedBy,
                    CreatedDate = _CreatedDate
                };

                var createSpeciesTask = speciesService.CreateSpeciesAsync(newSpecies);
                createSpeciesTask.Wait();
                var createdSpecies = createSpeciesTask.Result;
                _SpeciesId = createdSpecies.Id;
                speciesCreated = true;
            }

            // Add Species to Mechanism
            var logger = new Mock<ILogger<MechanismSpeciesService>>();
            var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
            var addSpeciesToMechanismTask = mechanismSpeciesService.AddSpeciesToMechanismAsync(new MechanismSpecies
            {
                MechanismId = _MechanismId,
                SpeciesId = _SpeciesId
            });
            addSpeciesToMechanismTask.Wait();
        }

        [TestMethod]
        public async Task CreateProperty_Returns_Created_Property()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            var newProperty = new Property
            {
                SpeciesId = _SpeciesId,
                MechanismId = _MechanismId,
                Tolerance = 0.1,
                Weight = 1.0,
                Concentration = 0.5,
                Diffusion = 0.01
            };

            // Act
            var result = await controller.CreateProperty(newProperty);

            // Assert
            var createdAtActionResult = result.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);
            var createdProperty = createdAtActionResult.Value as Property;
            Assert.IsNotNull(createdProperty);
            Assert.AreEqual(_SpeciesId, createdProperty.SpeciesId);
            Assert.AreEqual(_MechanismId, createdProperty.MechanismId);

            // Store the PropertyId for cleanup
            _PropertyId = createdProperty.Id;
            propertyCreated = true;
        }

        [TestMethod]
        public async Task CreateProperty_WithEmptySpecies_ReturnsBadRequest()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            var newProperty = new Property
            {
                SpeciesId = Guid.Empty,
                MechanismId = _MechanismId,
                Tolerance = 0.1,
                Weight = 1.0,
                Concentration = 0.5,
                Diffusion = 0.01
            };

            // Act
            var result = await controller.CreateProperty(newProperty);

            // Assert
            var createdAtActionResult = result.Result as BadRequestObjectResult;
            Assert.IsNotNull(createdAtActionResult);
        }

        [TestMethod]
        public async Task CreateProperty_WithEmptyMechanism_ReturnsBadRequest()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            var newProperty = new Property
            {
                SpeciesId = _SpeciesId,
                MechanismId = Guid.Empty,
                Tolerance = 0.1,
                Weight = 1.0,
                Concentration = 0.5,
                Diffusion = 0.01
            };

            // Act
            var result = await controller.CreateProperty(newProperty);

            // Assert
            var createdAtActionResult = result.Result as BadRequestObjectResult;
            Assert.IsNotNull(createdAtActionResult);
        }



        [TestMethod]
        public async Task GetProperties_Returns_List()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            // Act
            var result = await controller.GetProperties();

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var properties = okResult.Value as IEnumerable<Property>;
            Assert.IsNotNull(properties);
            Assert.IsTrue(properties.Any());
        }

        [TestMethod]
        public async Task GetPropertyById_Returns_Property()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            // Ensure property exists
            if (!propertyCreated)
            {
                await CreateProperty_Returns_Created_Property();
            }

            // Act
            var result = await controller.GetPropertyById(_PropertyId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var property = okResult.Value as Property;
            Assert.IsNotNull(property);
            Assert.AreEqual(_PropertyId, property.Id);
        }

        [TestMethod]
        public async Task GetPropertyBySandM_Returns_Property()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            // Act
            var result = await controller.GetPropertyBySandM(_SpeciesId, _MechanismId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var property = okResult.Value as Property;
            Assert.IsNotNull(property);
            Assert.AreEqual(_SpeciesId, property.SpeciesId);
            Assert.AreEqual(_MechanismId, property.MechanismId);
            
        }

        [TestMethod]
        public async Task GetPropertyBySandM_Returns_NotFound()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            // Ensure property exists
            if (!propertyCreated)
            {
                await CreateProperty_Returns_Created_Property();
            }

            // Act
            var result = await controller.GetPropertyBySandM(Guid.Empty, Guid.Empty);
            Console.WriteLine(result);

            // Assert
            var notFoundResult = result.Result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }
           
                

        [TestMethod]
        public async Task UpdateProperty_Updates_Property()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            // Ensure property exists
            if (!propertyCreated)
            {
                await CreateProperty_Returns_Created_Property();
            }

            var updatedProperty = new Property
            {
                Id = _PropertyId,
                SpeciesId = _SpeciesId,
                MechanismId = _MechanismId,
                Tolerance = 0.2, // Updated value
                Weight = 1.5,    // Updated value
                Concentration = 0.6,
                Diffusion = 0.02
            };

            // Act
            var result = await controller.UpdateProperty(_PropertyId, updatedProperty);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify the update
            var getResult = await controller.GetPropertyById(_PropertyId);
            var okResult = getResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var property = okResult.Value as Property;
            Assert.IsNotNull(property);
            Assert.AreEqual(0.2, property.Tolerance);
            Assert.AreEqual(1.5, property.Weight);
        }

        [TestMethod]
        public async Task DeleteProperty_Deletes_Property()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            // Ensure property exists
            if (!propertyCreated)
            {
                await CreateProperty_Returns_Created_Property();
            }

            // Act
            var result = await controller.DeleteProperty(_PropertyId);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify deletion
            var getResult = await controller.GetPropertyById(_PropertyId);
            var notFoundResult = getResult.Result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);

            propertyCreated = false; // Since it's deleted
        }

        [TestMethod]
        public async Task GetPropertyById_Returns_NotFound_For_Invalid_Id()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);
            var invalidPropertyId = Guid.NewGuid();

            // Act
            var result = await controller.GetPropertyById(invalidPropertyId);

            // Assert
            var notFoundResult = result.Result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task UpdateProperty_Returns_BadRequest_For_Mismatched_Id()
        {
            // Arrange
            var propertyService = new PropertyService(db);
            var controller = new PropertiesController(propertyService);

            var updatedProperty = new Property
            {
                Id = Guid.NewGuid(), // Different ID
                SpeciesId = _SpeciesId,
                MechanismId = _MechanismId,
                Tolerance = 0.2,
                Weight = 1.5,
                Concentration = 0.6,
                Diffusion = 0.02
            };

            // Act
            var result = await controller.UpdateProperty(_PropertyId, updatedProperty);

            // Assert
            var badRequestResult = result as BadRequestResult;
            Assert.IsNotNull(badRequestResult);
        }




        [ClassCleanup]
        public static void ClassCleanup()
        {
            var db = DBConnection.DataSource;

            // Delete Property if it exists
            if (propertyCreated)
            {
                var propertyService = new PropertyService(db);
                var deleteTask = propertyService.DeletePropertyAsync(_PropertyId);
                deleteTask.Wait();
            }

            // Remove Species from Mechanism
            var logger = new Mock<ILogger<MechanismSpeciesService>>();
            var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
            var mechanismSpeciesTask = mechanismSpeciesService.GetMechanismSpeciesByMechanismIdAsync(_MechanismId);
            mechanismSpeciesTask.Wait();
            var mechanismSpeciesList = mechanismSpeciesTask.Result;

            foreach (var ms in mechanismSpeciesList)
            {
                if (ms.SpeciesId == _SpeciesId)
                {
                    var deleteTask = mechanismSpeciesService.RemoveSpeciesFromMechanismAsync(ms.Id);
                    deleteTask.Wait();
                }
            }

            // Delete Species
            if (speciesCreated)
            {
                var speciesService = new SpeciesService(db);
                var deleteTask = speciesService.DeleteSpeciesAsync(_SpeciesId);
                deleteTask.Wait();
            }

            // Delete Mechanism
            if (mechanismCreated)
            {
                var mechanismService = new MechanismService(db);
                var deleteTask = mechanismService.DeleteMechanismAsync(_MechanismId);
                deleteTask.Wait();
            }

            // Delete Family
            if (familyCreated)
            {
                var familyService = new FamilyService(db);
                var deleteTask = familyService.DeleteFamilyAsync(_FamilyId);
                deleteTask.Wait();
            }
        }



    }
}
