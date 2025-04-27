using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using MySqlConnector;
using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class UsersControllerTests
    {
        readonly ChemistryDbContext ctx = DBConnection.Context;

        // IDs for test data
        static Guid _UserId;

        // Flags to track created data

        // Test data constants
        static string _Username = string.Empty;
        const string _Role = "TestRole";
        const string _Email = "testuser@example.com";
        static DateTime _CreatedDate = DateTime.UtcNow;

        private class MockedUsersController : UsersController
        {
            public MockedUsersController(UserService userService) : base(userService) {}

            protected override string? GetNameIdentifier()
            {
                return _UserId.ToString();
            }
        }

        private class NameController : UsersController
        {
            private string? _NameIdentifer;

            public NameController(UserService userService, string? NameIdentifer) 
                : base(userService) 
            {
                _NameIdentifer = NameIdentifer;
            }

            protected override string? GetNameIdentifier()
            {
                return _NameIdentifer;
            }
        }

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            _Username = "TestUser_" + Guid.NewGuid().ToString();
        }

        [TestMethod]
        public async Task SignIn_Created_User()
        {
            // Arrange
            var userService = new UserService(ctx);

            //Act
            var googleID = System.Guid.NewGuid().ToString();
            var user = await userService.SignIn(googleID, _Email);

            // Store the UserId for cleanup
            _UserId = user.Id;

            // Assert
            Assert.AreEqual(_Email, user.Username);
            Assert.AreEqual(_Email, user.Email);
            Assert.AreEqual(googleID, user.GoogleId);
        }

        [TestMethod]
        public async Task GetUsers_Returns_List()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);

            // Act
            var result = await controller.GetUsers();

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var users = okResult.Value as IEnumerable<User>;
            Assert.IsNotNull(users);
            Assert.IsTrue(users.Any());
        }

        [TestMethod]
        public async Task GetUserById_Returns_User()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);


            // Act
            var result = await controller.GetUserById(_UserId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var user = okResult.Value as User;
            Assert.IsNotNull(user);
            Assert.AreEqual(_UserId, user.Id);
        }

        [TestMethod]
        public async Task GetUserByEmail_Returns_User()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);

            // Act
            var result = await controller.GetUser(_Email);

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var user = okResult.Value as User;
            Assert.IsNotNull(user);
            Assert.AreEqual(_Email, user.Email);
        }

        [TestMethod]
        public async Task GetUserByInvalidEmail()
        {
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);
            var result = await controller.GetUser("invalid@email.what");
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task UpdateUserNotFound()
        {
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);
            var updatedUser = new User
            {
                Id = Guid.NewGuid(),
                Username = _Username,
                Role = _Role,
                Email = _Email,
                CreatedDate = _CreatedDate
            };
            var result = await controller.UpdateUser(updatedUser.Id, updatedUser);
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task UpdateUserUnauthorized()
        {
            var userService = new UserService(ctx);
            var user = await userService.SignIn("temp-id", "temp@email.com");
            var controller = new NameController(userService, user.Id.ToString());
            var updatedUser = new User
            {
                Id = _UserId,
                Username = _Username,
                Role = _Role,
                Email = _Email,
                CreatedDate = _CreatedDate
            };
            var result = await controller.UpdateUser(updatedUser.Id, updatedUser);
            Assert.IsInstanceOfType(result, typeof(StatusCodeResult));
            await controller.DeleteUser(user.Id);
        }

        [TestMethod]
        public async Task UpdateUserParseError()
        {
            var userService = new UserService(ctx);
            var controller = new NameController(userService, "invalid-uuid"); 
            var updatedUser = new User
            {
                Id = _UserId,
                Username = _Username,
                Role = _Role,
                Email = _Email,
                CreatedDate = _CreatedDate
            };
            var result = await controller.UpdateUser(updatedUser.Id, updatedUser);
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task UpdateUserNullNameIdentifer()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new NameController(userService, null);

            var updatedUser = new User
            {
                Id = _UserId,
                Username = _Username,
                Role = _Role,
                Email = _Email,
                CreatedDate = _CreatedDate
            };

            // Act
            var result = await controller.UpdateUser(_UserId, updatedUser);

            // Assert
            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task UpdateUser_Updates_User()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);

            var updatedUser = new User
            {
                Id = _UserId,
                Username = _Username,
                Role = _Role,
                Email = _Email,
                CreatedDate = _CreatedDate
            };

            // Act
            var result = await controller.UpdateUser(_UserId, updatedUser);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify the update
            var getResult = await controller.GetUserById(_UserId);
            var okResult = getResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var user = okResult.Value as User;
            Assert.IsNotNull(user);
            Assert.AreEqual(_Username, user.Username);
        }

        [TestMethod]
        public async Task DeleteUserNotFound()
        {
            var userService = new UserService(ctx);
            var id = Guid.NewGuid();
            var controller = new NameController(userService, id.ToString());
            var result = await controller.DeleteUser(id);
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task DeleteUserUnauthorized()
        {
            var userService = new UserService(ctx);
            var user = await userService.SignIn("temp-id", "temp@email.com");
            var controller = new NameController(userService, user.Id.ToString());
            var result = await controller.DeleteUser(_UserId);
            Assert.IsInstanceOfType(result, typeof(StatusCodeResult));
            await controller.DeleteUser(user.Id);
        }

        [TestMethod]
        public async Task DeleteUserParseError()
        {
            var userService = new UserService(ctx);
            var controller = new NameController(userService, "invalid-uuid"); 
            var result = await controller.DeleteUser(_UserId);
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task DeleteUser_Deletes_User()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);

            // Act
            var result = await controller.DeleteUser(_UserId);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify deletion
            var getResult = await controller.GetUserById(_UserId);
            var notFoundResult = getResult.Result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task DeleteUserNullNameIdentifer()
        {
            var userService = new UserService(ctx);
            var controller = new NameController(userService, null);
            var result = await controller.DeleteUser(_UserId);
            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task GetUserById_Returns_NotFound_For_Invalid_Id()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);
            var invalidUserId = Guid.NewGuid();

            // Act
            var result = await controller.GetUserById(invalidUserId);

            // Assert
            var notFoundResult = result.Result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task UpdateUser_Returns_BadRequest_For_Mismatched_Id()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new MockedUsersController(userService);

            var updatedUser = new User
            {
                Id = Guid.NewGuid(), // Different ID
                Username = _Username,
                Role = _Role,
                Email = _Email,
                CreatedDate = _CreatedDate
            };

            // Act
            var result = await controller.UpdateUser(_UserId, updatedUser);

            // Assert
            var badRequestResult = result as BadRequestResult;
            Assert.IsNotNull(badRequestResult);
        }
    }
}
