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
        static bool userCreated = false;

        // Test data constants
        static string _Username = string.Empty;
        const string _Role = "TestRole";
        const string _Email = "testuser@example.com";
        static DateTime _CreatedDate = DateTime.UtcNow;

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
            userCreated = true;

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
            var controller = new UsersController(userService);

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
            var controller = new UsersController(userService);

            // Ensure user exists
            if (!userCreated)
            {
                await SignIn_Created_User();
            }

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
            var controller = new UsersController(userService);

            // Ensure user exists
            if (!userCreated)
            {
                await SignIn_Created_User();
            }

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
        public async Task UpdateUser_Updates_User()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new UsersController(userService);

            // Ensure user exists
            if (!userCreated)
            {
                await SignIn_Created_User();
            }

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
        public async Task DeleteUser_Deletes_User()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new UsersController(userService);

            // Ensure user exists
            if (!userCreated)
            {
                await SignIn_Created_User();
            }

            // Act
            var result = await controller.DeleteUser(_UserId);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            // Verify deletion
            var getResult = await controller.GetUserById(_UserId);
            var notFoundResult = getResult.Result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);

            userCreated = false; // Since it's deleted
        }

        [TestMethod]
        public async Task GetUserById_Returns_NotFound_For_Invalid_Id()
        {
            // Arrange
            var userService = new UserService(ctx);
            var controller = new UsersController(userService);
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
            var controller = new UsersController(userService);

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

        [ClassCleanup]
        public static void ClassCleanup()
        {
            var ctx = DBConnection.Context;

            // Delete User if it exists
            if (userCreated)
            {
                var userService = new UserService(ctx);
                var deleteTask = userService.DeleteUserAsync(_UserId);
                deleteTask.Wait();
            }
        }
    }
}
