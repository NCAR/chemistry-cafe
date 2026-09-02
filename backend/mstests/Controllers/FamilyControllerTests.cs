using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class FamilyControllerTests
    {
        readonly ChemistryDbContext ctx = DBConnection.Context;
        static Guid _Id = new Guid(); 
        static string _Name = "TestFamily";
        static string _Description = "A test family created by FamilyControllerTests.cs.";
        static string _Email = "JunkEmail@TestUsers.com";
        static string _NameIdentifier = Guid.NewGuid().ToString();
        static string _GoogleId = Guid.NewGuid().ToString(); 
        // The above is usually not a GUID when from Google OAuth
        static User? _Owner = null; 
        static DateTime _CreatedDate = DateTime.UtcNow;

        private class MockedFamilyController : FamilyController 
        {
            private string? nameIdentifier;

            public MockedFamilyController(FamilyService service, string? identifer)
                : base(service) 
            {
                nameIdentifier = identifer;
            }

            protected override string? GetNameIdentifier() 
            {
                return nameIdentifier;
            }
        }

        private async Task<FamilyController> CreateSignedInController()
        {
            var userService = new UserService(ctx);
            _Owner = await userService.SignIn(_GoogleId, _Email);
            _NameIdentifier = _Owner.Id.ToString();
            var familyService = new FamilyService(ctx, userService);
            return new MockedFamilyController(familyService, _NameIdentifier);
        }

        private Task<FamilyController> CreateControllerWithName(string nameIdentifier)
        {
            var userService = new UserService(ctx);
            var familyService = new FamilyService(ctx, userService);
            return Task.FromResult<FamilyController>(new MockedFamilyController(familyService, nameIdentifier));
        }

        private Task<FamilyController> CreateSignedOutController()
        {
            var userService = new UserService(ctx);
            var familyService = new FamilyService(ctx, userService);
            return Task.FromResult<FamilyController>(new MockedFamilyController(familyService, null));
        }

        [TestMethod]
        public async Task Get_All_Family()
        {
            // Arrange
            var controller = await CreateSignedInController();

            // Act
            var actionResult = await controller.GetFamilies();

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var familyList = okResult.Value as IEnumerable<FamilyDto>;
            Assert.IsNotNull(familyList);

        }

        [TestMethod]
        public async Task Get_All_Family_Expanded()
        {
            // Arrange
            var controller = await CreateSignedInController();

            // Act
            var actionResult = await controller.GetFamilies(true, _Owner!.Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var familyList = okResult.Value as IEnumerable<FamilyDto>;
            Assert.IsNotNull(familyList);

        }

        [TestMethod]
        public async Task Creates_Family()
        {
            // Arrange
            var controller = await CreateSignedInController();

            var testFamily = new FamilyDto
            {
                Name = _Name,
                Description = _Description
            };

            // Act
            var actionResult = await controller.CreateFamily(testFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));

            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedFamily = createdAtActionResult.Value as FamilyDto;
            Assert.IsNotNull(returnedFamily);

            _Id = returnedFamily.Id;
            Console.WriteLine($"Created Family ID: {_Id}, Name: {returnedFamily.Name}");

            Assert.AreEqual(_Name, returnedFamily.Name);
            Assert.AreEqual(_Description, returnedFamily.Description);
            Assert.AreEqual(_Owner!.Id, returnedFamily.OwnerId);
        }

        [TestMethod]
        public async Task Creates_Family_InvalidNameIdentifer()
        {
            // Arrange
            var controller = await CreateControllerWithName("parse-failure");

            var testFamily = new FamilyDto
            {
                Name = _Name,
                Description = _Description
            };

            // Act
            var actionResult = await controller.CreateFamily(testFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task Creates_Family_InvalidOwner()
        {
            // Arrange
            var controller = await CreateControllerWithName(Guid.NewGuid().ToString());

            var testFamily = new FamilyDto
            {
                Name = _Name,
                Description = _Description
            };

            // Act
            var actionResult = await controller.CreateFamily(testFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task Creates_Family_NameIdentifierNull()
        {
            // Arrange
            var controller = await CreateSignedOutController();

            var testFamily = new FamilyDto
            {
                Name = _Name,
                Description = _Description
            };

            // Act
            var actionResult = await controller.CreateFamily(testFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task Updates_Family_NameIdentifierNull()
        {
            // Arrange
            var controller = await CreateSignedOutController();

            var testFamily = new FamilyDto
            {
                Id = _Id,
                Name = _Name,
                Description = _Description
            };

            // Act
            var actionResult = await controller.UpdateFamily(_Id, testFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task Delete_Family_NameIdentifierNull()
        {
            // Arrange
            var controller = await CreateSignedOutController();

            var testFamily = new FamilyDto
            {
                Name = _Name,
                Description = _Description
            };

            // Act
            var actionResult = await controller.DeleteFamily(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task Get_Family_Given_ID()
        {
            // Arrange
            var controller = await CreateSignedInController();

            // Act
            var actionResult = await controller.GetFamily(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedFamily = okResult.Value as FamilyDto;
            Assert.IsNotNull(returnedFamily);

            Assert.AreEqual(_Id, returnedFamily.Id);
            Assert.AreEqual(_Name, returnedFamily.Name);
            Assert.AreEqual(_Description, returnedFamily.Description);
            Assert.AreEqual(_Owner!.Id, returnedFamily.OwnerId);
        }

        [TestMethod]
        public async Task Updates_Family()
        {
            // Arrange
            var controller = await CreateSignedInController();

            string newName = "UpdatedTestFamily";
            string newDescription = "An updated test family.";

            Console.Out.WriteLine(_Id);
            Assert.IsNotNull(_Owner);
            var updatedFamily = new FamilyDto
            {
                Id = _Id,
                Name = newName,
                Description = newDescription,
                OwnerId = _Owner.Id
            };

            // Act
            await controller.UpdateFamily(_Id, updatedFamily);
            var actionResult = await controller.GetFamily(_Id);

            // Assert
            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedFamily = okResult.Value as FamilyDto;
            Assert.IsNotNull(returnedFamily);

            Assert.AreEqual(_Id, returnedFamily.Id);
            Assert.AreEqual(newName, returnedFamily.Name);
            Assert.AreEqual(newDescription, returnedFamily.Description);
            Assert.AreEqual(_Owner!.Id, returnedFamily.OwnerId);
        }

        [TestMethod]
        public async Task Updates_Family_mismatchedId()
        {
            // Arrange
            var controller = await CreateSignedInController();

            string newName = "UpdatedTestFamily";
            string newDescription = "An updated test family.";

            Assert.IsNotNull(_Owner);
            var updatedFamily = new FamilyDto
            {
                Id = new Guid("cccccccc-dddd-eeee-ffff-111111111111"),
                Name = newName,
                Description = newDescription,
                OwnerId = _Owner.Id
            };

            // Act
            var actionResult = await controller.UpdateFamily(_Id, updatedFamily);

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task Update_Family_Unauthorized()
        {
            var controller = await CreateControllerWithName(Guid.NewGuid().ToString());
            var testFamily = new FamilyDto
            {
                Id = _Id,
                Name = _Name,
                Description = _Description
            };
            var findResult = await controller.UpdateFamily(_Id, testFamily);
            Assert.IsInstanceOfType(findResult, typeof(StatusCodeResult));
        }

        [TestMethod]
        public async Task Update_Family_NotExist()
        {
            var controller = await CreateSignedInController();
            var testFamily = new FamilyDto
            {
                Id = Guid.NewGuid(),
                Name = _Name,
                Description = _Description
            };
            var findResult = await controller.UpdateFamily(testFamily.Id, testFamily);
            Assert.IsInstanceOfType(findResult, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task Delete_Family_Unauthorized()
        {
            var controller = await CreateControllerWithName(Guid.NewGuid().ToString());
            var findResult = await controller.DeleteFamily(_Id);
            Assert.IsInstanceOfType(findResult, typeof(StatusCodeResult));
        }

        [TestMethod]
        public async Task Delete_Family_NotExist()
        {
            var controller = await CreateSignedInController();
            var findResult = await controller.DeleteFamily(Guid.NewGuid());
            Assert.IsInstanceOfType(findResult, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task Delete_Family()
        {
            // Arrange
            var controller = await CreateSignedInController();

            // Act
            var findResult = await controller.GetFamily(_Id);
            Assert.IsNotNull(findResult);
            Assert.IsInstanceOfType(findResult.Result, typeof(OkObjectResult));

            await controller.DeleteFamily(_Id);

            var findDeletedResult = await controller.GetFamily(_Id);

            // Assert
            Assert.IsInstanceOfType(findDeletedResult.Result, typeof(NotFoundResult));
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            var ctx = DBConnection.Context;
            if (_Owner != null) 
            {
                var userService = new UserService(ctx);
                userService.DeleteUserAsync(_Owner.Id, _Owner.Id.ToString()).Wait();
                var familyService = new FamilyService(ctx, userService);
                familyService.DeleteFamilyAsync(_Id, _NameIdentifier).Wait();
            }
        }
    }
}
