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
using Microsoft.AspNetCore.Mvc;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class GoogleOAuthControllerTests
    {
        readonly ChemistryDbContext ctx = DBConnection.Context;

        private class MockedGoogleOAuthController : GoogleOAuthController 
        {
            public string? NameIdentifier {get; set;}

            public MockedGoogleOAuthController(GoogleOAuthService googleService, 
                                               UserService userService)
                : base(googleService, userService) 
            {
            }

            protected override string? GetNameIdentifier() 
            {
                return NameIdentifier;
            }
        }

        [TestMethod]
        public async Task GetCurrentUserExists()
        {
            var userService = new UserService(ctx);
            var googleService = new GoogleOAuthService(userService);
            var googleController = new MockedGoogleOAuthController(googleService, userService);
            var googleID = "get-current-user0123456789";
            var email = "get-current-user@test.com";
            var user = await userService.SignIn(googleID, email);
            googleController.NameIdentifier = user.Id.ToString();
            var result = await googleController.GetCurrentUser();
            
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var currentUser = okResult.Value as User;

            await userService.DeleteUserAsync(user.Id, user.Id.ToString());
            Assert.IsNotNull(currentUser);
            Assert.AreEqual(currentUser.Id, user.Id);
        }

        [TestMethod]
        public async Task GetCurrentUserNotExists()
        {
            var userService = new UserService(ctx);
            var googleService = new GoogleOAuthService(userService);
            var googleController = new MockedGoogleOAuthController(googleService, userService);
            googleController.NameIdentifier = Guid.NewGuid().ToString();
            var result = await googleController.GetCurrentUser();
            
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            User? user = okResult.Value as User;
            Assert.IsNull(user);
        }

        [TestMethod]
        public async Task GetCurrentUserNull()
        {
            var userService = new UserService(ctx);
            var googleService = new GoogleOAuthService(userService);
            var googleController = new MockedGoogleOAuthController(googleService, userService);
            var result = await googleController.GetCurrentUser();
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }
        
        [TestMethod]
        public async Task LoginNonnull()
        {
            var userService = new UserService(ctx);
            var googleService = new GoogleOAuthService(userService);
            var googleController = new MockedGoogleOAuthController(googleService, userService);
            Assert.IsNotNull(googleController.LoginRedirect());
        }
    }
}
