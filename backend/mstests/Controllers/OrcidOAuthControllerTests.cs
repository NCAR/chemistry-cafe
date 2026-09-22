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
    public class OrcidOAuthControllerTests
    {
        readonly ChemistryDbContext ctx = DBConnection.Context;

        private class MockedOrcidOAuthController : OrcidOAuthController 
        {
            public string? NameIdentifier {get; set;}

            public MockedOrcidOAuthController(OrcidOAuthService orcidService, 
                                               UserService userService)
                : base(orcidService, userService) 
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
            var orcidService = new OrcidOAuthService(userService);
            var orcidController = new MockedOrcidOAuthController(orcidService, userService);
            var orcidID = "get-current-user0123456789";
            var name = "current-user";
            var user = await userService.SignInOrcid(orcidID, name);
            orcidController.NameIdentifier = user.Id.ToString();
            var result = await orcidController.GetCurrentUser();
            
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
            var orcidService = new OrcidOAuthService(userService);
            var orcidController = new MockedOrcidOAuthController(orcidService, userService);
            orcidController.NameIdentifier = Guid.NewGuid().ToString();
            var result = await orcidController.GetCurrentUser();
            
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            User? user = okResult.Value as User;
            Assert.IsNull(user);
        }

        [TestMethod]
        public async Task GetCurrentUserNull()
        {
            var userService = new UserService(ctx);
            var orcidService = new OrcidOAuthService(userService);
            var orcidController = new MockedOrcidOAuthController(orcidService, userService);
            var result = await orcidController.GetCurrentUser();
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }
        
        [TestMethod]
        public Task LoginNonnull()
        {
            var userService = new UserService(ctx);
            var orcidService = new OrcidOAuthService(userService);
            var orcidController = new MockedOrcidOAuthController(orcidService, userService);
            Assert.IsNotNull(orcidController.LoginRedirect());
            return Task.CompletedTask;
        }
    }
}
